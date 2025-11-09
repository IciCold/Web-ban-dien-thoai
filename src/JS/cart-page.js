// File: JS/cart-page.js

// Import các hàm hỗ trợ đã export từ cart.js
import { showalert } from './alert.js';
import {
  getUserCart,
  saveUserCart,
  clearUserCart,
  formatVND,
  isUserLoggedIn,
  getCurrentUsername 
} from './cart.js';
// Import các hàm đọc/ghi từ readandwrite.js
import { docdulieuLocalStorage, ghidulieuLocalStorage } from './readandwrite.js';

/**
 * Hàm khởi tạo (do router gọi): "Vẽ" (render) toàn bộ trang chi tiết giỏ hàng.
 * (Hàm này giữ nguyên)
 */
export function initCartDetailPage() {
  // ... (Toàn bộ code từ dòng 20 đến 101 giữ nguyên) ...
  const listContainer = document.getElementById('cart-detail-list');
  const footer = document.getElementById('cart-detail-footer');
  const emptyMsg = document.getElementById('cart-detail-empty');
  const totalAmountEl = document.getElementById('cart-grand-total-amount');

  if (!listContainer) return; 

  const cart = getUserCart();
  
  listContainer.innerHTML = '';
  let grandTotal = 0; 

  if (cart.length === 0) {
    footer.style.display = 'none';
    emptyMsg.style.display = 'block';
  } else {
    footer.style.display = 'flex';
    emptyMsg.style.display = 'none';

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      grandTotal += itemTotal; 

      const itemHTML = `
        <div class="cart-detail-item" data-id="${item.id}">
          <div class="item-product-info">
            <img src="${item.image}" alt="${item.name}">
            <span class="item-name">${item.name}</span>
          </div>
          <div class="item-unit-price">${formatVND(item.price)}</div>
          <div class="item-quantity-control">
            <button class="qty-change-btn" data-action="decrease" data-id="${item.id}">-</button>
            <input type="number" value="${item.quantity}" readonly>
            <button class="qty-change-btn" data-action="increase" data-id="${item.id}">+</button>
          </div>
          <div class="item-total-price">${formatVND(itemTotal)}</div>
          <div class="item-actions">
            <button class="item-delete-btn" data-id="${item.id}">Xóa</button>
          </div>
        </div>
      `;
      listContainer.innerHTML += itemHTML;
    });

    totalAmountEl.textContent = formatVND(grandTotal);
    attachCartDetailListeners();
  }
}

/*
 * Gắn sự kiện cho các nút "+", "-", "Xóa", "Mua ngay" trên trang chi tiết.
 */
function attachCartDetailListeners() {
  document.querySelectorAll('.qty-change-btn').forEach(button => {
    button.replaceWith(button.cloneNode(true)); 
  });
  document.querySelectorAll('.qty-change-btn').forEach(button => {
    button.addEventListener('click', handleQuantityChange);
  });

  document.querySelectorAll('.item-delete-btn').forEach(button => {
    button.replaceWith(button.cloneNode(true));
  });
  document.querySelectorAll('.item-delete-btn').forEach(button => {
    button.addEventListener('click', handleDeleteItem);
  });

  const checkoutBtn = document.getElementById('cart-checkout-all-btn');
  if (checkoutBtn) {
    checkoutBtn.replaceWith(checkoutBtn.cloneNode(true));
    document.getElementById('cart-checkout-all-btn').addEventListener('click', handleCheckout);
  }
}

/**
 * Xử lý khi nhấn nút "+" hoặc "-"
 * (Hàm này giữ nguyên)
 */
function handleQuantityChange(event) {
  // ... (Toàn bộ code từ dòng 142 đến 165 giữ nguyên) ...
  const id = event.target.dataset.id;
  const action = event.target.dataset.action;
  
  let cart = getUserCart();
  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex === -1) return; 

  if (action === 'increase') {
    cart[itemIndex].quantity++;
  } else if (action === 'decrease') {
    cart[itemIndex].quantity--;
    if (cart[itemIndex].quantity === 0) {
      cart.splice(itemIndex, 1);
    }
  }

  saveUserCart(cart); 
  initCartDetailPage(); 
  
  window.dispatchEvent(new Event('cartUpdated'));
}

/**
 * Xử lý khi nhấn nút "Xóa"
 * (Hàm này giữ nguyên)
 */
function handleDeleteItem(event) {
  // ... (Toàn bộ code từ dòng 171 đến 188 giữ nguyên) ...
  const id = event.target.dataset.id;
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
    return; 
  }

  let cart = getUserCart();
  const newCart = cart.filter(item => item.id !== id);

  saveUserCart(newCart); 
  initCartDetailPage(); 

  window.dispatchEvent(new Event('cartUpdated'));
}

/**
 * Xử lý khi nhấn nút "Mua Ngay" (ĐÃ CẬP NHẬT)
 */
function handleCheckout() {
  const cart = getUserCart();
  if (cart.length === 0) {
    showalert("Giỏ hàng của bạn đang trống!");
    return;
  }

  // 1. Kiểm tra đăng nhập
  const currentUser = docdulieuLocalStorage("currentUser"); // Dùng helper
  if (!isUserLoggedIn() || Array.isArray(currentUser)) {
      showalert("Bạn cần đăng nhập để thanh toán.","warning");
      location.hash = 'login';
      return;
  }

  // 2. Tính tổng tiền
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // 3. Tạo đối tượng data để gửi qua trang thanh toán
  const paymentData = {
    items: cart, 
    total: total,
    type: 'cart' 
  };

  // 4. Lưu vào localStorage (dùng làm cầu nối)
  ghidulieuLocalStorage('paymentData', paymentData); // Dùng helper

  // 5. Chuyển sang trang thanh toán
  location.hash = 'thanhtoan';
  
  /* * XÓA BỎ PHẦN TẠO ĐƠN HÀNG TẠI ĐÂY
   * (Phần này đã được chuyển qua cart-page.js ở logic cũ,
   * nay chuyển qua thanhtoan.js)
  */
}