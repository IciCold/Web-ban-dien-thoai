// --- Import các hàm cần thiết ---
import { showalert } from './alert.js';
import { clearUserCart,formatVND,getCurrentUserObject } from './cart.js'; // Hàm xóa giỏ hàng
import { docdulieuLocalStorage, ghidulieuLocalStorage } from './readandwrite.js';

// --- Biến toàn cục để lưu trữ dữ liệu thanh toán ---
// Biến này sẽ giữ thông tin (sản phẩm, tổng tiền) được gửi từ trang giỏ hàng.
let currentPaymentData = null;

// --- Khai báo biến DOM chính (sẽ gán giá trị sau) ---
let itemListContainer = null;
let totalAmountSpan = null;
let finalBuyButton = null;
let addressInput = null;
let paymentMethodsContainer = null;
let cardInfoBox = null;
let cardNameInput = null;
let cardNumberInput = null;

/*
 * Được gọi bởi main.js khi hash là #thanhtoan
 */
export function initThanhToanPage() {
  console.log("Khởi tạo trang thanh toán...");
  
  // Lấy DOM Elements (lấy tại đây để đảm bảo chúng tồn tại khi trang #thanhtoan được tải)
  // LẤY DOM: <div> chứa danh sách tóm tắt sản phẩm
  itemListContainer = document.getElementById('payment-item-list'); //
  // LẤY DOM: <span> hiển thị tổng tiền
  totalAmountSpan = document.querySelector('.payment-form .total-amount'); //
  // LẤY DOM: Nút "Mua ngay" (nút xác nhận cuối cùng)
  finalBuyButton = document.querySelector('.buy-now-button-large'); //
  // LẤY DOM: <input> địa chỉ giao hàng
  addressInput = document.getElementById('delivery-address'); //
  // LẤY DOM: <div> chứa các nút chọn PTTT
  paymentMethodsContainer = document.querySelector('.payment-methods'); //
  // LẤY DOM: <div> chứa thông tin thẻ (để ẩn/hiện)
  cardInfoBox = document.querySelector('.info'); //
  // LẤY DOM: <input> tên chủ thẻ
  cardNameInput = document.getElementById('card-name'); //
  // LẤY DOM: <input> số thẻ
  cardNumberInput = document.getElementById('card-number'); //

  // 1. Lấy dữ liệu "cầu nối" từ localStorage
  // Dữ liệu này được 'cart-page.js' lưu vào trước khi chuyển trang
  const data = docdulieuLocalStorage('paymentData'); //
  
  // 2. Kiểm tra dữ liệu
  // Nếu không có data, hoặc data là mảng rỗng, hoặc không có 'items'
  if (!data || Array.isArray(data) || !data.items || data.items.length === 0) { //
    showalert("Lỗi: Không tìm thấy dữ liệu thanh toán. Quay về trang chủ.","error");
    location.hash = 'home'; // Đẩy về trang chủ
    return;
  }
  
  // 3. *** Logic quan trọng: Xóa ngay lập tức ***
  // Sau khi lấy được dữ liệu, xóa nó khỏi localStorage ngay.
  // Tránh trường hợp user F5 lại trang và dữ liệu bị xử lý 2 lần.
  ghidulieuLocalStorage('paymentData', []); // Ghi mảng rỗng
  
  // 4. Lưu data vào biến toàn cục để các hàm khác trên trang này sử dụng.
  currentPaymentData = data; //
  
  // 5. "Vẽ" lại giao diện (Render)
  if (!itemListContainer || !totalAmountSpan) {
    console.error("Không tìm thấy phần tử DOM của trang thanh toán.");
    return;
  }

  // 5a. Xóa item cũ (phòng trường hợp render lại)
  itemListContainer.innerHTML = ''; //

  // 5b. Lặp qua các sản phẩm trong 'currentPaymentData' và thêm vào list
  currentPaymentData.items.forEach(item => { //
    const itemHTML = `
      <p class="order-item">
        ${item.quantity} x ${item.name} 
        </p>
    `;
    itemListContainer.innerHTML += itemHTML; //
  });

  // 5c. Cập nhật tổng số tiền
  totalAmountSpan.textContent = formatVND(currentPaymentData.total); //

  // 6. Gọi các hàm helper để cài đặt phần còn lại của trang.
  autoFillUserInfo(); // Tự điền địa chỉ, tên thẻ
  setupPaymentMethodToggle(); // Cài đặt sự kiện cho các nút chọn PTTT
  setupBuyNowButton(); // Gắn sự kiện cho nút "Mua Ngay" cuối cùng
}

