import { docdulieuLocalStorage } from "./readandwrite.js";
// ===================================
// KHAI BÁO BIẾN CHO TRANG CHI TIẾT
// ===================================
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
// HÀM KHỞI TẠO TRANG CHI TIẾT
// ===================================
export async function initChiTietPage() {
  console.log("Khởi tạo trang chi tiết...");

  // 1️⃣ Lấy ID sản phẩm đã click từ localStorage
  const selectedId = localStorage.getItem("selectedProductId");
  if (!selectedId) {
    console.error("Không tìm thấy ID sản phẩm. Quay về trang chủ.");
    location.hash = "home";
    return;
  }

  // 2️⃣ Đọc dữ liệu có sẵn trong localStorage
  const localProducts = docdulieuLocalStorage("allProducts");
  //const jsonProducts = docdulieuLocalStorage("jsonProducts"); // nếu có
  //const allData = [...localProducts, ...jsonProducts];

  if (localProducts.length === 0) {
    productSection.innerHTML = "<h1>Không có dữ liệu sản phẩm.</h1>";
    return;
  }

  /* 3️⃣ Chuẩn hóa dữ liệu
  allProductsData = allData.map(item => ({
    ...item,
    id: item.id,
    ten: item.ten || item.tensp,
    src: item.src || item.anh,
    gia: item.gia,
    cpu: item.cpu,
    camera: item.camera,
    ram: item.ram,
    dung_luong_pin: item.dung_luong_pin || item.battery,
    bo_nho: item.bo_nho || item.memory,
    mau_sac: item.mau_sac || item.color,
    group_id: item.group_id
  }));*/

  // 4️⃣ Tìm sản phẩm đang được chọn
  const selectedProduct = localProducts.find(p => p.id === selectedId);
  if (!selectedProduct) {
    console.error("Không tìm thấy sản phẩm với ID:", selectedId);
    location.hash = "home";
    return;
  }

  // 5️⃣ Lấy nhóm biến thể
  currentProductGroup = selectedProduct.group_id
    ? allProductsData.filter(p => p.group_id === selectedProduct.group_id)
    : [selectedProduct];

  // 6️⃣ Hiển thị thông tin
  renderProductDetails(selectedProduct);
}

// ===================================
// HÀM HIỂN THỊ CHI TIẾT SẢN PHẨM
// ===================================
function renderProductDetails(product) {
  productSection.dataset.currentId = product.id;

  productTitle.textContent = product.ten;
  productImage.src = product.src;
  productImage.alt = product.ten;

  specsBox.innerHTML = `
    <p><strong>CPU:</strong> ${product.cpu || 'N/A'}</p>
    <p><strong>RAM:</strong> ${product.ram || 'N/A'}</p>
    <p><strong>Camera:</strong> ${product.camera || 'N/A'}</p>
    <p><strong>Dung lượng pin:</strong> ${product.dung_luong_pin || 'N/A'}</p>
  `;

  productPrice.textContent = `${product.gia?.toLocaleString() || "N/A"} VND`;

  // Tạo nút RAM / Bộ nhớ
  const availableRams = [...new Set(currentProductGroup.map(p => p.bo_nho))];
  ramButtonContainer.innerHTML = "";
  availableRams.forEach(ram => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.textContent = ram;
    button.dataset.ram = ram;
    if (ram === product.bo_nho) button.classList.add("active");
    ramButtonContainer.appendChild(button);
  });

  // Tạo nút màu sắc
  const availableColors = [...new Set(currentProductGroup.map(p => p.mau_sac))];
  colorButtonContainer.innerHTML = "";
  availableColors.forEach(color => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.textContent = color;
    button.dataset.color = color;
    if (color === product.mau_sac) button.classList.add("active");
    colorButtonContainer.appendChild(button);
  });

  addVariantListeners();
}

// ===================================
// GẮN SỰ KIỆN CHO NÚT TÙY CHỌN
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
// XỬ LÝ KHI CHỌN BIẾN THỂ
// ===================================
function handleVariantSelection(clickedButton, type) {
  const currentActiveRam = ramButtonContainer.querySelector(".active")?.dataset.ram;
  const currentActiveColor = colorButtonContainer.querySelector(".active")?.dataset.color;

  let newSelectedRam = currentActiveRam;
  let newSelectedColor = currentActiveColor;

  if (type === "ram") {
    newSelectedRam = clickedButton.dataset.ram;
  } else {
    newSelectedColor = clickedButton.dataset.color;
  }

  let newProduct = currentProductGroup.find(
    p => p.bo_nho === newSelectedRam && p.mau_sac === newSelectedColor
  );

  if (!newProduct) {
    newProduct = type === "ram"
      ? currentProductGroup.find(p => p.bo_nho === newSelectedRam)
      : currentProductGroup.find(p => p.mau_sac === newSelectedColor);
  }

  if (newProduct) renderProductDetails(newProduct);
}

// ===================================
// NÚT MUA NGAY
// ===================================
if (buyNowBtn) {
  buyNowBtn.addEventListener("click", () => {
    location.hash = "thanhtoan";
  });
}
