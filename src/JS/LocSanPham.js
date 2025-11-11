// Import hàm resetToFirstPage thay vì resetVisibleProducts
import { displayProducts, resetToFirstPage } from "./Home.js";
import { docdulieuLocalStorage } from "./readandwrite.js";

//  BIẾN TOÀN CỤC
// ========================
let currentBrand = "all"; // cho hàng nút bên ngoài
let selectedBrands = []; // đa chọn trong popup
let searchKeyword = ""; // từ khóa tìm kiếm theo tên


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

    // Khi chọn bất kỳ nút ở ngoài, xóa lựa chọn hãng trong popup (nếu có)
    // để bộ lọc ngoài được ưu tiên
    selectedBrands = [];
    if (typeof popupBrandBtns !== 'undefined' && popupBrandBtns.length) {
      popupBrandBtns.forEach(pb => pb.classList.remove('active'));
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
const searchInput = document.querySelector(".name-options #search-input-loc");

//Lọc theo tên
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchKeyword = e.target.value.trim().toLowerCase();
    // Cập nhật hiển thị ngay khi thay đổi từ khóa
    updateDisplay();
  });
}

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
// Nếu có các nút chọn nhanh cho khoảng giá trong popup
const popupPriceBtns = document.querySelectorAll(".price-options .filter-btn");
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
    // Nếu chọn bất kỳ hãng nào trong popup, ưu tiên bộ lọc popup
    // => Xóa trạng thái active ở các nút filter-bar ngoài và đặt currentBrand về 'all'
    if (selectedBrands.length > 0) {
      brandBtns.forEach(b => b.classList.remove("active"));
      const allBtn = document.querySelector('.filter-bar .brand-btn[data-brand="all"]');
      if (allBtn) allBtn.classList.add("active");
      currentBrand = "all";
    }
  });
});

// ======= Đồng bộ slider <-> input (VNĐ có dấu chấm) =======
(() => {
  const rangeMin = document.getElementById("range-min");
  const rangeMax = document.getElementById("range-max");
  const inputMin = document.getElementById("price-min-input");
  const inputMax = document.getElementById("price-max-input");
  const rangeTrack = document.getElementById("range-track");

  if (!rangeMin || !rangeMax || !inputMin || !inputMax || !rangeTrack) return;

  const MIN = parseInt(rangeMin.min) || 0;
  const MAX = parseInt(rangeMax.max) || 100000000;
  const MIN_GAP = 1000000;
  const STEP = parseInt(rangeMin.step) || 100000;

  const nf = new Intl.NumberFormat("vi-VN");

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
  const formatCurrency = (v) => nf.format(Math.round(v || 0));
  const unformatCurrency = (v) =>
    parseInt(String(v || "").replace(/\D/g, "")) || 0;

  function updateRangeTrack() {
    const min = parseInt(rangeMin.value);
    const max = parseInt(rangeMax.value);
    const range = MAX - MIN;
    const left = ((min - MIN) / range) * 100;
    const right = ((max - MIN) / range) * 100;
    rangeTrack.style.background = `linear-gradient(to right, #e0e0e0 ${left}%, #007bff ${left}%, #007bff ${right}%, #e0e0e0 ${right}%)`;
  }

  function setFormattedInputs() {
    inputMin.value = formatCurrency(rangeMin.value);
    inputMax.value = formatCurrency(rangeMax.value);
  }

  // --- Slider -> Input ---
  rangeMin.addEventListener("input", () => {
    let min = parseInt(rangeMin.value);
    let max = parseInt(rangeMax.value);
    if (min > max - MIN_GAP) {
      min = max - MIN_GAP;
      rangeMin.value = min;
    }
    setFormattedInputs();
    updateRangeTrack();
  });

  rangeMax.addEventListener("input", () => {
    let min = parseInt(rangeMin.value);
    let max = parseInt(rangeMax.value);
    if (max < min + MIN_GAP) {
      max = min + MIN_GAP;
      rangeMax.value = max;
    }
    setFormattedInputs();
    updateRangeTrack();
  });

  // --- Input -> Slider ---
  inputMin.addEventListener("input", (e) => {
    // Lấy giá trị thô (bỏ ký tự không phải số), clamp theo giới hạn
    let val = unformatCurrency(e.target.value);
    let max = parseInt(rangeMax.value);
    val = clamp(val, MIN, max - MIN_GAP);
    rangeMin.value = val;
    // Không ép format ngay khi đang gõ để tránh di chuyển con trỏ;
    // format sẽ được áp dụng khi blur hoặc khi slider thay đổi
    updateRangeTrack();
  });

  inputMax.addEventListener("input", (e) => {
    let val = unformatCurrency(e.target.value);
    let min = parseInt(rangeMin.value);
    val = clamp(val, min + MIN_GAP, MAX);
    rangeMax.value = val;
    // Tương tự: không format ngay khi gõ
    updateRangeTrack();
  });

  // Khi rời ô thì format lại đẹp
  inputMin.addEventListener("blur", () => {
    inputMin.value = formatCurrency(rangeMin.value);
  });
  inputMax.addEventListener("blur", () => {
    inputMax.value = formatCurrency(rangeMax.value);
  });

  // Khởi tạo
  setFormattedInputs();
  updateRangeTrack();
})();




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
    // popupPriceBtns có thể không tồn tại trong HTML; kiểm tra an toàn
    if (popupPriceBtns && popupPriceBtns.length) popupPriceBtns.forEach(p => p.classList.remove("active"));
    selectedBrands = [];
    
    // Reset thanh ngoài
    brandBtns.forEach(b => b.classList.remove("active"));
    const allBtn = document.querySelector('.filter-bar .brand-btn[data-brand="all"]');
    if (allBtn) allBtn.classList.add("active");
    currentBrand = "all";
    
    // Reset ô tìm kiếm
    if (searchInput) {
      searchInput.value = "";
      searchKeyword = "";
    }
    
    // Reset thanh giá (nếu tồn tại)
    const rangeMin = document.getElementById("range-min");
    const rangeMax = document.getElementById("range-max");
    const inputMin = document.getElementById("price-min-input");
    const inputMax = document.getElementById("price-max-input");
    const rangeTrack = document.getElementById("range-track");
    if (rangeMin && rangeMax) {
      // Đặt về giá trị mặc định của input range
      rangeMin.value = rangeMin.min || 0;
      rangeMax.value = rangeMax.max || 100000000;
    }
    // Cập nhật ô nhập và style track
    if (inputMin && inputMax) {
      // Dùng cùng định dạng như hàm formatCurrency (Intl)
      const nf = new Intl.NumberFormat("vi-VN");
      inputMin.value = nf.format(Math.round(parseInt(rangeMin.value || 0) || 0));
      inputMax.value = nf.format(Math.round(parseInt(rangeMax.value || 100000000) || 100000000));
    }
    if (rangeTrack) {
      // Tính lại background giống updateRangeTrack
      const MIN = parseInt(rangeMin?.min) || 0;
      const MAX = parseInt(rangeMax?.max) || 100000000;
      const min = parseInt(rangeMin?.value) || MIN;
      const max = parseInt(rangeMax?.value) || MAX;
      const range = MAX - MIN || 1;
      const left = ((min - MIN) / range) * 100;
      const right = ((max - MIN) / range) * 100;
      rangeTrack.style.background = `linear-gradient(to right, #e0e0e0 ${left}%, #007bff ${left}%, #007bff ${right}%, #e0e0e0 ${right}%)`;
    }
    
    updateDisplay(); // Hiển thị lại tất cả sản phẩm
  });
}

