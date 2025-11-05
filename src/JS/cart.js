// ======================================================
// PHẦN 1: CÁC HÀM TIỆN ÍCH (LOGIC CỐT LÕI)
// (ĐÃ CẬP NHẬT ĐỂ DÙNG READANDWRITE.JS)
// ======================================================
import { showalert } from './alert.js';
import { docdulieuLocalStorage, ghidulieuLocalStorage } from './readandwrite.js';

/**
 * Kiểm tra xem người dùng đã đăng nhập hay chưa.
 * @returns {boolean} True (đã đăng nhập) hoặc False (chưa đăng nhập).
 */
export function isUserLoggedIn() {
  const user = docdulieuLocalStorage("currentUser"); // Trả về [] nếu không có, {obj} nếu có
  // Nếu user KHÔNG phải là mảng (tức là object {user}), thì đã đăng nhập
  return !Array.isArray(user);
}

/**
 * Lấy username của người dùng đang đăng nhập.
 * @returns {string|null} Username (ví dụ: "admin") hoặc null nếu chưa đăng nhập.
 */
export function getCurrentUsername() {
  if (!isUserLoggedIn()) {
    return null;
  }
  const user = docdulieuLocalStorage("currentUser"); // Trả về {obj}
  return user.userName; // Đảm bảo object 'currentUser' có key là 'userName'
}

/**
 * Lấy mảng giỏ hàng từ localStorage cho ĐÚNG user đang đăng nhập.
 * @returns {Array} Mảng các sản phẩm trong giỏ, hoặc mảng rỗng [].
 */
export function getUserCart() {
  const username = getCurrentUsername();
  if (!username) {
    return []; // Trả về giỏ hàng trống nếu không có ai đăng nhập
  }
  const cartKey = 'cart_' + username;
  // Hàm này tự động trả về [] nếu không tìm thấy, rất hoàn hảo
  return docdulieuLocalStorage(cartKey);
}

/**
 * Lưu mảng giỏ hàng (đã cập nhật) vào localStorage cho user hiện tại.
 * @param {Array} cart - Mảng giỏ hàng mới cần lưu.
 */
export function saveUserCart(cart) {
  const username = getCurrentUsername();
  if (!username) {
    return; // Không thể lưu nếu chưa đăng nhập
  }
  const cartKey = 'cart_' + username;
  ghidulieuLocalStorage(cartKey, cart);
}

/**
 * Xóa giỏ hàng của user hiện tại (bằng cách ghi đè mảng rỗng).
 */
export function clearUserCart() {
  const username = getCurrentUsername();
  if (username) {
    const cartKey = 'cart_' + username;
    // Ghi một mảng rỗng vào key để "xóa"
    ghidulieuLocalStorage(cartKey, []);
  }
}

/**
 * Định dạng một SỐ thành chuỗi tiền tệ VND.
 * (Giữ nguyên)
 */
