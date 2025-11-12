import { docdulieuLocalStorage, ghidulieuLocalStorage } from "./readandwrite.js";
import { parseVNDPrice } from "./cart.js";
// ===================================
// KHAI BÁO BIẾN CHO TRANG CHI TIẾT
// ===================================
let ProductsData = [];

// Lấy các phần tử DOM
const productSection = document.getElementById("productSection");
const productTitle = productSection.querySelector(".product-title");
const productPrice = productSection.querySelector(".product-price");
const productImage = productSection.querySelector(".product-image");
const buyNowBtn = productSection.querySelector(".buy-now-button");

// ===================================
// HÀM KHỞI TẠO TRANG CHI TIẾT
// ===================================
export async function initChiTietPage() {
  console.log("Khởi tạo trang chi tiết...");

  //Lấy ID sản phẩm đã click từ localStorage
  const selectedId = localStorage.getItem("selectedProductId");
  if (!selectedId) {
    console.error("Không tìm thấy ID sản phẩm. Quay về trang chủ.");
    location.hash = "home";
    return;
  }

  //Đọc dữ liệu có sẵn trong localStorage
  const Products = docdulieuLocalStorage("dataProducts");

  if (Products.length === 0) {
    productSection.innerHTML = "<h1>Không có dữ liệu sản phẩm.</h1>";
    return;
  }

  //Tìm sản phẩm đang được chọn
  const selectedProduct = Products.find((p) => p.id === selectedId);
  if (!selectedProduct) {
    console.error("Không tìm thấy sản phẩm với ID:", selectedId);
    location.hash = "home";
    return;
  }
  // Kiểm tra nếu sản phẩm bị ẩn
  if (selectedProduct.hidden) {
    showalert("Sản phẩm này hiện không khả dụng.", "warning");
    location.hash = "home";
    return;
  }

  //Hiển thị thông tin
  renderProductDetails(selectedProduct);

  //KÍCH HOẠT NÚT SỐ LƯỢNG
  setupQuantityControls();
}

// ===================================
// HÀM HIỂN THỊ CHI TIẾT SẢN PHẨM
// ===================================
function renderProductDetails(product) {
  productSection.dataset.currentId = product.id;

  productTitle.textContent = product.ten;
  productImage.src = product.src;
  productImage.alt = product.ten;

  productPrice.textContent = `${product.gia?.toLocaleString() || "N/A"} VND`;

  const memoryValueEl = document.getElementById("product-memory-value");
  const colorValueEl = document.getElementById("product-color-value");
  const cpuValueEl = document.getElementById("product-cpu-value");
  const ramValueEl = document.getElementById("product-ram-value");
  const cameraValueEl = document.getElementById("product-camera-value");
  const pinValueEl = document.getElementById("product-pin-value");
  // Gán giá trị cho chúng
  if (memoryValueEl) {
    memoryValueEl.textContent = product.bo_nho || 'N/A';
  }
  if (colorValueEl) {
    colorValueEl.textContent = product.mau_sac || 'N/A';
  }
  if (cpuValueEl) {
    cpuValueEl.textContent = product.cpu || 'N/A';
  }
  if (ramValueEl) {
    ramValueEl.textContent = product.ram || 'N/A';
  }
  if (cameraValueEl) {
    cameraValueEl.textContent = product.camera || 'N/A';
  }
  if (pinValueEl) {
    pinValueEl.textContent = product.dung_luong_pin || 'N/A';
  }
}

// ===================================
// NÚT MUA NGAY
// ===================================
if (buyNowBtn) {
  buyNowBtn.addEventListener("click", () => {
    
    // 1. Lấy thông tin sản phẩm hiện tại từ DOM
    const id = productSection.dataset.currentId;
    const name = productTitle.textContent.trim();
    const priceText = productPrice.textContent.trim();
    const image = productImage.src;
    
    // Lấy số lượng từ ô input
    const quantityInput = productSection.querySelector(".qty-input");
    const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

    // 2. Chuyển giá (text) về SỐ
    const price = parseVNDPrice(priceText);
    
    // 3. Tạo đối tượng item
    const singleItem = {
      id: id,
      name: name,
      price: price, 
      image: image,
      quantity: quantity
    };

    // 4. Tạo đối tượng data để gửi qua trang thanh toán
    const paymentData = {
      items: [singleItem],
      total: price * quantity,
      type: 'direct'
    };

    // 5. LƯU DỮ LIỆU VÀO LOCALSTORAGE
    ghidulieuLocalStorage('paymentData', paymentData);

    // 6. Chuyển sang trang thanh toán
    location.hash = "thanhtoan";
  });
}

// ===================================
// HÀM XỬ LÝ NÚT SỐ LƯỢNG
// ===================================
function setupQuantityControls() {
  // 1. Lấy các phần tử
  const qtyInput = productSection.querySelector(".qty-input");
  const qtyButtons = productSection.querySelectorAll(".qty-button");

  if (!qtyInput || qtyButtons.length === 0) {
    console.warn("Không tìm thấy phần tử tăng/giảm số lượng.");
    return;
  }

  // 2. Gắn sự kiện
  qtyButtons.forEach(button => {
    // Clone và replace để xóa listener cũ (nếu có)
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener("click", () => {
      let currentValue = parseInt(qtyInput.value, 10);
      
      // Kiểm tra nút "+"
      if (newButton.textContent === "+") {
        currentValue++;
        qtyInput.value = currentValue;
      } 
      // Kiểm tra nút "-"
      else if (newButton.textContent === "-") {
        if (currentValue > 1) { // Đảm bảo số lượng không dưới 1
          currentValue--;
          qtyInput.value = currentValue;
        }
      }
    });
  });
}
