// File: cart.js

// ======================================================
// === PHẦN 1: HÀM HỖ TRỢ DÙNG CHUNG (EXPORTED) ===
// (Di chuyển ra ngoài để cart-page.js có thể import)
// ======================================================

/**
 * Kiểm tra xem người dùng đã đăng nhập hay chưa.
 * @returns {boolean} True nếu đã đăng nhập, False nếu chưa.
 */
export function isUserLoggedIn() {
  return localStorage.getItem("currentUser") !== null;
}

/**
 * Lấy username của người dùng đang đăng nhập.
 * @returns {string|null} Trả về username, hoặc null nếu không ai đăng nhập.
 */
export function getCurrentUsername() {
  if (!isUserLoggedIn()) {
    return null;
  }
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user.userName; // Giả sử object user có key là 'userName'
}

/**
 * Lấy giỏ hàng của ĐÚNG user đang đăng nhập.
 * @returns {Array} Mảng giỏ hàng của user (hoặc mảng rỗng [] nếu chưa có).
 */
export function getUserCart() {
  const username = getCurrentUsername();
  if (!username) {
    return []; // Nếu không đăng nhập, trả về giỏ hàng trống
  }
  const cartKey = 'cart_' + username;
  return JSON.parse(localStorage.getItem(cartKey)) || [];
}

/**
 * Lưu mảng giỏ hàng (biến 'cart') vào localStorage cho user hiện tại.
 * @param {Array} cart - Mảng giỏ hàng cần lưu.
 */
