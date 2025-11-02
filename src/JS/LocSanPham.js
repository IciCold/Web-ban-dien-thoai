// Import thêm hàm resetVisibleProducts
import { allProducts, displayProducts, resetVisibleProducts } from "./Home.js";

//  BIẾN TOÀN CỤC
// ========================
let currentBrand = "all"; // cho hàng nút bên ngoài
let selectedBrands = []; // đa chọn trong popup
let selectedPrice = { min: 0, max: Infinity };

// ========================
//  THANH LỌC HÃNG Ở NGOÀI
// ========================
const brandBtns = document.querySelectorAll(".filter-bar .brand-btn"); // Sửa selector để chính xác hơn

brandBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Bỏ active ở tất cả
    brandBtns.forEach(b => b.classList.remove("active"));

    // Nếu nhấn lại cùng nút thì trở về "all"
    if (currentBrand === btn.dataset.brand) {
      currentBrand = "all";
      // Tìm nút "Tất cả" và active nó
      document.querySelector('.filter-bar .brand-btn[data-brand="all"]').classList.add("active");
    } else {
       // Thêm active cho nút được nhấn
      btn.classList.add("active");
      currentBrand = btn.dataset.brand;
    }

    updateDisplay(); // Gọi hàm lọc và hiển thị
  });
});

// ========================
// POPUP LỌC
// ========================
const openFilter = document.getElementById("openFilter");
const closeFilter = document.getElementById("closeFilter");
const filterPopup = document.getElementById("filterPopup");
const applyFilter = document.getElementById("applyFilter");
const resetFilter = document.getElementById("resetFilter");

if (openFilter) {
    openFilter.addEventListener("click", () => {
        filterPopup.style.display = "flex";
    });
}

if (closeFilter) {
    closeFilter.addEventListener("click", () => {
        filterPopup.style.display = "none";
    });
}


// --------- Hãng (đa chọn) ---------
const popupBrandBtns = document.querySelectorAll(".brand-options .filter-btn");
popupBrandBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const brand = btn.dataset.brand; // Lấy từ data-brand cho nhất quán

    if (selectedBrands.includes(brand)) {
      selectedBrands = selectedBrands.filter(b => b !== brand);
      btn.classList.remove("active-btn");
    } else {
      selectedBrands.push(brand);
      btn.classList.add("active-btn");
    }
  });
});

// --------- Giá (chọn 1) ---------
const popupPriceBtns = document.querySelectorAll(".price-options .filter-btn");
popupPriceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    popupPriceBtns.forEach(p => p.classList.remove("active-btn"));
    btn.classList.add("active-btn");

    selectedPrice = {
      min: parseInt(btn.dataset.min) || 0, // Thêm || 0 để tránh NaN
      max: parseInt(btn.dataset.max) || Infinity, // Thêm || Infinity để tránh NaN
    };
  });
});

// --------- Áp dụng lọc ---------
if (applyFilter) {
    applyFilter.addEventListener("click", () => {
      filterPopup.style.display = "none";
      updateDisplay(); // Áp dụng lọc và hiển thị
    });
}

// --------- Bỏ lọc (Reset) ---------
if (resetFilter) {
    resetFilter.addEventListener("click", () => {
      // Reset popup
      popupBrandBtns.forEach(b => b.classList.remove("active-btn"));
      popupPriceBtns.forEach(p => p.classList.remove("active-btn"));
      selectedBrands = [];
      selectedPrice = { min: 0, max: Infinity };
      
      // Reset thanh ngoài
      brandBtns.forEach(b => b.classList.remove("active"));
      document.querySelector('.filter-bar .brand-btn[data-brand="all"]').classList.add("active");
      currentBrand = "all";

      updateDisplay(); // Hiển thị lại
    });
}

// ========================
// HÀM LỌC & HIỂN THỊ (TRUNG TÂM)
// ========================
function updateDisplay() {
  // **BƯỚC QUAN TRỌNG:** Reset lại số lượng "Xem thêm" về 8
  resetVisibleProducts();

  let filtered = [...allProducts];

  // Lọc theo hãng (ngoài popup)
  // Chỉ lọc nếu *không* có lọc hãng nào trong popup được chọn
  if (currentBrand !== "all" && selectedBrands.length === 0) {
    filtered = filtered.filter(p => p.brand === currentBrand);
  }

  // Lọc theo hãng trong popup (đa chọn)
  // Nếu có chọn, nó sẽ ghi đè bộ lọc hãng bên ngoài
  if (selectedBrands.length > 0) {
    filtered = filtered.filter(p =>
      selectedBrands.includes(p.brand.toLowerCase())
    );
  }

  // Lọc theo giá trong popup
  filtered = filtered.filter(
    p => p.price >= selectedPrice.min && p.price <= selectedPrice.max
  );

  // Gọi hàm hiển thị của Home.js
  displayProducts(filtered);
}