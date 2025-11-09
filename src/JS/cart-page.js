// Import các hàm hỗ trợ đã export từ cart.js
import { showalert } from './alert.js';
import {
  getUserCart,       // Lấy giỏ hàng
  saveUserCart,      // Lưu giỏ hàng
  formatVND,         // Định dạng tiền
  isUserLoggedIn,    // Kiểm tra đăng nhập
} from './cart.js';
// Import các hàm đọc/ghi từ readandwrite.js
import { docdulieuLocalStorage, ghidulieuLocalStorage } from './readandwrite.js';

/**
 * Hàm khởi tạo (do router gọi): "Vẽ" (render) toàn bộ trang chi tiết giỏ hàng.
 */
export function initCartDetailPage() {
  // Lấy các phần tử DOM của trang #cartDetailPage
  // LẤY DOM: <div> chứa danh sách SP
  const listContainer = document.getElementById('cart-detail-list'); //
  // LẤY DOM: <footer> chứa nút Mua hàng
  const footer = document.getElementById('cart-detail-footer'); //
  // LẤY DOM: Thông báo "giỏ hàng trống"
  const emptyMsg = document.getElementById('cart-detail-empty'); //
  // LẤY DOM: <span> tổng tiền
  const totalAmountEl = document.getElementById('cart-grand-total-amount'); //

  if (!listContainer) return; // Nếu không tìm thấy, dừng lại

  const cart = getUserCart(); // Lấy dữ liệu giỏ hàng
  
  listContainer.innerHTML = ''; // Xóa sạch nội dung cũ
  let grandTotal = 0; // Biến tạm để tính tổng tiền

  if (cart.length === 0) {
    // Nếu giỏ hàng rỗng
    footer.style.display = 'none'; // Ẩn footer
    emptyMsg.style.display = 'block'; // Hiện thông báo rỗng
  } else {
    // Nếu giỏ hàng có đồ
    footer.style.display = 'flex'; // Hiện footer
    emptyMsg.style.display = 'none'; // Ẩn thông báo rỗng

    // Lặp qua từng sản phẩm
    cart.forEach(item => { //
      const itemTotal = item.price * item.quantity; // Tính tiền cho riêng dòng SP này
      grandTotal += itemTotal; // Cộng dồn vào tổng tiền

      // Tạo chuỗi HTML cho 1 dòng sản phẩm
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
      listContainer.innerHTML += itemHTML; // Thêm vào danh sách
    });

    // Cập nhật tổng tiền
    totalAmountEl.textContent = formatVND(grandTotal); //
    // Gắn sự kiện cho các nút (+, -, Xóa, Mua ngay)
    attachCartDetailListeners(); //
  }
}

/*
 * Gắn sự kiện cho các nút "+", "-", "Xóa", "Mua ngay" trên trang chi tiết.
 */
function attachCartDetailListeners() {
  // LẤY DOM (nhiều): Lấy tất cả các nút (+) và (-)
  document.querySelectorAll('.qty-change-btn').forEach(button => { //
    // Dùng "trick" clone-và-thay-thế để xóa listener cũ (tránh gắn lặp lại)
    button.replaceWith(button.cloneNode(true)); //
  });
  // Gắn listener mới cho các nút (+, -)
  document.querySelectorAll('.qty-change-btn').forEach(button => { //
    button.addEventListener('click', handleQuantityChange); //
  });

  // LẤY DOM (nhiều): Lấy tất cả các nút "Xóa"
  document.querySelectorAll('.item-delete-btn').forEach(button => { //
    //Dùng "trick" clone và thay thế để xóa listener cũ
    button.replaceWith(button.cloneNode(true)); //
  });
  // Gắn listener mới
  document.querySelectorAll('.item-delete-btn').forEach(button => { //
    button.addEventListener('click', handleDeleteItem); //
  });

  // LẤY DOM: Lấy nút "Mua ngay"
  const checkoutBtn = document.getElementById('cart-checkout-all-btn'); //
  if (checkoutBtn) {
    // Tương tự, xóa listener cũ
    checkoutBtn.replaceWith(checkoutBtn.cloneNode(true)); //
    // Gắn listener mới
    // LẤY DOM: Lấy lại nút "Mua ngay" (nút mới sau khi clone)
    document.getElementById('cart-checkout-all-btn').addEventListener('click', handleCheckout); //
  }
}

