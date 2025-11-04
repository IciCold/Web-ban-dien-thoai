// ===============================================
// File: thanhtoan.js (ĐÃ CẤU TRÚC LẠI HOÀN TOÀN)
// ===============================================

// --- Import các hàm cần thiết ---
import { clearUserCart } from './cart.js'; 
import { docdulieuLocalStorage, ghidulieuLocalStorage } from './readandwrite.js';

// --- Biến toàn cục để lưu trữ dữ liệu thanh toán ---
let currentPaymentData = null;

// --- Lấy các phần tử DOM chính ---
// (Phải lấy lại bên trong hàm init vì DOM có thể chưa sẵn sàng)
let itemListContainer = null;
let totalAmountSpan = null;
let finalBuyButton = null;
let addressInput = null;
let paymentMethodsContainer = null;
let cardInfoBox = null;
let cardNameInput = null;
let cardNumberInput = null;

/**
 * HÀM KHỞI TẠO TRANG THANH TOÁN (Hàm mới)
 * Được gọi bởi router.js khi hash là #thanhtoan
 */
export function initThanhToanPage() {
  console.log("Khởi tạo trang thanh toán...");
  
  // Lấy DOM Elements (lấy tại đây để đảm bảo chúng tồn tại)
  itemListContainer = document.getElementById('payment-item-list');
  totalAmountSpan = document.querySelector('.payment-form .total-amount');
  finalBuyButton = document.querySelector('.buy-now-button-large');
  addressInput = document.getElementById('delivery-address');
  paymentMethodsContainer = document.querySelector('.payment-methods');
  cardInfoBox = document.querySelector('.info');
  cardNameInput = document.getElementById('card-name');
  cardNumberInput = document.getElementById('card-number');

  // 1. Lấy dữ liệu từ localStorage
  const data = docdulieuLocalStorage('paymentData'); // Dùng helper
  
  // 2. Kiểm tra dữ liệu
  // (Nếu data là [] (do hàm docdulieu) hoặc không có items)
  if (!data || Array.isArray(data) || !data.items || data.items.length === 0) {
    alert("Lỗi: Không tìm thấy dữ liệu thanh toán. Quay về trang chủ.");
    location.hash = 'home';
    return;
  }
  
  // 3. Xóa ngay lập tức để tránh lỗi khi tải lại trang
  ghidulieuLocalStorage('paymentData', []); // Ghi mảng rỗng
  
  // 4. Parse data và lưu vào biến toàn cục
  currentPaymentData = data;
  
  // 5. "Vẽ" lại giao diện (Render)
  if (!itemListContainer || !totalAmountSpan) {
    console.error("Không tìm thấy phần tử DOM của trang thanh toán.");
    return;
  }

  // 5a. Xóa item cũ (nếu có)
  itemListContainer.innerHTML = '';

  // 5b. Thêm item mới
  currentPaymentData.items.forEach(item => {
    const itemHTML = `
      <p class="order-item">
        ${item.quantity} x ${item.name} 
        </p>
    `;
    itemListContainer.innerHTML += itemHTML;
  });

  // 5c. Cập nhật tổng tiền
  totalAmountSpan.textContent = formatToVND(currentPaymentData.total);

  // 6. Tự động điền thông tin và gắn sự kiện
  autoFillUserInfo();
  setupPaymentMethodToggle();
  setupBuyNowButton(); // Gắn sự kiện nút Mua Ngay
}

/**
 * Gắn sự kiện cho nút Mua Ngay
 */
function setupBuyNowButton() {
  if (finalBuyButton) {
    // Dùng replaceWith để xóa các listener cũ (nếu có) và gắn listener mới
    const newButton = finalBuyButton.cloneNode(true);
    finalBuyButton.parentNode.replaceChild(newButton, finalBuyButton);
    
    newButton.addEventListener('click', (e) => {
        e.preventDefault();
        saveOrderAndCheckout();
    });
  }
}


/**
 * HÀM LƯU ĐƠN HÀNG (Sửa lại)
 * Được gọi khi nhấn nút Mua Ngay
 */
