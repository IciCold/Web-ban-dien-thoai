// ======================================================
// PHẦN 1: CÁC HÀM TIỆN ÍCH (LOGIC CỐT LÕI)
// Các hàm này được export để cart-page.js và các file khác có thể dùng chung.
// ======================================================

/**
 * Kiểm tra xem người dùng đã đăng nhập hay chưa.
 * @returns {boolean} True (đã đăng nhập) hoặc False (chưa đăng nhập).
 */
export function isUserLoggedIn() {
  return localStorage.getItem("currentUser") !== null;
}

/**
 * Lấy username của người dùng đang đăng nhập.
 * @returns {string|null} Username (ví dụ: "admin") hoặc null nếu chưa đăng nhập.
 */
export function getCurrentUsername() {
  if (!isUserLoggedIn()) {
    return null;
  }
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user.userName; // Đảm bảo object 'currentUser' có key là 'userName'
}

/**
 * Lấy mảng giỏ hàng từ localStorage cho ĐÚNG user đang đăng nhập.
 * Mỗi user sẽ có một key giỏ hàng riêng, ví dụ: "cart_admin", "cart_user1".
 * @returns {Array} Mảng các sản phẩm trong giỏ, hoặc mảng rỗng [].
 */
export function getUserCart() {
  const username = getCurrentUsername();
  if (!username) {
    return []; // Trả về giỏ hàng trống nếu không có ai đăng nhập
  }
  const cartKey = 'cart_' + username;
  return JSON.parse(localStorage.getItem(cartKey)) || [];
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
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

/**
 * Xóa giỏ hàng của user hiện tại khỏi localStorage (thường dùng sau khi thanh toán).
 */
export function clearUserCart() {
  const username = getCurrentUsername();
  if (username) {
    const cartKey = 'cart_' + username;
    localStorage.removeItem(cartKey);
  }
}

/**
 * Định dạng một SỐ thành chuỗi tiền tệ VND.
 * Ví dụ: 10000 -> "10.000 ₫"
 * @param {number} amount - Số tiền cần định dạng.
 * @returns {string} Chuỗi tiền tệ đã định dạng.
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
 * Ví dụ: "23.000.000 VND" -> 23000000
 * @param {string} priceText - Chuỗi giá tiền lấy từ DOM.
 * @returns {number} Số tiền đã được làm sạch.
 */
export function parseVNDPrice(priceText) {
  if (!priceText) return 0;
  // Dùng regex để xóa tất cả ký tự không phải số (dấu chấm, phẩy, ₫, VND)
  const numericString = priceText.replace(/[\.,₫VND]/g, '').trim();
  return parseInt(numericString) || 0;
}


// ======================================================
// PHẦN 2: LOGIC CHO POPUP GIỎ HÀNG (TRÊN HEADER)
// ======================================================

// Chỉ chạy code khi toàn bộ cây DOM đã được tải xong.
document.addEventListener('DOMContentLoaded', () => {

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

  /**
   * Hiển thị thông báo (toast) "Đã thêm vào giỏ hàng".
   * Nó hoạt động bằng cách thêm class 'active' vào overlay, và tự động xóa sau 1.5s.
   * @param {string} message - Nội dung cần hiển thị.
   */
  function showSuccessToast(message) {
    if (!toastOverlay || !toastText) return; 

    toastText.textContent = message;
    toastOverlay.classList.add('active');

    // Tự động ẩn thông báo
    setTimeout(() => {
      toastOverlay.classList.remove('active');
    }, 1500);
  }

  /**
   * "Vẽ" lại toàn bộ nội dung bên trong popup giỏ hàng.
   * Được gọi mỗi khi giỏ hàng thay đổi (thêm, sửa, xóa, login, logout).
   */
  function renderCart() {
    const cart = getUserCart(); // Lấy giỏ hàng mới nhất
    
    // Bảo vệ: Thoát nếu không tìm thấy phần tử (ví dụ: ở trang admin)
    if (!cartItemsList || !cartEmptyMsg) return; 
    
    cartItemsList.innerHTML = ''; // Xóa sạch nội dung cũ

    // Nếu chưa đăng nhập hoặc giỏ hàng rỗng
    if (!isUserLoggedIn() || cart.length === 0) {
      cartEmptyMsg.style.display = 'block'; // Hiện thông báo "trống"
    } else {
      // Nếu có sản phẩm
      cartEmptyMsg.style.display = 'none'; // Ẩn thông báo "trống"
      
      // Lặp qua mảng giỏ hàng và tạo HTML cho mỗi sản phẩm
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

  /**
   * Xử lý logic khi người dùng nhấn nút "Thêm vào giỏ hàng" (ở trang chi tiết).
   */
  function handleAddToCart() {
    const productSection = document.getElementById("productSection");
    
    // 1. Thu thập thông tin sản phẩm từ trang chi tiết (DOM)
    const productName = productSection.querySelector('.product-title').textContent.trim();
    const productPriceText = productSection.querySelector('.product-price').textContent.trim();
    const productImage = productSection.querySelector('.product-image').src;
    const productQuantity = parseInt(productSection.querySelector('.qty-input').value, 10);
    const productId = productSection.dataset.currentId;

    // 2. Chuyển đổi giá từ chuỗi (ví dụ: "10.000.000 VND") về SỐ (10000000)
    const productPrice = parseVNDPrice(productPriceText);

    // 3. Lấy giỏ hàng hiện tại từ localStorage
    let cart = getUserCart();

    // 4. Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
      // 5a. Nếu đã có: Chỉ tăng số lượng
      cart[existingItemIndex].quantity += productQuantity;
    } else {
      // 5b. Nếu chưa có: Thêm sản phẩm mới vào mảng
      const product = {
        id: productId,
        name: productName,
        price: productPrice, // Lưu giá dạng SỐ
        image: productImage,
        quantity: productQuantity
      };
      cart.push(product);
    }

    // 6. Lưu mảng giỏ hàng đã cập nhật trở lại localStorage
    saveUserCart(cart);

    // 7. Cập nhật giao diện
    renderCart(); // "Vẽ" lại popup
    showSuccessToast('Đã thêm vào Giỏ hàng!');
  }


  // --- 4. Gắn các Event Listeners (Bắt sự kiện) ---

  // Bắt sự kiện click nút "Thêm vào giỏ hàng"
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      // Chuyển hướng sang trang login nếu chưa đăng nhập
      if (!isUserLoggedIn()) {
        location.hash = '#login';
        return; 
      }
      handleAddToCart();
    });
  }

  // Bắt sự kiện click vào icon giỏ hàng (để mở popup)
  if (cartIcon && cartPopup && cartWrapper) {
    cartIcon.addEventListener('click', (event) => {
      event.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (gây đóng popup)
      // Yêu cầu đăng nhập trước khi xem
      if (!isUserLoggedIn()) {
        alert('Bạn cần đăng nhập để xem giỏ hàng.');
        location.hash = '#login';
        return;
      }
      // Bật/tắt popup bằng cách thêm/xóa class 'show'
      cartPopup.classList.toggle('show');
    });
  }

  // Bắt sự kiện click vào bất cứ đâu trên trang (để đóng popup)
  document.addEventListener('click', (event) => {
    // Chỉ đóng nếu popup đang mở VÀ click vào bên ngoài popup
    if (cartPopup && cartPopup.classList.contains('show') && !cartWrapper.contains(event.target)) {
      cartPopup.classList.remove('show');
    }
  });

  // Đóng thông báo (toast) khi click vào lớp nền mờ
  if (toastOverlay) {
    toastOverlay.addEventListener('click', (event) => {
      if (event.target === toastOverlay) { // Chỉ đóng khi click vào nền
        toastOverlay.classList.remove('active');
      }
    });
  }

  // Bắt sự kiện click nút "Xem giỏ hàng" (trong popup)
  if (viewCartBtn) {
    viewCartBtn.addEventListener('click', () => {
      // Chuyển hướng đến trang chi tiết giỏ hàng
      location.hash = 'cartDetailPage'; 
      cartPopup.classList.remove('show'); // Đóng popup
    });
  }


  // --- 5. Khởi chạy và Đồng bộ hóa ---

  // 1. "Vẽ" giỏ hàng lần đầu tiên khi trang vừa tải xong
  renderCart(); 

  // 2. Lắng nghe sự kiện 'storage' (khi login/logout ở tab khác)
  window.addEventListener('storage', (event) => {
    if (event.key === 'currentUser') {
      renderCart(); // "Vẽ" lại popup để đồng bộ
    }
  });

  // 3. Lắng nghe sự kiện 'hashchange' (khi chuyển trang)
  window.addEventListener('hashchange', () => {
    renderCart(); // "Vẽ" lại popup (ví dụ: sau khi login thành công)
  });
  
  // 4. Lắng nghe sự kiện tùy chỉnh 'cartUpdated'
  // Sự kiện này được bắn từ file cart-page.js (khi user +/-/Xóa ở trang chi tiết)
  // để popup này tự động cập nhật theo.
  window.addEventListener('cartUpdated', () => {
    renderCart();
  });

});