/**
 * Xử lý khi nhấn nút "+" hoặc "-"
 */
function handleQuantityChange(event) {
  // Lấy ID sản phẩm và hành động (tăng/giảm) từ data-attributes
  const id = event.target.dataset.id; //
  const action = event.target.dataset.action; //
  
  let cart = getUserCart(); // Lấy giỏ hàng
  const itemIndex = cart.findIndex(item => item.id === id); // Tìm vị trí SP
  if (itemIndex === -1) return; // Nếu không tìm thấy, dừng lại

  if (action === 'increase') {
    cart[itemIndex].quantity++; // Tăng số lượng
  } else if (action === 'decrease') {
    cart[itemIndex].quantity--; // Giảm số lượng
    // Nếu giảm về 0
    if (cart[itemIndex].quantity === 0) { //
      // Xóa sản phẩm khỏi mảng
      cart.splice(itemIndex, 1); //
    }
  }

  saveUserCart(cart); // Lưu lại giỏ hàng (đã thay đổi)
  initCartDetailPage(); // "Vẽ" lại toàn bộ trang chi tiết giỏ hàng
  
  // Bắn sự kiện "cartUpdated" để popup giỏ hàng trên header cũng được cập nhật
  window.dispatchEvent(new Event('cartUpdated')); //
}

/**
 * Xử lý khi nhấn nút "Xóa"
 */
function handleDeleteItem(event) {
  const id = event.target.dataset.id; // Lấy ID sản phẩm
  // Hiển thị hộp thoại xác nhận
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) { //
    return; // Nếu user nhấn "Cancel", dừng lại
  }

  let cart = getUserCart(); //
  // Dùng 'filter' để tạo 1 mảng mới KHÔNG chứa sản phẩm có ID vừa chọn
  const newCart = cart.filter(item => item.id !== id); //

  saveUserCart(newCart); // Lưu mảng mới (đã xóa SP)
  initCartDetailPage(); // "Vẽ" lại toàn bộ trang

  // Bắn sự kiện "cartUpdated" để popup giỏ hàng trên header cũng được cập nhật
  window.dispatchEvent(new Event('cartUpdated')); //
}

/**
 * Xử lý khi nhấn nút "Mua Ngay" (Hàm "cầu nối")
 */
function handleCheckout() {
  const cart = getUserCart(); //
  if (cart.length === 0) {
    showalert("Giỏ hàng của bạn đang trống!");
    return;
  }

  // 1. Kiểm tra đăng nhập
  const currentUser = docdulieuLocalStorage("currentUser"); //
  if (!isUserLoggedIn() || Array.isArray(currentUser)) { //
      showalert("Bạn cần đăng nhập để thanh toán.","warning");
      location.hash = 'login'; // Chuyển sang trang đăng nhập
      return;
  }

  // 2. Tính tổng tiền (dùng 'reduce' cho hiệu quả)
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0); //

  // 3. *** Logic quan trọng: Tạo đối tượng "cầu nối" ***
  // Tạo 1 object chứa toàn bộ thông tin cần gửi qua trang thanh toán
  const paymentData = {
    items: cart,  // Danh sách sản phẩm
    total: total, // Tổng tiền
    type: 'cart'  // Đánh dấu là mua từ giỏ hàng (để 'thanhtoan.js' biết mà xóa)
  };

  // 4. Lưu vào localStorage (dùng làm "cầu nối")
  ghidulieuLocalStorage('paymentData', paymentData); //

  // 5. Chuyển sang trang thanh toán
  // 'thanhtoan.js' sẽ được kích hoạt và đọc 'paymentData'
  location.hash = 'thanhtoan'; //
}