export function saveUserCart(cart) {
  const username = getCurrentUsername();
  if (!username) {
    return; // Không thể lưu nếu không đăng nhập
  }
  const cartKey = 'cart_' + username;
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

/**
 * Xóa giỏ hàng của user hiện tại (thường dùng sau khi thanh toán).
 */
export function clearUserCart() {
  const username = getCurrentUsername();
  if (username) {
    const cartKey = 'cart_' + username;
    localStorage.removeItem(cartKey);
  }
}

/**
 * Định dạng một SỐ thành chuỗi tiền tệ VND (ví dụ: 10000 -> 10.000 ₫)
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
 * Chuyển đổi một CHUỖI tiền tệ VND về SỐ (ví dụ: "10.000.000 VND" -> 10000000)
 */
export function parseVNDPrice(priceText) {
  if (!priceText) return 0;
  // Xóa "VND", "₫", và tất cả dấu chấm
  const numericString = priceText.replace(/[\.,₫VND]/g, '').trim();
  return parseInt(numericString) || 0;
}


// ======================================================
// === PHẦN 2: LOGIC POPUP GIỎ HÀNG (HEADER) ===
// (Bọc trong 'DOMContentLoaded' để đảm bảo HTML đã tải)
// ======================================================
document.addEventListener('DOMContentLoaded', () => {

  // === 1. LẤY CÁC PHẦN TỬ HTML (CHO POPUP) ===
  const addToCartBtn = document.querySelector('.add-to-cart-button'); 
  const cartItemsList = document.getElementById('cart-items-list'); 
  const cartEmptyMsg = document.getElementById('cart-empty-msg');
  const cartWrapper = document.querySelector('.cart-wrapper');
  const cartIcon = document.getElementById('icon-cart');
  const cartPopup = document.getElementById('cart-popup');
  const toastOverlay = document.getElementById('toast-overlay');
  const toastText = document.getElementById('toast-text-content');
  
  // *** THÊM NÚT "XEM GIỎ HÀNG" ***
  const viewCartBtn = document.querySelector('.view-cart-btn');

  
  // === 2. HÀM XỬ LÝ THÔNG BÁO (TOAST) ===
  function showSuccessToast(message) {
    if (!toastOverlay || !toastText) return; 

    toastText.textContent = message;
    toastOverlay.classList.add('active');

    setTimeout(() => {
      toastOverlay.classList.remove('active');
    }, 1500);
  }

  // === 3. HÀM "VẼ" (RENDER) LẠI POPUP GIỎ HÀNG ===
  function renderCart() {
    const cart = getUserCart();
    
    if (!cartItemsList || !cartEmptyMsg) return; // Bảo vệ
    
    cartItemsList.innerHTML = ''; // Xóa sạch nội dung cũ

    if (!isUserLoggedIn() || cart.length === 0) {
      cartEmptyMsg.style.display = 'block';
    } else {
      cartEmptyMsg.style.display = 'none';
      
      cart.forEach(item => {
        // *** SỬA: Dùng formatVND để hiển thị giá từ SỐ ***
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

  // === 4. HÀM XỬ LÝ "THÊM VÀO GIỎ HÀNG" ===
  function handleAddToCart() {
    const productSection = document.getElementById("productSection");
    
    // Thu thập thông tin
    const productName = productSection.querySelector('.product-title').textContent.trim();
    const productPriceText = productSection.querySelector('.product-price').textContent.trim(); // Lấy dạng chuỗi
    const productImage = productSection.querySelector('.product-image').src;
    const productQuantity = parseInt(productSection.querySelector('.qty-input').value, 10);
    const productId = productSection.dataset.currentId;

    // *** SỬA QUAN TRỌNG: Chuyển giá về SỐ trước khi lưu ***
    const productPrice = parseVNDPrice(productPriceText);

    let cart = getUserCart();
    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += productQuantity;
    } else {
      const product = {
        id: productId,
        name: productName,
        price: productPrice, // *** LƯU GIÁ DẠNG SỐ ***
        image: productImage,
        quantity: productQuantity
      };
      cart.push(product);
    }

    saveUserCart(cart);
    renderCart(); // Cập nhật lại giao diện popup
    showSuccessToast('Đã thêm vào Giỏ hàng!');
  }


  // === 5. GẮN KẾT SỰ KIỆN (EVENT LISTENERS) ===

  // Nút "Thêm vào giỏ hàng" (ở trang chi tiết)
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (!isUserLoggedIn()) {
        location.hash = '#login';
        return; 
      }
      handleAddToCart();
    });
  }

  // Icon giỏ hàng (mở popup)
  if (cartIcon && cartPopup && cartWrapper) {
    cartIcon.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!isUserLoggedIn()) {
        alert('Bạn cần đăng nhập để xem giỏ hàng.');
        location.hash = '#login';
        return;
      }
      cartPopup.classList.toggle('show');
    });
  }

  // Đóng popup khi click ra bên ngoài
  document.addEventListener('click', (event) => {
    if (cartPopup && cartPopup.classList.contains('show') && !cartWrapper.contains(event.target)) {
      cartPopup.classList.remove('show');
    }
  });

  // Đóng toast khi click vào nền mờ
  if (toastOverlay) {
    toastOverlay.addEventListener('click', (event) => {
      if (event.target === toastOverlay) {
        toastOverlay.classList.remove('active');
      }
    });
  }

  // *** THÊM SỰ KIỆN CHO NÚT "XEM GIỎ HÀNG" ***
  if (viewCartBtn) {
    viewCartBtn.addEventListener('click', () => {
      location.hash = 'cartDetailPage'; // Chuyển đến trang chi tiết giỏ hàng
      cartPopup.classList.remove('show'); // Đóng popup
    });
  }


  // === 6. KHỞI CHẠY VÀ LẮNG NGHE THAY ĐỔI ===

  renderCart(); // "Vẽ" giỏ hàng 1 lần khi tải trang

  // Lắng nghe Login/Logout
  window.addEventListener('storage', (event) => {
    if (event.key === 'currentUser') {
      renderCart(); 
    }
  });

  // Lắng nghe chuyển trang (hash)
  window.addEventListener('hashchange', () => {
    renderCart();
  });
  
  // Lắng nghe sự kiện TÙY CHỈNH (khi cart-page.js thay đổi giỏ hàng)
  window.addEventListener('cartUpdated', () => {
    renderCart();
  });

});