export function formatVND(amount) {
  if (typeof amount !== 'number') {
    amount = 0;
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * Chuyển đổi một CHUỖI tiền tệ (từ giao diện) về dạng SỐ để tính toán.
 * (Giữ nguyên)
 */
export function parseVNDPrice(priceText) {
  if (!priceText) return 0;
  const numericString = priceText.replace(/[\.,₫VND]/g, '').trim();
  return parseInt(numericString) || 0;
}

// ======================================================
// PHẦN 2: LOGIC CHO POPUP GIỎ HÀNG (TRÊN HEADER)
// (Phần này giữ nguyên, nó đã dùng các hàm tiện ích ở trên)
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
  // ... (Toàn bộ code từ dòng 110 đến cuối file giữ nguyên) ...
  // --- 1. Lấy các phần tử DOM cố định trên trang ---
  const addToCartBtn = document.querySelector('.add-to-cart-button'); // Nút ở trang chi tiết
  const cartItemsList = document.getElementById('cart-items-list'); // <ul> trong popup
  const cartEmptyMsg = document.getElementById('cart-empty-msg'); // Thông báo "giỏ hàng trống"
  const cartWrapper = document.querySelector('.cart-wrapper'); // <div> bọc icon và popup
  const cartIcon = document.getElementById('icon-cart'); // Icon giỏ hàng
  const cartPopup = document.getElementById('cart-popup'); // Popup
  const toastOverlay = document.getElementById('toast-overlay'); // Lớp phủ thông báo
  const toastText = document.getElementById('toast-text-content'); // Nội dung thông báo
  const viewCartBtn = document.querySelector('.view-cart-btn'); // Nút "Xem giỏ hàng"

  
  // --- 2. Các hàm xử lý Giao diện (UI) ---
  function showSuccessToast(message) {
    if (!toastOverlay || !toastText) return; 

    toastText.textContent = message;
    toastOverlay.classList.add('active');

    setTimeout(() => {
      toastOverlay.classList.remove('active');
    }, 1500);
  }

  function renderCart() {
    const cart = getUserCart(); 
    
    if (!cartItemsList || !cartEmptyMsg) return; 
    
    cartItemsList.innerHTML = ''; 

    if (!isUserLoggedIn() || cart.length === 0) {
      cartEmptyMsg.style.display = 'block'; 
    } else {
      cartEmptyMsg.style.display = 'none'; 
      
      cart.forEach(item => {
        const itemHTML = `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
              <span class="item-name">${item.name}</span>
              <span class="item-price">${formatVND(item.price)}</span> 
            </div>
            <span class="item-quantity">x ${item.quantity}</span>
          </div>
        `;
        cartItemsList.innerHTML += itemHTML;
      });
    }
  }

  // --- 3. Hàm Xử lý Logic Chính ---
  function handleAddToCart() {
    const productSection = document.getElementById("productSection");
    
    const productName = productSection.querySelector('.product-title').textContent.trim();
    const productPriceText = productSection.querySelector('.product-price').textContent.trim();
    const productImage = productSection.querySelector('.product-image').src;
    const productQuantity = parseInt(productSection.querySelector('.qty-input').value, 10);
    const productId = productSection.dataset.currentId;
    const productPrice = parseVNDPrice(productPriceText);
    let cart = getUserCart();
    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += productQuantity;
    } else {
      const product = {
        id: productId,
        name: productName,
        price: productPrice, 
        image: productImage,
        quantity: productQuantity
      };
      cart.push(product);
    }
    saveUserCart(cart);
    renderCart(); 
    showSuccessToast('Đã thêm vào Giỏ hàng!');
  }


  // --- 4. Gắn các Event Listeners (Bắt sự kiện) ---
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (!isUserLoggedIn()) {
        location.hash = '#login';
        return; 
      }
      handleAddToCart();
    });
  }

  if (cartIcon && cartPopup && cartWrapper) {
    cartIcon.addEventListener('click', (event) => {
      event.stopPropagation(); 
      if (!isUserLoggedIn()) {
        showalert("Bạn cần đăng nhập để xem giỏ hàng.");
        location.hash = '#login';
        return;
      }
      cartPopup.classList.toggle('show');
    });
  }

  document.addEventListener('click', (event) => {
    if (cartPopup && cartPopup.classList.contains('show') && !cartWrapper.contains(event.target)) {
      cartPopup.classList.remove('show');
    }
  });

  if (toastOverlay) {
    toastOverlay.addEventListener('click', (event) => {
      if (event.target === toastOverlay) { 
        toastOverlay.classList.remove('active');
      }
    });
  }

  if (viewCartBtn) {
    viewCartBtn.addEventListener('click', () => {
      location.hash = 'cartDetailPage'; 
      cartPopup.classList.remove('show'); 
    });
  }

  // --- 5. Khởi chạy và Đồng bộ hóa ---
  renderCart(); 
  window.addEventListener('storage', (event) => {
    if (event.key === 'currentUser') {
      renderCart(); 
    }
  });
  window.addEventListener('hashchange', () => {
    renderCart(); 
  });
  window.addEventListener('cartUpdated', () => {
    renderCart();
  });
});