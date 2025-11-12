// ======================================================
// PHẦN 1: CÁC HÀM TIỆN ÍCH (LOGIC CỐT LÕI)
// ======================================================

// Import các hàm cần thiết từ các file khác.
import { showalert } from './alert.js'; // Hàm để hiển thị thông báo
import { docdulieuLocalStorage, ghidulieuLocalStorage } from './readandwrite.js'; // Hàm đọc/ghi localStorage

/**
 * Kiểm tra xem người dùng đã đăng nhập hay chưa.
 * @returns {boolean} True (đã đăng nhập) hoặc False (chưa đăng nhập).
 */
export function isUserLoggedIn() {
  // Lấy dữ liệu của 'currentUser' từ localStorage.
  const user = docdulieuLocalStorage("currentUser"); //
  
  // Nếu user KHÔNG phải là mảng (tức là một object {user} đã đăng nhập), thì trả về true.
  // Nếu user là mảng (tức là [] vì chưa đăng nhập), thì trả về false.
  return !Array.isArray(user); //
}

/**
 * Lấy username của người dùng đang đăng nhập.
 * @returns {string|null} Username (ví dụ: "admin") hoặc null nếu chưa đăng nhập.
 */
export function getCurrentUsername() {
  // Dùng hàm bên trên để kiểm tra trước.
  if (!isUserLoggedIn()) { //
    return null; // Trả về null nếu chưa đăng nhập.
  }
  // Nếu đã đăng nhập, lấy lại thông tin user.
  const user = docdulieuLocalStorage("currentUser"); //
  return user.userName; // Trả về thuộc tính 'userName' của object đó.
}

//hàm dùng chung để lấy thông tin user hiện đăng nhập trả về toàn bộ object
export function getCurrentUserObject() {
  const user = docdulieuLocalStorage("currentUser");
  if (Array.isArray(user)) {
    return null;
  }
  return user; // Trả về toàn bộ object
}
/**
 * Lấy mảng giỏ hàng từ localStorage cho ĐÚNG user đang đăng nhập.
 * @returns {Array} Mảng các sản phẩm trong giỏ, hoặc mảng rỗng [].
 */
export function getUserCart() {
  // Lấy username của user hiện tại.
  const username = getCurrentUsername(); //
  if (!username) {
    return []; // Nếu không có ai đăng nhập, trả về giỏ hàng trống.
  }
  
  // *** Logic quan trọng: Tạo key động cho giỏ hàng. ***
  // Mỗi user sẽ có 1 key giỏ hàng riêng, ví dụ: 'cart_admin', 'cart_user1'
  const cartKey = 'cart_' + username; //
  
  // Dùng hàm đọc để lấy giỏ hàng của user đó.
  // (Hàm này tự động trả về [] nếu không tìm thấy key)
  return docdulieuLocalStorage(cartKey); //
}

/**
 * Lưu mảng giỏ hàng (đã cập nhật) vào localStorage cho user hiện tại.
 * @param {Array} cart - Mảng giỏ hàng mới cần lưu.
 */
export function saveUserCart(cart) {
  const username = getCurrentUsername(); //
  if (!username) {
    return; // Không làm gì cả nếu chưa đăng nhập.
  }
  // Tạo key giỏ hàng động tương ứng với user.
  const cartKey = 'cart_' + username; //
  // Ghi đè mảng giỏ hàng cũ bằng mảng 'cart' mới.
  ghidulieuLocalStorage(cartKey, cart); //
}

/**
 * Xóa giỏ hàng của user hiện tại (bằng cách ghi đè mảng rỗng).
 */
export function clearUserCart() {
  const username = getCurrentUsername(); //
  if (username) {
    const cartKey = 'cart_' + username; //
    // Ghi một mảng rỗng [] vào key của user đó.
    ghidulieuLocalStorage(cartKey, []); //
  }
}

/**
 * Định dạng một SỐ thành chuỗi tiền tệ VND.
 */
export function formatVND(amount) {
  // Kiểm tra "phòng vệ": nếu đầu vào không phải là số, cho nó = 0.
  if (typeof amount !== 'number') {
    amount = 0;
  }
  // Dùng API có sẵn của trình duyệt (Intl) để định dạng số.
  return new Intl.NumberFormat('vi-VN', { //
    style: 'currency', // Kiểu tiền tệ
    currency: 'VND'    // Loại tiền tệ
  }).format(amount); // Định dạng con số 'amount'
}

/**
 * Chuyển đổi một CHUỖI tiền tệ (từ giao diện) về dạng SỐ để tính toán.
 */
export function parseVNDPrice(priceText) {
  // Nếu chuỗi rỗng hoặc null, trả về 0.
  if (!priceText) return 0; //
  
  // Dùng Regular Expression để xóa mọi ký tự ., ₫, V, N, D
  const numericString = priceText.replace(/[\.,₫VND]/g, '').trim(); //
  
  // Chuyển chuỗi số sạch ("1250000") thành số nguyên (1250000).
  // Nếu thất bại (ví dụ chuỗi rỗng), trả về 0.
  return parseInt(numericString) || 0; //
}

