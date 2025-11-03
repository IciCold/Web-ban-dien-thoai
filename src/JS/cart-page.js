// File: JS/cart-page.js

// Import các hàm hỗ trợ đã export từ cart.js
// (Chúng ta sẽ dùng lại các hàm này để đọc/lưu giỏ hàng)
import {
  getUserCart,
  saveUserCart,
  clearUserCart,
  formatVND,
  isUserLoggedIn,
  getCurrentUsername // Lấy thêm thông tin user
} from './cart.js';

/**
 * Hàm khởi tạo (do router gọi): "Vẽ" (render) toàn bộ trang chi tiết giỏ hàng.
 * Đây là hàm chính của file này.
 */
export function initCartDetailPage() {
  // 1. Lấy các phần tử HTML của trang chi tiết
  const listContainer = document.getElementById('cart-detail-list');
  const footer = document.getElementById('cart-detail-footer');
  const emptyMsg = document.getElementById('cart-detail-empty');
  const totalAmountEl = document.getElementById('cart-grand-total-amount');

  // 2. Thoát nếu không tìm thấy (ví dụ: đang ở trang chủ)
  // Điều này đảm bảo code không chạy lỗi khi bạn ở trang khác
  if (!listContainer) return; 

  // 3. Lấy giỏ hàng của user hiện tại
  const cart = getUserCart();
  
  // 4. Xóa nội dung cũ để chuẩn bị "vẽ" lại
  listContainer.innerHTML = '';
  let grandTotal = 0; // Đặt tổng tiền về 0

  // 5. Kiểm tra giỏ hàng rỗng
  if (cart.length === 0) {
    // Nếu rỗng: Ẩn footer, hiện thông báo "giỏ hàng trống"
    footer.style.display = 'none';
    emptyMsg.style.display = 'block';
  } else {
    // Nếu có hàng: Hiện footer, ẩn thông báo "giỏ hàng trống"
    footer.style.display = 'flex';
    emptyMsg.style.display = 'none';

    // 6. Lặp qua từng sản phẩm trong giỏ hàng
    cart.forEach(item => {
      // Vì giá đã là SỐ, ta có thể tính toán trực tiếp
      const itemTotal = item.price * item.quantity;
      grandTotal += itemTotal; // Cộng dồn vào tổng tiền

      // Tạo 1 hàng HTML cho sản phẩm
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
      // Thêm hàng HTML vào danh sách
      listContainer.innerHTML += itemHTML;
    });

    // 7. Cập nhật tổng tiền cuối cùng
    totalAmountEl.textContent = formatVND(grandTotal);

    // 8. Gắn sự kiện (chức năng "click") cho các nút vừa tạo
    attachCartDetailListeners();
  }
}

/**
 * Gắn sự kiện cho các nút "+", "-", "Xóa", "Mua ngay" trên trang chi tiết.
 */
function attachCartDetailListeners() {
  // Nút tăng/giảm số lượng
  document.querySelectorAll('.qty-change-btn').forEach(button => {
    // Chống gắn sự kiện trùng lặp (kỹ thuật clone/replace)
    button.replaceWith(button.cloneNode(true)); 
  });
  document.querySelectorAll('.qty-change-btn').forEach(button => {
    button.addEventListener('click', handleQuantityChange);
  });

  // Nút xóa
  document.querySelectorAll('.item-delete-btn').forEach(button => {
    button.replaceWith(button.cloneNode(true));
  });
  document.querySelectorAll('.item-delete-btn').forEach(button => {
    button.addEventListener('click', handleDeleteItem);
  });

  // Nút Mua Ngay (dưới cùng)
  const checkoutBtn = document.getElementById('cart-checkout-all-btn');
  if (checkoutBtn) {
    checkoutBtn.replaceWith(checkoutBtn.cloneNode(true));
    document.getElementById('cart-checkout-all-btn').addEventListener('click', handleCheckout);
  }
}

/**
 * Xử lý khi nhấn nút "+" hoặc "-"
 */
function handleQuantityChange(event) {
  const id = event.target.dataset.id;
  const action = event.target.dataset.action;
  
  let cart = getUserCart();
  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex === -1) return; // Không tìm thấy sản phẩm

  if (action === 'increase') {
    cart[itemIndex].quantity++;
  } else if (action === 'decrease') {
    cart[itemIndex].quantity--;
    if (cart[itemIndex].quantity === 0) {
      // Nếu giảm về 0, tự động xóa
      cart.splice(itemIndex, 1);
    }
  }

  saveUserCart(cart); // Lưu giỏ hàng mới
  initCartDetailPage(); // "Vẽ" lại trang chi tiết
  
  // Bắn tín hiệu cho popup (cart.js) biết để cập nhật
  window.dispatchEvent(new Event('cartUpdated'));
}

/**
 * Xử lý khi nhấn nút "Xóa"
 */
function handleDeleteItem(event) {
  const id = event.target.dataset.id;
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
    return; // User nhấn "Cancel"
  }

  let cart = getUserCart();
  // Tạo giỏ hàng mới không chứa sản phẩm có id này
  const newCart = cart.filter(item => item.id !== id);

  saveUserCart(newCart); // Lưu giỏ hàng mới
  initCartDetailPage(); // "Vẽ" lại trang chi tiết

  // Bắn tín hiệu cho popup (cart.js) biết để cập nhật
  window.dispatchEvent(new Event('cartUpdated'));
}

/**
 * Xử lý khi nhấn nút "Mua Ngay"
 */
function handleCheckout() {
  const cart = getUserCart();
  if (cart.length === 0) {
    alert('Giỏ hàng của bạn đang trống!');
    return;
  }

  // Lấy thông tin user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!isUserLoggedIn() || !currentUser) {
      alert("Lỗi: Không tìm thấy thông tin người dùng.");
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
      price: item.price, // Giá đã là SỐ
      quantity: item.quantity,
      image: item.image
    })),
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    status: 'pending', // Trạng thái ban đầu: "Chưa giao"
    date: new Date().toISOString(),
    paymentMethod: 'Cart Checkout'
  };

  // Lưu đơn hàng
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Xóa giỏ hàng
  clearUserCart();
  
  
  // Cập nhật lại giao diện (cả popup và trang chi tiết)
  initCartDetailPage(); // "Vẽ" lại trang (sẽ thấy giỏ hàng trống)
  window.dispatchEvent(new Event('cartUpdated')); // Báo cho popup biết
  
  // Chuyển về trang chủ
    location.hash = 'thanhtoan';
}