// File: cart.js
// Bọc toàn bộ code trong 'DOMContentLoaded'
// Chức năng: Đảm bảo code JavaScript chỉ chạy SAU KHI toàn bộ HTML đã được tải xong.
// Điều này tránh lỗi "không tìm thấy" các phần tử (như nút bấm, popup...).
document.addEventListener('DOMContentLoaded', () => {

  // === 1. KHAI BÁO BIẾN - LẤY CÁC PHẦN TỬ HTML ===
  // Chức năng: Lấy các 'linh kiện' (nút bấm, popup, text...) từ file HTML
  // và lưu vào các biến để có thể điều khiển chúng bằng JavaScript.
  
  // Nút "Thêm vào giỏ" ở trang chi tiết sản phẩm
  const addToCartBtn = document.querySelector('.add-to-cart-button'); 
  // Danh sách <ul> <li> chứa các sản phẩm trong popup
  const cartItemsList = document.getElementById('cart-items-list'); 
  // Dòng chữ <p> "Giỏ hàng của bạn trống"
  const cartEmptyMsg = document.getElementById('cart-empty-msg');
  // <div> bọc icon giỏ hàng và popup (để xử lý click ra ngoài)
  const cartWrapper = document.querySelector('.cart-wrapper');
  // Icon giỏ hàng trên header
  const cartIcon = document.getElementById('icon-cart');
  // <div> popup giỏ hàng (bị ẩn/hiện)
  const cartPopup = document.getElementById('cart-popup');
  // Lớp nền mờ (overlay) của thông báo "Thêm thành công"
  const toastOverlay = document.getElementById('toast-overlay');
  // Dòng chữ <p> bên trong thông báo "Thêm thành công"
  const toastText = document.getElementById('toast-text-content');


  // === 2. HÀM TRỢ GIÚP (BỘ NÃO XỬ LÝ USER & LOCALSTORAGE) ===
  // Chức năng: Nhóm hàm này quản lý trạng thái Đăng nhập và dữ liệu Giỏ hàng.

  /**
   * Kiểm tra xem người dùng đã đăng nhập hay chưa.
   * Cách làm: Check xem 'currentUser' có tồn tại trong localStorage không.
   * @returns {boolean} True nếu đã đăng nhập, False nếu chưa.
   */
  function isUserLoggedIn() {
    return localStorage.getItem("currentUser") !== null;
  }

  /**
   * Lấy username của người dùng đang đăng nhập.
   * Cách làm: 'parse' (chuyển đổi) chuỗi JSON từ localStorage thành object để lấy 'userName'.
   * @returns {string|null} Trả về username, hoặc null nếu không ai đăng nhập.
   */
  function getCurrentUsername() {
    if (!isUserLoggedIn()) {
      return null;
    }
    const user = JSON.parse(localStorage.getItem("currentUser"));
    return user.userName; // Giả sử object user có key là 'userName'
  }

  /**
   * Lấy giỏ hàng của ĐÚNG user đang đăng nhập.
   * Cách làm: Tạo 1 'key' (khóa) riêng biệt, ví dụ: "cart_user123".
   * Điều này giúp giỏ hàng của các user khác nhau không bị lẫn lộn.
   * @returns {Array} Mảng giỏ hàng của user (hoặc mảng rỗng [] nếu chưa có).
   */
  function getUserCart() {
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
  function saveUserCart(cart) {
    const username = getCurrentUsername();
    if (!username) {
      return; // Không thể lưu nếu không đăng nhập
    }
    const cartKey = 'cart_' + username;
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }


  // === 3. HÀM XỬ LÝ THÔNG BÁO (TOAST) ===
  // Chức năng: Thay thế cho hàm alert()

  /**
   * Hiển thị thông báo toast thành công (cái popup có dấu tick xanh).
   * @param {string} message - Nội dung thông báo muốn hiển thị.
   */
  function showSuccessToast(message) {
    if (!toastOverlay || !toastText) return; // Kiểm tra xem HTML có tồn tại không

    // 1. Cập nhật nội dung (ví dụ: "Đã thêm vào Giỏ hàng!")
    toastText.textContent = message;
    
    // 2. Hiển thị toast
    // Bằng cách thêm class 'active', file CSS của bạn sẽ cho nó hiện ra
    toastOverlay.classList.add('active');

    // 3. Tự động ẩn sau 1.5 giây (1500ms)
    // Đặt một bộ đếm thời gian, sau 1.5s nó sẽ xóa class 'active' đi.
    setTimeout(() => {
      toastOverlay.classList.remove('active');
    }, 1500);
  }

  // Thêm sự kiện: Đóng toast khi click vào lớp nền mờ (overlay)
  if (toastOverlay) {
    toastOverlay.addEventListener('click', (event) => {
      // Chỉ đóng khi click vào NỀN (overlay), không phải cái bảng trắng (message)
      if (event.target === toastOverlay) {
        toastOverlay.classList.remove('active');
      }
    });
  }


  // === 4. LOGIC NGHIỆP VỤ CHÍNH (THÊM & HIỂN THỊ GIỎ HÀNG) ===

  /**
   * Hàm chính: Xử lý khi nhấn nút "Thêm vào giỏ hàng".
   * (Hàm này chỉ được gọi SAU KHI đã vượt qua kiểm tra đăng nhập).
   */
  function handleAddToCart() {
    // 1. Thu thập thông tin sản phẩm từ trang chi tiết
    const productName = document.querySelector('.product-title').textContent.trim();
    const productPrice = document.querySelector('.product-price').textContent.trim();
    const productImage = document.querySelector('.product-image').src;
    const productQuantity = parseInt(document.querySelector('.qty-input').value, 10);
    const productId = productName; // Tạm dùng tên làm ID

    // 2. Lấy giỏ hàng CŨ của user từ localStorage
    let cart = getUserCart();

    // 3. Kiểm tra xem sản phẩm này đã có trong giỏ chưa
    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
      // Nếu CÓ RỒI: Chỉ cộng thêm số lượng
      cart[existingItemIndex].quantity += productQuantity;
    } else {
      // Nếu CHƯA CÓ: Tạo object sản phẩm mới và 'push' vào mảng
      const product = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: productQuantity
      };
      cart.push(product);
    }

    // 4. Lưu giỏ hàng MỚI (đã cập nhật) vào localStorage
    saveUserCart(cart);

    // 5. Cập nhật lại giao diện popup giỏ hàng ngay lập tức
    renderCart();

    // 6. Thông báo thành công cho người dùng
    showSuccessToast('Đã thêm vào Giỏ hàng!'); // Gọi hàm toast
  }

  /**
   * "Vẽ" (render) lại nội dung bên trong popup giỏ hàng (cái icon trên header).
   * Chức năng: Được gọi khi mới tải trang, hoặc khi thêm SP, hoặc khi login/logout.
   */
  function renderCart() {
    // Luôn lấy giỏ hàng mới nhất từ localStorage
    const cart = getUserCart();
    
    // Xóa sạch nội dung cũ
    cartItemsList.innerHTML = '';

    // Nếu không đăng nhập HOẶC giỏ hàng trống
    if (!isUserLoggedIn() || cart.length === 0) {
      // Hiển thị thông báo "Giỏ hàng trống"
      cartEmptyMsg.style.display = 'block';
    } else {
      // Nếu có sản phẩm:
      // 1. Ẩn thông báo "Giỏ hàng trống"
      cartEmptyMsg.style.display = 'none';
      
      // 2. Lặp qua mảng giỏ hàng, tạo HTML cho từng sản phẩm
      cart.forEach(item => {
        const itemHTML = `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
              <span class="item-name">${item.name}</span>
              <span class="item-price">${item.price}</span>
            </div>
            <span class="item-quantity">x ${item.quantity}</span>
          </div>
        `;
        // 3. Nối HTML của sản phẩm vào danh sách
        cartItemsList.innerHTML += itemHTML;
      });
    }
  }


  // === 5. GẮN KẾT SỰ KIỆN (EVENT LISTENERS) ===
  // Chức năng: Đây là "cò súng", gắn các hàm đã viết ở trên vào các hành động 'click' của user.

  // --- BẢO VỆ NÚT "THÊM VÀO GIỎ HÀNG" ---
  // (Chỉ chạy nếu tìm thấy nút này trên trang)
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      
      // *** CỔNG BẢO VỆ SỐ 1 ***
      // KIỂM TRA ĐĂNG NHẬP:
      if (!isUserLoggedIn()) {
        location.hash = '#login'; // Chuyển đến trang đăng nhập
        return; // Dừng lại, không chạy code bên dưới
      }
      
      // Nếu đã vượt qua cổng bảo vệ (đã đăng nhập), thì mới cho phép chạy hàm thêm
      handleAddToCart();
    });
  }

  // --- BẢO VỆ ICON GIỎ HÀNG (MỞ POPUP) ---
  // (Chỉ chạy nếu tìm thấy các phần tử của giỏ hàng trên header)
  if (cartIcon && cartPopup && cartWrapper) {
    
    // Gắn sự kiện click cho ICON GIỎ HÀNG
    cartIcon.addEventListener('click', (event) => {
      // Ngăn sự kiện click này lan ra ngoài (sẽ được giải thích ở dưới)
      event.stopPropagation();
      
      // *** CỔNG BẢO VỆ SỐ 2 ***
      // KIỂM TRA ĐĂNG NHẬP:
      if (!isUserLoggedIn()) {
        alert('Bạn cần đăng nhập để xem giỏ hàng.');
        location.hash = '#login'; // Chuyển đến trang đăng nhập
        return; // Dừng lại
      }
      
      // Nếu đã đăng nhập, cho phép Bật/Tắt popup
      // (toggle = nếu có class 'show' thì xóa đi, nếu không có thì thêm vào)
      cartPopup.classList.toggle('show');
    });

    // --- Đóng popup khi click ra bên ngoài ---
    // Gắn sự kiện click cho TOÀN BỘ trang web
    document.addEventListener('click', (event) => {
      // Kiểm tra:
      // 1. Popup CÓ đang hiển thị (có class 'show')
      // 2. VÀ Nơi click (event.target) KHÔNG NẰM TRONG <div> 'cartWrapper'
      if (cartPopup.classList.contains('show') && !cartWrapper.contains(event.target)) {
        // Nếu thỏa mãn 2 điều kiện -> đóng popup
        cartPopup.classList.remove('show');
      }
      // Nếu click BÊN TRONG popup, điều kiện số 2 sẽ sai -> hàm if không chạy -> popup không đóng
    });
  }


  // === 6. KHỞI CHẠY VÀ LẮNG NGHE THAY ĐỔI ===

  // Chạy hàm "vẽ" giỏ hàng 1 lần ngay khi tải trang
  // (Để nó hiển thị "Giỏ hàng trống" hoặc giỏ hàng cũ của user nếu đã đăng nhập)
  renderCart();

  // Tự động cập nhật: Lắng nghe nếu 'currentUser' ở localStorage thay đổi
  // (Ví dụ: user login/logout ở 1 tab khác, tab này sẽ tự động biết)
  window.addEventListener('storage', (event) => {
    if (event.key === 'currentUser') {
      renderCart(); // "Vẽ" lại giỏ hàng (có thể là để xóa giỏ hàng khi logout)
    }
  });

  // Tự động cập nhật: Lắng nghe nếu URL thay đổi (thanh hash #...)
  // (Ví dụ: user login thành công, file login.js đổi hash về #home)
  window.addEventListener('hashchange', () => {
    // Khi hash thay đổi, "vẽ" lại giỏ hàng
    // (Để đảm bảo giỏ hàng được hiển thị ngay sau khi login thành công)
    renderCart();
  });

  //THÊM CODE CÓ THỂ CẦN
  // === 7. HÀM HỖ TRỢ ĐỊNH DẠNG TIỀN ===
  function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  function parseVNDPrice(priceText) {
    if (!priceText) return 0;
    const numericString = priceText.replace(' VND', '').replace(/\./g, '').trim();
    return parseInt(numericString) || 0;
  }

  // === 8. HÀM XÓA GIỎ HÀNG ===
  function clearUserCart() {
    const username = getCurrentUsername();
    if (username) {
      const cartKey = 'cart_' + username;
      localStorage.removeItem(cartKey);
    }
  }

  // === 9. THANH TOÁN TỪ GIỎ HÀNG ===
  function handleCheckoutFromCart() {
    const cart = getUserCart();
    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống!');
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      location.hash = 'login';
      return;
    }

    // Tạo đơn hàng từ giỏ hàng
    const newOrder = {
      id: 'ORD_' + Date.now(),
      customer: currentUser.userName,
      customerEmail: currentUser.email,
      products: cart.map(item => ({
        name: item.name,
        price: parseVNDPrice(item.price),
        quantity: item.quantity,
        image: item.image
      })),
      total: cart.reduce((sum, item) => sum + (parseVNDPrice(item.price) * item.quantity), 0),
      status: 'completed',
      date: new Date().toISOString(),
      paymentMethod: 'Cart Checkout'
    };

    // Lưu đơn hàng
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Xóa giỏ hàng
    clearUserCart();
    
    alert(`✅ Đặt hàng thành công!\nMã đơn hàng: ${newOrder.id}\nTổng tiền: ${formatVND(newOrder.total)}`);
    
    // Đóng popup giỏ hàng
    if (cartPopup) {
      cartPopup.classList.remove('show');
    }
    
    // Cập nhật lại giao diện
    renderCart();
    
    // Chuyển về trang chủ
    setTimeout(() => {
      location.hash = 'home';
    }, 1000);
  }

  // Thêm nút "Thanh toán" vào popup giỏ hàng
  function addCheckoutButton() {
    const cartFooter = document.querySelector('.cart-footer');
    if (!cartFooter) return;
    
    // Xóa nút cũ nếu có
    const existingBtn = cartFooter.querySelector('.checkout-btn');
    if (existingBtn) {
      existingBtn.remove();
    }

    // Thêm nút mới
    const checkoutBtn = document.createElement('button');
    checkoutBtn.className = 'checkout-btn';
    checkoutBtn.textContent = 'Thanh toán';
    checkoutBtn.addEventListener('click', handleCheckoutFromCart);
    cartFooter.appendChild(checkoutBtn);
  }
});