/**
 * Gắn sự kiện cho nút Mua Ngay (dùng "trick" clone-replace)
 */
function setupBuyNowButton() {
  if (finalBuyButton) {
    // 1. Clone (sao chép) cái nút.
    const newButton = finalBuyButton.cloneNode(true); //
    // 2. Thay thế nút cũ bằng nút mới (nút mới này chưa có sự kiện nào).
    finalBuyButton.parentNode.replaceChild(newButton, finalBuyButton); //
    // 3. Cập nhật lại biến 'finalBuyButton' để trỏ tới nút mới
    finalBuyButton = newButton; 
    
    // 4. Gắn sự kiện 'click' MỘT LẦN DUY NHẤT cho nút mới.
    finalBuyButton.addEventListener('click', (e) => { //
        e.preventDefault(); // Ngăn hành vi mặc định của nút (nếu có)
        saveOrderAndCheckout(); // Gọi hàm xử lý chính
    });
  }
}


/**
 * HÀM LƯU ĐƠN HÀNG
 * Được gọi khi nhấn nút Mua Ngay
 */
function saveOrderAndCheckout() {
  const currentUser = getCurrentUserObject(); // Lấy thông tin user hiện tại
  if (!currentUser) {
    showalert("Vui lòng đăng nhập để mua hàng","warning");
    location.hash = 'login';
    return;
  }
  
  // 1. Kiểm tra lại dữ liệu thanh toán (lấy từ biến toàn cục)
  if (!currentPaymentData || !currentPaymentData.items || currentPaymentData.items.length === 0) { //
       showalert("Lỗi: Không có sản phẩm nào để thanh toán.","error");
       return;
  }

  // 2. Lấy thông tin từ Form
  // LẤY DOM: Tìm nút PTTT đang có class 'active'
  const selectedPaymentBtn = document.querySelector('.payment-button.active'); //
  if (!selectedPaymentBtn) {
      showalert("Vui lòng chọn phương thức thanh toán!","warning");
      return;
  }
  const selectedPayment = selectedPaymentBtn.textContent.trim(); // Lấy text (Momo, Visa...)
  const deliveryAddress = addressInput.value.trim(); // Lấy địa chỉ

  // Validate địa chỉ
  if (!deliveryAddress) { //
      showalert("Vui lòng nhập địa chỉ giao hàng!","warning");
      addressInput.focus(); // Focus vào ô input địa chỉ
      return;
  }
  
  // 3. Tạo đối tượng đơn hàng (newOrder)
  const newOrder = {
      id: 'ORD_' + Date.now(), // Tạo ID đơn hàng duy nhất bằng timestamp
      customer: currentUser.fullName, // Tên khách
      customerEmail: currentUser.email, // Email khách
      // Map lại mảng sản phẩm cho gọn gàng
      products: currentPaymentData.items.map(item => ({ //
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '' // Lấy ảnh (hoặc chuỗi rỗng nếu không có)
      })),
      total: currentPaymentData.total, // Tổng tiền
      status: 'pending', // Trạng thái: chờ xử lý
      date: new Date().toISOString(), // Ngày đặt hàng (chuẩn ISO)
      paymentMethod: selectedPayment, // Phương thức thanh toán
      deliveryAddress: deliveryAddress // Địa chỉ giao
  };

  // 4. Lưu đơn hàng vào localStorage
  const orders = docdulieuLocalStorage('orders'); // Lấy danh sách 'orders' cũ
  orders.push(newOrder); // Thêm đơn hàng mới vào danh sách
  ghidulieuLocalStorage('orders', orders); // Lưu lại danh sách đã cập nhật
  
  // 5a. Nếu đơn hàng này đến từ giỏ hàng (kiểm tra 'type')
  if (currentPaymentData.type === 'cart') { //
      clearUserCart(); // <-- Gọi hàm import từ 'cart.js' để XÓA giỏ hàng
      // Bắn ra sự kiện 'cartUpdated'
      // Để 'cart.js' (popup header) lắng nghe và render lại (thành rỗng)
      window.dispatchEvent(new Event('cartUpdated')); //
  }

  // 6. Thông báo và chuyển trang
  showalert(`🎉 THANH TOÁN THÀNH CÔNG!\n
📦 Mã đơn hàng: ${newOrder.id}
💰 Tổng tiền: ${formatVND(newOrder.total)}
🏠 Địa chỉ giao: ${newOrder.deliveryAddress}\n
Cảm ơn bạn đã mua hàng!`,"success"); //
  
  currentPaymentData = null; // Xóa dữ liệu thanh toán tạm thời
  location.hash = 'home'; // Chuyển về trang chủ
}