function saveOrderAndCheckout() {
  const currentUser = getCurrentUser(); // Dùng helper đã sửa
  if (!currentUser) {
    alert('Vui lòng đăng nhập để mua hàng');
    location.hash = 'login';
    return;
  }
  
  // 1. Kiểm tra dữ liệu thanh toán
  if (!currentPaymentData || !currentPaymentData.items || currentPaymentData.items.length === 0) {
       alert('Lỗi: Không có sản phẩm nào để thanh toán.');
       return;
  }

  // 2. Lấy thông tin từ Form
  const selectedPaymentBtn = document.querySelector('.payment-button.active');
  if (!selectedPaymentBtn) {
      alert('Vui lòng chọn phương thức thanh toán!');
      return;
  }
  const selectedPayment = selectedPaymentBtn.textContent.trim();
  const deliveryAddress = addressInput.value.trim();

  if (!deliveryAddress) {
      alert('Vui lòng nhập địa chỉ giao hàng!');
      addressInput.focus();
      return;
  }
  
  // 3. Tạo đối tượng đơn hàng
  const newOrder = {
      id: 'ORD_' + Date.now(),
      customer: currentUser.fullName,
      customerEmail: currentUser.email,
      products: currentPaymentData.items.map(item => ({ 
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '' 
      })),
      total: currentPaymentData.total,
      status: 'pending', 
      date: new Date().toISOString(),
      paymentMethod: selectedPayment,
      deliveryAddress: deliveryAddress
  };

  // 4. Lưu đơn hàng vào localStorage
  const orders = docdulieuLocalStorage('orders'); // Dùng helper
  orders.push(newOrder);
  ghidulieuLocalStorage('orders', orders); // Dùng helper

  // 5. Xử lý sau khi thanh toán
  
  // 5a. Nếu là mua từ giỏ hàng, thì XÓA giỏ hàng
  if (currentPaymentData.type === 'cart') {
      clearUserCart(); // <-- Gọi hàm đã import (và đã được sửa)
      window.dispatchEvent(new Event('cartUpdated')); 
  }

  // 6. Thông báo và chuyển trang
  alert(`✅ THANH TOÁN THÀNH CÔNG!\n
📦 Mã đơn hàng: ${newOrder.id}
💰 Tổng tiền: ${formatToVND(newOrder.total)}
🏠 Địa chỉ giao: ${newOrder.deliveryAddress}\n
Cảm ơn bạn đã mua hàng!`);
  
  currentPaymentData = null;
  location.hash = 'home';
}

// ===============================================
// CÁC HÀM TIỆN ÍCH (Đã cập nhật)
// ===============================================

function formatToVND(number) {
  if (typeof number !== 'number') number = 0;
  return number.toLocaleString('vi-VN') + ' VND';
}

function getCurrentUser() {
    try {
        const user = docdulieuLocalStorage("currentUser"); // Dùng helper
        // Nếu không tìm thấy, helper trả về [], ta trả về null
        if (Array.isArray(user) && user.length === 0) {
            return null; 
        }
        return user; // Trả về object user
    } catch (error) {
        console.error('Lỗi khi lấy thông tin user:', error);
        return null;
    }
}

// Hàm gộp lại logic tự động điền thông tin
function autoFillUserInfo() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  try {
    // Dùng helper
    const userAddressList = docdulieuLocalStorage("userAddressList");
    const userBankingList = docdulieuLocalStorage("userBankingList");

    // 1. Điền địa chỉ
    if (addressInput && userAddressList.length > 0) {
      const defaultAddr = userAddressList.find(addr => addr.isDefault) || userAddressList[0];
      if (defaultAddr) {
        addressInput.value = defaultAddr.specific;
      }
    }
    
    // 2. Điền thông tin thẻ
    if (cardNameInput) {
        cardNameInput.value = currentUser.fullName || currentUser.userName || "";
    }
    
  } catch (e) {
    console.error("Lỗi khi tự động điền thông tin thanh toán:", e);
  }
}

// Hàm gộp logic xử lý PTTT
function setupPaymentMethodToggle() {
  if (!paymentMethodsContainer || !cardInfoBox) return;
  
  const currentUser = getCurrentUser();
  const userBankingList = docdulieuLocalStorage("userBankingList"); // Dùng helper
  
  paymentMethodsContainer.querySelectorAll('.payment-button').forEach(btn => {
    // Xóa listener cũ (nếu có) bằng cách clone
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    // Gắn listener
    newBtn.addEventListener('click', function () {
        paymentMethodsContainer.querySelectorAll('.payment-button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        if (this.classList.contains('visa')) {
            cardInfoBox.style.display = 'block';
            if (cardNameInput && currentUser) cardNameInput.value = currentUser.fullName || '';
            if (cardNumberInput && userBankingList.length > 0) {
                const defaultBank = userBankingList.find(b => b.isDefault) || userBankingList[0];
                if(defaultBank) cardNumberInput.value = defaultBank.account;
            }
        } else if (this.classList.contains('momo')) {
            cardInfoBox.style.display = 'block';
            if (cardNameInput && currentUser) cardNameInput.value = currentUser.fullName || '';
            if (cardNumberInput && currentUser) cardNumberInput.value = currentUser.phone || '';
        } else {
            // (Cash)
            cardInfoBox.style.display = 'none';
        }
    });
  });
  
  // Set default là cash
  const cashButton = paymentMethodsContainer.querySelector('.payment-button.cash');
  if(cashButton) {
      // Chỉ click nếu chưa có nút nào active
      if (!paymentMethodsContainer.querySelector('.payment-button.active')) {
          cashButton.click(); 
      }
  }
}