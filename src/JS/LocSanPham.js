//  BIẾN TOÀN CỤC
// ========================
let currentBrand = "all"; // cho hàng nút bên ngoài
let selectedBrands = []; // đa chọn trong popup
let selectedPrice = { min: 0, max: Infinity };

// ========================
//  THANH LỌC HÃNG Ở NGOÀI
// ========================
const brandBtns = document.querySelectorAll(".filter-bar .filter-btn");

brandBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Bỏ active ở tất cả
    brandBtns.forEach(b => b.classList.remove("active-btn"));

    // Nếu nhấn lại cùng nút thì trở về "all"
    if (currentBrand === btn.dataset.brand) {
      currentBrand = "all";
      updateDisplay();
      return;
    }

    // Thêm active
    btn.classList.add("active-btn");
    currentBrand = btn.dataset.brand;

    updateDisplay();
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

openFilter.addEventListener("click", () => {
  filterPopup.style.display = "flex";
});

closeFilter.addEventListener("click", () => {
  filterPopup.style.display = "none";
});

// --------- Hãng (đa chọn) ---------
const popupBrandBtns = document.querySelectorAll(".brand-options .filter-btn");
popupBrandBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const brand = btn.textContent.trim().toLowerCase();

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
      min: parseInt(btn.dataset.min),
      max: parseInt(btn.dataset.max),
    };
  });
});

// --------- Áp dụng lọc ---------
applyFilter.addEventListener("click", () => {
  filterPopup.style.display = "none";
  updateDisplay();
});

// --------- Bỏ lọc ---------
resetFilter.addEventListener("click", () => {
  popupBrandBtns.forEach(b => b.classList.remove("active-btn"));
  popupPriceBtns.forEach(p => p.classList.remove("active-btn"));
  selectedBrands = [];
  selectedPrice = { min: 0, max: Infinity };
  updateDisplay();
});

// ========================
// HÀM LỌC & HIỂN THỊ
// ========================
function updateDisplay() {
  let filtered = [...allProducts];

  // Lọc theo hãng (ngoài popup)
  if (currentBrand !== "all") {
    filtered = filtered.filter(p => p.brand === currentBrand);
  }

  // Lọc theo hãng trong popup (đa chọn)
  if (selectedBrands.length > 0) {
    filtered = filtered.filter(p =>
      selectedBrands.includes(p.brand.toLowerCase())
    );
  }

  // Lọc theo giá trong popup
  filtered = filtered.filter(
    p => p.price >= selectedPrice.min && p.price <= selectedPrice.max
  );

  displayProducts(filtered);
}