// ======================================================
// PHẦN 2: LOGIC CHO POPUP GIỎ HÀNG (TRÊN HEADER)
// ======================================================

// Chờ cho toàn bộ tài liệu HTML được tải xong mới chạy code bên trong.
document.addEventListener('DOMContentLoaded', () => { //
  
  // --- 1. Lấy các phần tử DOM cố định trên trang ---
  // (Đây là các phần tử trên layout chính, không phải trang cart-detail)
  // LẤY DOM: Nút "Thêm vào giỏ" ở trang chi tiết SP
  const addToCartBtn = document.querySelector('.add-to-cart-button'); //
  // LẤY DOM: <ul> chứa các SP trong popup
  const cartItemsList = document.getElementById('cart-items-list'); //
  // LẤY DOM: Dòng chữ "Giỏ hàng trống"
  const cartEmptyMsg = document.getElementById('cart-empty-msg'); //
  // LẤY DOM: <div> bao ngoài cả icon và popup (để xử lý click-out)
  const cartWrapper = document.querySelector('.cart-wrapper'); //
  // LẤY DOM: Icon giỏ hàng trên header
  const cartIcon = document.getElementById('icon-cart'); //
  // LẤY DOM: Popup giỏ hàng
  const cartPopup = document.getElementById('cart-popup'); //
  // LẤY DOM: Lớp phủ thông báo (toast)
  const toastOverlay = document.getElementById('toast-overlay'); //
  // LẤY DOM: Nội dung text của toast
  const toastText = document.getElementById('toast-text-content'); //
  // LẤY DOM: Nút "Xem giỏ hàng" trong popup
  const viewCartBtn = document.querySelector('.view-cart-btn'); //

  // --- 2. Các hàm xử lý Giao diện (UI) ---
  
  // Hàm hiển thị thông báo "toast" (ví dụ: "Đã thêm thành công")
  function showSuccessToast(message) {
    if (!toastOverlay || !toastText) return; // Nếu không tìm thấy, không làm gì cả.

    toastText.textContent = message; // Gán nội dung thông báo.
    toastOverlay.classList.add('active'); // Thêm class 'active' để hiện toast (CSS sẽ xử lý).

    // Tự động ẩn toast sau 1.5 giây.
    setTimeout(() => {
      toastOverlay.classList.remove('active'); //
    }, 1500);
  }

  // Hàm "vẽ" lại nội dung popup giỏ hàng dựa trên dữ liệu.
  function renderCart() {
    const cart = getUserCart(); // Lấy giỏ hàng của user hiện tại.
    
    // Kiểm tra "phòng vệ"
    if (!cartItemsList || !cartEmptyMsg) return; 
    
    // Xóa sạch nội dung cũ trong popup trước khi vẽ lại.
    cartItemsList.innerHTML = ''; //

    // Nếu chưa đăng nhập HOẶC giỏ hàng rỗng
    if (!isUserLoggedIn() || cart.length === 0) { //
      cartEmptyMsg.style.display = 'block'; // Hiện thông báo "giỏ hàng trống".
    } else {
      // Nếu đã đăng nhập VÀ có hàng trong giỏ
      cartEmptyMsg.style.display = 'none'; // Ẩn thông báo "giỏ hàng trống".
      
      // Lặp qua từng 'item' trong mảng 'cart'.
      cart.forEach(item => { //
        // Tạo một chuỗi HTML cho mỗi sản phẩm.
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
        // Nối chuỗi HTML vào danh sách.
        cartItemsList.innerHTML += itemHTML; //
      });
    }
  }

  // --- 3. Hàm Xử lý Logic Chính ---
  
  // Hàm này được gọi khi người dùng nhấn nút "Thêm vào giỏ"
  function handleAddToCart() {
    // Lấy các thông tin sản phẩm từ trang chi tiết sản phẩm.
    // LẤY DOM: <div> chứa thông tin SP
    const productSection = document.getElementById("productSection"); //
    
    // LẤY DOM (con): Tên sản phẩm
    const productName = productSection.querySelector('.product-title').textContent.trim(); //
    // LẤY DOM (con): Giá sản phẩm (dạng text)
    const productPriceText = productSection.querySelector('.product-price').textContent.trim(); //
    // LẤY DOM (con): Ảnh sản phẩm (lấy src)
    const productImage = productSection.querySelector('.product-image').src; //
    // LẤY DOM (con): Ô nhập số lượng
    const productQuantity = parseInt(productSection.querySelector('.qty-input').value, 10); //
    // Lấy ID từ data-attribute của section
    const productId = productSection.dataset.currentId; //
    // Dùng hàm tiện ích để lấy số tiền
    const productPrice = parseVNDPrice(productPriceText); 
    // Kiểm tra xem sản phẩm có bị ẩn không
    const products = docdulieuLocalStorage("dataProducts");
    const productInDB = products.find(p => p.id === productId);
  
    if (productInDB && productInDB.hidden) {
      showalert("Sản phẩm này hiện không khả dụng.", "warning");
      return;
    }
    // Lấy giỏ hàng hiện tại ra.
    let cart = getUserCart(); //
    // Tìm xem sản phẩm này (dựa vào ID) đã có trong giỏ hàng chưa.
    const existingItemIndex = cart.findIndex(item => item.id === productId); //

    // Nếu tìm thấy (chỉ số > -1), tức là đã có
    if (existingItemIndex > -1) {
      // Chỉ cập nhật (cộng dồn) số lượng.
      cart[existingItemIndex].quantity += productQuantity; //
    } else {
      // Nếu không tìm thấy, tạo một đối tượng sản phẩm mới.
      const product = {
        id: productId,
        name: productName,
        price: productPrice, 
        image: productImage,
        quantity: productQuantity
      };
      // Thêm sản phẩm mới này vào mảng giỏ hàng.
      cart.push(product); //
    }
    // Lưu mảng giỏ hàng (đã bị thay đổi) trở lại localStorage.
    saveUserCart(cart); //
    // "Vẽ" lại popup giỏ hàng để hiển thị SP vừa thêm.
    renderCart(); //
    // Hiển thị thông báo thành công.
    showSuccessToast('Đã thêm vào Giỏ hàng!'); //
  }


  // --- 4. Gắn các Event Listeners (Bắt sự kiện) ---
  
  // Nếu tìm thấy nút "Thêm vào giỏ"
  if (addToCartBtn) {
    // Gắn sự kiện 'click' cho nó.
    addToCartBtn.addEventListener('click', () => { //
      // Trước khi thêm, kiểm tra đăng nhập.
      if (!isUserLoggedIn()) { //
        location.hash = '#login'; // Nếu chưa, chuyển hướng sang trang login.
        return; // Dừng hàm tại đây.
      }
      // Nếu đã đăng nhập, gọi hàm xử lý thêm.
      handleAddToCart(); //
    });
  }

  // Nếu tìm thấy icon giỏ hàng, popup và wrapper
  if (cartIcon && cartPopup && cartWrapper) {
    // Gắn sự kiện 'click' cho icon.
    cartIcon.addEventListener('click', (event) => { 
      // Nếu không có dòng này, popup sẽ hiện rồi tắt ngay lập tức.
      event.stopPropagation(); //
      
      // Kiểm tra đăng nhập khi xem popup.
      if (!isUserLoggedIn()) { //
        showalert("Bạn cần đăng nhập để xem giỏ hàng.");
        location.hash = '#login'; // Chuyển sang trang login.
        return;
      }
      // Nếu đã đăng nhập, bật/tắt class 'show' để hiện/ẩn popup.
      //toggle giống như công tắt kiểm tra nếu chưa có class show sẽ tự thêm vào
      //đã có sẽ tự xóa đi
      cartPopup.classList.toggle('show'); //
    });
  }

  // Gắn sự kiện 'click' cho *toàn bộ trang*.
  // Dùng để xử lý "nhấn ra ngoài để tắt popup".
  document.addEventListener('click', (event) => { //
    // Nếu popup đang hiện (contains 'show')
    // VÀ nơi được click (event.target) KHÔNG nằm bên trong 'cartWrapper'
    if (cartPopup && cartPopup.classList.contains('show') && !cartWrapper.contains(event.target)) { //
      // Thì tắt popup đi.
      cartPopup.classList.remove('show'); //
    }
  });

  // Nếu tìm thấy lớp phủ của toast
  if (toastOverlay) {
    // Gắn sự kiện 'click'
    toastOverlay.addEventListener('click', (event) => { //
      // Chỉ tắt khi click vào chính lớp phủ (chứ không phải text bên trong)
      if (event.target === toastOverlay) { //
        toastOverlay.classList.remove('active'); //
      }
    });
  }

  // Nếu tìm thấy nút "Xem giỏ hàng" (trong popup)
  if (viewCartBtn) {
    // Gắn sự kiện 'click'
    viewCartBtn.addEventListener('click', () => { //
      location.hash = 'cartDetailPage'; // Chuyển sang trang chi tiết giỏ hàng.
      cartPopup.classList.remove('show'); // Đóng popup lại.
    });
  }

  // --- 5. Khởi chạy và Đồng bộ hóa ---
  
  // "Vẽ" popup giỏ hàng ngay khi tải trang xong.
  renderCart(); //
  
  // Lắng nghe sự kiện 'storage' (khi localStorage ở tab khác thay đổi)
  window.addEventListener('storage', (event) => { //
    // Nếu key 'currentUser' (đăng nhập/đăng xuất) thay đổi
    if (event.key === 'currentUser') { //
      renderCart(); // Vẽ lại giỏ hàng (vì user đã thay đổi).
    }
  });
  
  // Lắng nghe sự kiện thay đổi hash (URL)
  window.addEventListener('hashchange', () => { //
    // Vẽ lại giỏ hàng khi chuyển trang (ví dụ: sau khi đăng nhập)
    renderCart(); //
  });
  
  // Lắng nghe một sự kiện 'cartUpdated' (do ta tự định nghĩa)
  // Sự kiện này sẽ được "bắn" từ trang cart-page.js
  window.addEventListener('cartUpdated', () => { //
    renderCart(); // Vẽ lại popup
  });
}); // Kết thúc 'DOMContentLoaded'