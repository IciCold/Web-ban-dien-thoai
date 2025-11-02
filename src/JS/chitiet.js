// ===================================
// KHAI BÁO BIẾN CHO TRANG CHI TIẾT
// ===================================
// Biến toàn cục để lưu trữ toàn bộ data, tránh fetch nhiều lần
let allProductsData = [];
let currentProductGroup = [];

// Lấy các phần tử DOM
const productSection = document.getElementById("productSection");
const productTitle = productSection.querySelector(".product-title");
const productPrice = productSection.querySelector(".product-price");
const productImage = productSection.querySelector(".product-image");
const specsBox = productSection.querySelector(".specs-box");
const ramButtonContainer = productSection.querySelector("#ramButton");
const colorButtonContainer = productSection.querySelector("#colorButton");
const buyNowBtn = productSection.querySelector(".buy-now-button");
const addToCartBtn = productSection.querySelector(".add-to-cart-button");

// ===================================
// HÀM KHỞI TẠO (ĐƯỢC GỌI TỪ MAIN.JS)
// ===================================
export async function initChiTietPage() {
  console.log("Khởi tạo trang chi tiết...");

  // 1. Lấy ID sản phẩm đã click từ localStorage
  const selectedId = localStorage.getItem("selectedProductId");
  if (!selectedId) {
    console.error("Không tìm thấy ID sản phẩm. Quay về trang chủ.");
    location.hash = "home";
    return;
  }

  // 2. Tải dữ liệu JSON (nếu chưa tải)
  if (allProductsData.length === 0) {
    try {
      const response = await fetch("../asset/data/dienthoai.json");
      if (!response.ok) throw new Error("Không thể tải JSON");
      allProductsData = await response.json();
    } catch (error) {
      console.error(error);
      productSection.innerHTML = "<h1>Lỗi tải dữ liệu sản phẩm.</h1>";
      return;
    }
  }

  // 3. Tìm sản phẩm được chọn
  const selectedProduct = allProductsData.find(p => p.id === selectedId);
  if (!selectedProduct) {
    console.error("Không tìm thấy sản phẩm với ID:", selectedId);
    location.hash = "home";
    return;
  }

  // 4. Tìm tất cả các sản phẩm liên quan (biến thể)
  // Nếu sản phẩm có group_id, tìm tất cả. Nếu không, nhóm chỉ là chính nó.
  currentProductGroup = selectedProduct.group_id
    ? allProductsData.filter(p => p.group_id === selectedProduct.group_id)
    : [selectedProduct];

  // 5. Hiển thị thông tin sản phẩm và các tùy chọn
  renderProductDetails(selectedProduct);
  
  // 6. Gắn sự kiện cho các nút Mua/Giỏ hàng (chỉ gắn 1 lần)
  // (Chúng ta có thể làm điều này bên ngoài hàm init, nhưng làm ở đây cũng ok)
}

// ===================================
// HÀM HIỂN THỊ CHI TIẾT SẢN PHẨM
// ===================================
function renderProductDetails(product) {
  productSection.dataset.currentId = product.id; // Lưu ID sản phẩm đang xem
  // 1. Cập nhật thông tin cơ bản (thông số này phải giống nhau)
  productTitle.textContent = product.ten;
  productImage.src = product.src;
  productImage.alt = product.ten;

  // 2. Cập nhật thông số kỹ thuật (lấy từ sản phẩm)
  specsBox.innerHTML = `
    <p><strong>CPU:</strong> ${product.cpu || 'N/A'}</p>
    <p><strong>RAM:</strong> ${product.ram || 'N/A'}</p>
    <p><strong>Camera:</strong> ${product.camera || 'N/A'}</p>
    <p><strong>Dung lượng pin:</strong> ${product.dung_luong_pin || 'N/A'}</p>
  `;

  // 3. Cập nhật thông tin biến thể (thông số này thay đổi được)
  productPrice.textContent = `${product.gia.toLocaleString()} VND`;

  // 4. Tạo các nút tùy chọn (RAM/Bộ nhớ)
  const availableRams = [...new Set(currentProductGroup.map(p => p.bo_nho))];
  ramButtonContainer.innerHTML = ""; // Xóa nút cũ
  availableRams.forEach(ram => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.textContent = ram;
    button.dataset.ram = ram;
    if (ram === product.bo_nho) {
      button.classList.add("active");
    }
    ramButtonContainer.appendChild(button);
  });

  // 5. Tạo các nút tùy chọn (Màu sắc)
  const availableColors = [...new Set(currentProductGroup.map(p => p.mau_sac))];
  colorButtonContainer.innerHTML = ""; // Xóa nút cũ
  availableColors.forEach(color => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.textContent = color;
    button.dataset.color = color;
    if (color === product.mau_sac) {
      button.classList.add("active");
    }
    colorButtonContainer.appendChild(button);
  });

  // 6. Gắn sự kiện cho các nút tùy chọn mới
  addVariantListeners();
}

// ===================================
// HÀM GẮN SỰ KIỆN CHO CÁC NÚT TÙY CHỌN
// ===================================
function addVariantListeners() {
  const ramButtons = ramButtonContainer.querySelectorAll(".option-button");
  const colorButtons = colorButtonContainer.querySelectorAll(".option-button");

  ramButtons.forEach(button => {
    button.addEventListener("click", () => handleVariantSelection(button, "ram"));
  });

  colorButtons.forEach(button => {
    button.addEventListener("click", () => handleVariantSelection(button, "color"));
  });
}

// ===================================
// HÀM XỬ LÝ KHI CHỌN 1 TÙY CHỌN MỚI
// ===================================
function handleVariantSelection(clickedButton, type) {
  // Lấy lựa chọn hiện tại
  const currentActiveRam = ramButtonContainer.querySelector(".active")?.dataset.ram;
  const currentActiveColor = colorButtonContainer.querySelector(".active")?.dataset.color;

  let newSelectedRam = currentActiveRam;
  let newSelectedColor = currentActiveColor;

  // Cập nhật lựa chọn mới
  if (type === "ram") {
    newSelectedRam = clickedButton.dataset.ram;
  } else {
    newSelectedColor = clickedButton.dataset.color;
  }

  // Tìm sản phẩm phù hợp nhất với lựa chọn MỚI
  let newProduct = currentProductGroup.find(p => 
    p.bo_nho === newSelectedRam && p.mau_sac === newSelectedColor
  );

  // Nếu không tìm thấy kết hợp chính xác (ví dụ: 512GB không có màu Trắng)
  // thì ưu tiên chọn đúng cái vừa click (ví dụ: Ram 512GB) và lấy màu đầu tiên
  if (!newProduct) {
    if (type === "ram") {
      newProduct = currentProductGroup.find(p => p.bo_nho === newSelectedRam);
    } else {
      newProduct = currentProductGroup.find(p => p.mau_sac === newSelectedColor);
    }
  }

  // Hiển thị lại toàn bộ thông tin với sản phẩm mới tìm được
  if(newProduct) {
    renderProductDetails(newProduct);
  }
}


// ===================================
// GẮN SỰ KIỆN CHO NÚT MUA NGAY
// ===================================
// Sự kiện này được chuyển từ Home.js sang
if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      // (Sau này có thể thêm logic lấy đúng sản phẩm đã chọn)
      location.hash = "thanhtoan";
    });
}