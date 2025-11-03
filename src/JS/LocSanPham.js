// Import hàm resetToFirstPage thay vì resetVisibleProducts
import { allProducts, displayProducts, resetToFirstPage } from "./Home.js";

//  BIẾN TOÀN CỤC
// ========================
let currentBrand = "all"; // cho hàng nút bên ngoài
let selectedBrands = []; // đa chọn trong popup
let selectedPrice = { min: 0, max: Infinity };

// ========================
//  THANH LỌC HÃNG Ở NGOÀI
// ========================
const brandBtns = document.querySelectorAll(".filter-bar .brand-btn");

brandBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Bỏ active ở tất cả
    brandBtns.forEach(b => b.classList.remove("active"));

    // Nếu nhấn lại cùng nút thì trở về "all"
    if (currentBrand === btn.dataset.brand) {
      currentBrand = "all";
      // Tìm nút "Tất cả" và active nó
      const allBtn = document.querySelector('.filter-bar .brand-btn[data-brand="all"]');
      if (allBtn) allBtn.classList.add("active");
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

// Đóng popup khi click ra ngoài
filterPopup?.addEventListener("click", (e) => {
  if (e.target === filterPopup) {
    filterPopup.style.display = "none";
  }
});

// --------- Hãng (đa chọn) ---------
const popupBrandBtns = document.querySelectorAll(".brand-options .filter-btn");
popupBrandBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const brand = btn.dataset.brand;

    if (selectedBrands.includes(brand)) {
      selectedBrands = selectedBrands.filter(b => b !== brand);
      btn.classList.remove("active");
    } else {
      selectedBrands.push(brand);
      btn.classList.add("active");
    }
  });
});

// --------- Giá (chọn 1) ---------
const popupPriceBtns = document.querySelectorAll(".price-options .filter-btn");
popupPriceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    popupPriceBtns.forEach(p => p.classList.remove("active"));
    btn.classList.add("active");

    selectedPrice = {
      min: parseInt(btn.dataset.min) || 0,
      max: parseInt(btn.dataset.max) || Infinity,
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
    popupBrandBtns.forEach(b => b.classList.remove("active"));
    popupPriceBtns.forEach(p => p.classList.remove("active"));
    selectedBrands = [];
    selectedPrice = { min: 0, max: Infinity };
    
    // Reset thanh ngoài
    brandBtns.forEach(b => b.classList.remove("active"));
    const allBtn = document.querySelector('.filter-bar .brand-btn[data-brand="all"]');
    if (allBtn) allBtn.classList.add("active");
    currentBrand = "all";

    updateDisplay(); // Hiển thị lại tất cả sản phẩm
  });
}

// ========================
// HÀM LỌC & HIỂN THỊ (TRUNG TÂM)
// ========================
function updateDisplay() {
  // **BƯỚC QUAN TRỌNG:** Reset về trang 1 khi lọc
  resetToFirstPage();


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

  // Hiển thị số lượng kết quả tìm được (tùy chọn)
  console.log(`Tìm thấy ${filtered.length} sản phẩm`);

  // Gọi hàm hiển thị của Home.js với phân trang
  displayProducts(filtered);
  console.log(filtered);
}