// ========================
// HÀM LỌC & HIỂN THỊ (TRUNG TÂM)
// ========================
function updateDisplay() {
  // **BƯỚC QUAN TRỌNG:** Reset về trang 1 khi lọc
  resetToFirstPage();

  const price_min = document.getElementById("price-min-input");
  const price_max = document.getElementById("price-max-input");
  let Min = 0;
  let Max = 100000000;
  //Lấy giá từ ô input
  if (price_min && price_max) {
    const rawMin = parseInt(String(price_min.value).replace(/\D/g, ""), 10);
    const rawMax = parseInt(String(price_max.value).replace(/\D/g, ""), 10);
    if (!isNaN(rawMin)) Min = rawMin;
    if (!isNaN(rawMax)) Max = rawMax;
    // Đảm bảo Min không lớn hơn Max
    if (Min > Max) {
      const t = Min;
      Min = Max;
      Max = t;
    }
  }

  let filtered = docdulieuLocalStorage("dataProducts");

  // Lọc theo tên
  if (searchKeyword) {
    console.log("Đang tìm với từ khóa:", searchKeyword);
    filtered = filtered.filter((p) => {
      return p.ten.toLowerCase().includes(searchKeyword);
    });
  }

  // Lọc theo hãng (ngoài popup)
  // Chỉ lọc nếu *không* có lọc hãng nào trong popup được chọn
  if (currentBrand !== "all" && selectedBrands.length === 0) {
    filtered = filtered.filter(
      (p) => p.brand.toLowerCase() === currentBrand.toLowerCase()
    );
  }

  // Lọc theo hãng trong popup (đa chọn)
  // Nếu có chọn, nó sẽ ghi đè bộ lọc hãng bên ngoài
  if (selectedBrands.length > 0) {
    filtered = filtered.filter((p) =>
      selectedBrands.includes(p.brand.toLowerCase())
    );
  }

  // Lọc theo giá trong popup
  filtered = filtered.filter((p) => p.gia >= Min && p.gia <= Max);

  // Kiểm tra và hiển thị thông báo nếu không tìm thấy sản phẩm
  const productsGrid = document.querySelector(".products-grid");
  const productsSection = document.querySelector(".products-section");
  const oldmessage = document.querySelector(".no-products-message");
  if (oldmessage) oldmessage.remove();

  // Nếu không tìm thấy sản phẩm: hiển thị thông báo và ẩn/loại bỏ phân trang cũ
  if (filtered.length === 0) {
    
    if (productsGrid) productsGrid.innerHTML = '<div class="no-products-message">Không tìm thấy sản phẩm phù hợp</div>';

    // Loại bỏ container phân trang cũ nếu tồn tại — tránh hiển thị trang trước đó
    const pagination = document.getElementById("pagination-container");
    if (pagination) pagination.remove();

  } else {
    displayProducts(filtered);
  }

  // Cuộn tới vùng sản phẩm (nếu tồn tại)
  productsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
}