// ===============================================
// CÁC HÀM TIỆN ÍCH (riêng của trang này)
// ===============================================

// Hàm gộp lại logic tự động điền thông tin
function autoFillUserInfo() {
  const currentUser = getCurrentUserObject(); //
  if (!currentUser) return; // Nếu không có user, dừng lại

  try {
    // Lấy danh sách địa chỉ (hoặc mảng rỗng nếu không có)
    const userAddressList = currentUser.addressList || []; //

    // 1. Điền địa chỉ
    if (addressInput && userAddressList.length > 0) { //
      // Tìm địa chỉ 'isDefault' (mặc định)
      const defaultAddr = userAddressList.find(addr => addr.isDefault) || userAddressList[0]; // Nếu không có, lấy cái đầu tiên
      if (defaultAddr) {
        addressInput.value = defaultAddr.specific; // Gán vào ô input
      }
    }
    
    // 2. Điền thông tin thẻ
    if (cardNameInput) { //
        // Tự điền tên chủ thẻ là tên user
        cardNameInput.value = currentUser.fullName || currentUser.userName || ""; //
    }
    
  } catch (e) {
    console.error("Lỗi khi tự động điền thông tin thanh toán:", e);
  }
}

// Hàm gộp logic xử lý Phương Thức Thanh Toán (PTTT)
function setupPaymentMethodToggle() {
  if (!paymentMethodsContainer || !cardInfoBox) return; //
  
  const currentUser = getCurrentUserObject(); //
  // Lấy danh sách ngân hàng của user (hoặc mảng rỗng)
  const userBankingList = (currentUser && currentUser.bankingList) ? currentUser.bankingList : []; //
  
  // LẤY DOM (nhiều): Lặp qua tất cả các nút PTTT (Cash, Visa, Momo...)
  paymentMethodsContainer.querySelectorAll('.payment-button').forEach(btn => { //
    // Dùng "trick" clone-và-thay-thế để xóa listener cũ (nếu có)
    const newBtn = btn.cloneNode(true); //
    btn.parentNode.replaceChild(newBtn, btn); //

    // Gắn listener mới
    newBtn.addEventListener('click', function () { //
        // LẤY DOM (nhiều): Xóa class 'active' khỏi TẤT CẢ các nút
        paymentMethodsContainer.querySelectorAll('.payment-button').forEach(b => b.classList.remove('active')); //
        // 2. Thêm class 'active' cho nút VỪA ĐƯỢC CLICK (dùng 'this')
        this.classList.add('active'); //

        // 3. Xử lý ẩn/hiện ô nhập thông tin thẻ
        if (this.classList.contains('visa')) { //
            cardInfoBox.style.display = 'block'; // Hiện ô
            if (cardNameInput && currentUser) cardNameInput.value = currentUser.fullName || ''; //
            // Tự điền số thẻ
            if (cardNumberInput && userBankingList.length > 0) { //
                const defaultBank = userBankingList.find(b => b.isDefault) || userBankingList[0]; //
                if(defaultBank) cardNumberInput.value = defaultBank.account; //
            }
        } else if (this.classList.contains('momo')) { //
            cardInfoBox.style.display = 'block'; // Hiện ô
            if (cardNameInput && currentUser) cardNameInput.value = currentUser.fullName || ''; //
            // Tự điền SĐT Momo (nếu có)
            if (cardNumberInput && currentUser) cardNumberInput.value = currentUser.phone || ''; //
        } else {
            // (Trường hợp là Cash)
            cardInfoBox.style.display = 'none'; // Ẩn ô
        }
    });
  });
  
  // Set default là cash (thanh toán khi nhận hàng)
  // LẤY DOM: Nút "Cash"
  const cashButton = paymentMethodsContainer.querySelector('.payment-button.cash'); //
  if(cashButton) {
      // Chỉ 'click' tự động nếu chưa có nút nào 'active'
      // LẤY DOM: Kiểm tra xem có nút nào đang 'active' không
      if (!paymentMethodsContainer.querySelector('.payment-button.active')) { //
          cashButton.click(); // Giả lập một cú click để chọn Cash làm mặc định
      }
  }
}