import {
  docdulieuLocalStorage,
  docJSONvaLuuLocalStorage,
} from "./readandwrite.js";

// ==============================
//  KHAI BÁO BIẾN & PHẦN TỬ HTML
// ==============================
let dataProducts = [];
let dataPhieuNhap = [];
let dataDonHang = [];
let currentSortState = "none"; // Trạng thái sắp xếp: "none", "asc", "desc"

// Các phần tử DOM chính
const btnCurrentStock = document.getElementById("btn-current-stock");
const btnIESReport = document.getElementById("btn-ies-report");
const viewCurrentStock = document.getElementById("inventory-current-stock");
const viewReport = document.getElementById("inventory-report");

// View 1: Tồn kho hiện tại
const invSearch = document.getElementById("inv-search");
const invBrandFilter = document.getElementById("inv-brand-filter");
const invThreshold = document.getElementById("inv-threshold");
const invTableBody = document.querySelector(".inventory-table tbody");
const btnSortStockAsc = document.getElementById("btn-sort-stock-asc");
const btnSortStockDesc = document.getElementById("btn-sort-stock-desc");

// View 2: Báo cáo N-X-T
const reportTableBody = document.querySelector(".report-table tbody");
// SỬA 1: Thêm bộ lọc cho tab Báo Cáo
const reportSearchProduct = document.getElementById("report-search-product");
const reportBrandFilter = document.getElementById("report-brand-filter");
// Input ngày (trong popup)
const reportStartDate = document.getElementById("report-start-date"); 
const reportEndDate = document.getElementById("report-end-date"); 

// Các phần tử của Popup Lọc Báo Cáo
const btnOpenReportDatePopup = document.getElementById("btnOpenReportDatePopup");
const btnCloseReportDatePopup = document.getElementById("btnCloseReportDatePopup");
const reportDateFilterOverlay = document.getElementById("reportDateFilterOverlay");
const reportDateFilterPopup = document.getElementById("reportDateFilterPopup");
const btnApplyReportDateFilter = document.getElementById("btnApplyReportDateFilter");
const btnResetReportDateFilter = document.getElementById("btnResetReportDateFilter");

// ==============================
//  KHỞI TẠO KHI TẢI TRANG
// ==============================
window.addEventListener("hashchange", () => {
  if (location.hash === "#ds_soLuongTon") {
    initInventoryPage();
  }
});

if (location.hash === "#ds_soLuongTon") {
  initInventoryPage();
}

async function initInventoryPage() {
  currentSortState = "none"; 

  // Tải dữ liệu
  dataProducts = docdulieuLocalStorage("dataProducts");
  if (!dataProducts || dataProducts.length === 0) {
    console.log("Tồn kho: localStorage rỗng, đọc từ dienthoai.json...");
    dataProducts = await docJSONvaLuuLocalStorage(
      "dataProducts",
      "../../asset/data/dienthoai.json"
    );
  }

  dataPhieuNhap = docdulieuLocalStorage("dataPhieuNhap") || [];
  dataDonHang = docdulieuLocalStorage("orders") || [];

  // Thiết lập
  populateBrandFilter(); // Điền bộ lọc cho tab Tồn Kho
  populateReportBrandFilter(); // SỬA 2: Điền bộ lọc cho tab Báo Cáo
  
  renderCurrentStockTable(); // Render bảng tồn kho ban đầu
  renderReportTable(); // Render báo cáo ban đầu
  setupEventListeners();
}

// SỬA 3: Cập nhật hàm setupEventListeners
function setupEventListeners() {
  
  // 1. Chuyển đổi giữa 2 view
  if (btnCurrentStock && btnIESReport && viewCurrentStock && viewReport) {
    btnCurrentStock.addEventListener("click", () => {
      btnCurrentStock.classList.add("toggle-active");
      btnIESReport.classList.remove("toggle-active");
      viewCurrentStock.classList.add("view-active");
      viewReport.classList.remove("view-active");
      currentSortState = "none";
      renderCurrentStockTable();
    });

    btnIESReport.addEventListener("click", () => {
      btnIESReport.classList.add("toggle-active");
      btnCurrentStock.classList.remove("toggle-active");
      viewReport.classList.add("view-active");
      viewCurrentStock.classList.remove("view-active");
      renderReportTable();
    });
  }

  // 2. Bộ lọc cho Tồn kho hiện tại (View 1)
  if (invSearch) invSearch.addEventListener("input", renderCurrentStockTable);
  if (invBrandFilter) invBrandFilter.addEventListener("change", renderCurrentStockTable);
  if (invThreshold) {
    invThreshold.addEventListener("input", () => {
      currentSortState = "asc"; 
      renderCurrentStockTable();
    });
  }

  // 3. Bộ lọc cho Báo Cáo (View 2)
  // Lọc Tên SP và Hãng (lọc ngay lập tức)
  if(reportSearchProduct) reportSearchProduct.addEventListener("input", renderReportTable);
  if(reportBrandFilter) reportBrandFilter.addEventListener("change", renderReportTable);

  // Event Listeners cho Popup Lọc Báo Cáo
  if (btnOpenReportDatePopup && btnCloseReportDatePopup && reportDateFilterOverlay && reportDateFilterPopup && btnApplyReportDateFilter && btnResetReportDateFilter) {
    
    const toggleReportPopup = (show) => {
      if(show) {
        reportDateFilterOverlay.classList.add("show");
        reportDateFilterPopup.classList.add("show");
      } else {
        reportDateFilterOverlay.classList.remove("show");
        reportDateFilterPopup.classList.remove("show");
      }
    };

    btnOpenReportDatePopup.addEventListener("click", () => toggleReportPopup(true));
    btnCloseReportDatePopup.addEventListener("click", () => toggleReportPopup(false));
    reportDateFilterOverlay.addEventListener("click", () => toggleReportPopup(false));

    btnApplyReportDateFilter.addEventListener("click", () => {
      renderReportTable(); // Gọi hàm render báo cáo
      toggleReportPopup(false); // Đóng popup
    });

    btnResetReportDateFilter.addEventListener("click", () => {
      reportStartDate.value = "";
      reportEndDate.value = "";
      renderReportTable(); // Render lại báo cáo (không có ngày)
    });
  }

  // 4. Nút sắp xếp (cho View 1)
  if (btnSortStockAsc && btnSortStockDesc) {
    btnSortStockAsc.addEventListener("click", () => {
      currentSortState = "asc";
      renderCurrentStockTable();
    });

    btnSortStockDesc.addEventListener("click", () => {
      currentSortState = "desc";
      renderCurrentStockTable();
    });
  }
}

// ==============================
//  VIEW 1: TỒN KHO HIỆN TẠI
// (Không thay đổi)
// ==============================

function populateBrandFilter() {
  if (!invBrandFilter) return;
  const brands = [...new Set(dataProducts.map((sp) => sp.brand))];
  invBrandFilter.innerHTML = '<option value="all">Tất cả hãng</option>';
  brands.forEach((brand) => {
    if (brand) {
      invBrandFilter.innerHTML += `<option value="${brand}">${brand}</option>`;
    }
  });
}

function renderCurrentStockTable() {
  if (!invTableBody) return;

  const keyword = invSearch ? invSearch.value.trim().toLowerCase() : "";
  const brand = invBrandFilter ? invBrandFilter.value : "all";
  const threshold = invThreshold ? parseInt(invThreshold.value) || 0 : 0;
  
  let filteredData = dataProducts.filter((sp) => {
    const matchKeyword = sp.ten.toLowerCase().includes(keyword);
    const matchBrand = brand === "all" || sp.brand === brand;
    return matchKeyword && matchBrand;
  });

  if (currentSortState === "asc") {
    filteredData.sort((a, b) => (a.so_luong || 0) - (b.so_luong || 0));
  } else if (currentSortState === "desc") {
    filteredData.sort((a, b) => (b.so_luong || 0) - (a.so_luong || 0));
  }

  if (btnSortStockAsc && btnSortStockDesc) {
    btnSortStockAsc.classList.toggle("active", currentSortState === "asc");
    btnSortStockDesc.classList.toggle("active", currentSortState === "desc");
  }

  invTableBody.innerHTML = "";
  if (filteredData.length === 0) {
    invTableBody.innerHTML = `<tr><td colspan="5">Không tìm thấy sản phẩm.</td></tr>`;
    return;
  }

  filteredData.forEach((sp) => {
    const currentStock = sp.so_luong || 0;
    const isLowStock = currentStock <= threshold;
    const statusHtml = isLowStock
      ? `<span class="status-low">Sắp hết hàng</span>`
      : `<span class="status-ok">Còn hàng</span>`;

    const row = `
      <tr>
        <td>${sp.id}</td>
        <td>${sp.ten}</td>
        <td>${sp.brand || "N/A"}</td>
        <td>${currentStock}</td>
        <td>${statusHtml}</td>
      </tr>
    `;
    invTableBody.innerHTML += row;
  });
}

// ==============================
//  VIEW 2: BÁO CÁO NHẬP-XUẤT-TỒN
// ==============================

// SỬA 4: Thêm hàm populate cho bộ lọc hãng của tab Báo Cáo
function populateReportBrandFilter() {
  if (!reportBrandFilter) return;
  const brands = [...new Set(dataProducts.map((sp) => sp.brand))];
  reportBrandFilter.innerHTML = '<option value="all">Tất cả hãng</option>';
  brands.forEach((brand) => {
    if (brand) {
      reportBrandFilter.innerHTML += `<option value="${brand}">${brand}</option>`;
    }
  });
}

// SỬA 5: Cập nhật hàm renderReportTable
function renderReportTable() {
  if (!reportTableBody) return;

  // 1. Lấy giá trị bộ lọc
  // Lọc Ngày (từ popup)
  const startDate = reportStartDate && reportStartDate.value
    ? new Date(reportStartDate.value)
    : null;
  const endDate = reportEndDate && reportEndDate.value ? new Date(reportEndDate.value) : null;
  if (endDate) endDate.setHours(23, 59, 59, 999);
  
  // Lọc Tên SP và Hãng
  const keyword = reportSearchProduct ? reportSearchProduct.value.trim().toLowerCase() : "";
  const brand = reportBrandFilter ? reportBrandFilter.value : "all";

  // 2. Lọc danh sách sản phẩm (dataProducts) TRƯỚC
  const filteredProducts = dataProducts.filter(sp => {
    const matchKeyword = sp.ten.toLowerCase().includes(keyword);
    const matchBrand = brand === "all" || sp.brand === brand;
    return matchKeyword && matchBrand;
  });


  reportTableBody.innerHTML = "";

  // 3. Lặp qua danh sách SẢN PHẨM ĐÃ LỌC
  filteredProducts.forEach((sp) => {
    let tongNhap = 0;
    let tongXuat = 0;
    const tonHienTai = sp.so_luong || 0;

    // Tính Tổng Nhập (Từ dataPhieuNhap)
    dataPhieuNhap.forEach((pn) => {
      if (pn.trangThai !== "hoanThanh") return;
      const ngayNhap = parseVietnameseDate(pn.ngayNhap);
      if (ngayNhap) {
        const inDateRange =
          (!startDate || ngayNhap >= startDate) &&
          (!endDate || ngayNhap <= endDate);

        if (inDateRange) {
          pn.chiTiet.forEach((item) => {
            if (item.idSP === sp.id) {
              tongNhap += item.soLuong;
            }
          });
        }
      }
    });

    // Tính Tổng Xuất (Từ dataDonHang / orders)
    dataDonHang.forEach((dh) => {
      const ngayDat = new Date(dh.date);
      const inDateRange =
        (!startDate || ngayDat >= startDate) &&
        (!endDate || ngayDat <= endDate);

      if (inDateRange) {
        dh.products.forEach((p) => {
          if (p.name === sp.ten) {
            tongXuat += p.quantity;
          }
        });
      }
    });

    // Render row
    const row = `
      <tr>
        <td>${sp.id}</td>
        <td>${sp.ten}</td>
        <td>${tongNhap}</td>
        <td>${tongXuat}</td>
        <td>${tonHienTai}</td>
      </tr>
    `;
    reportTableBody.innerHTML += row;
  });

  if (filteredProducts.length === 0) { // Cập nhật điều kiện rỗng
    reportTableBody.innerHTML = `<tr><td colspan="5">Không tìm thấy sản phẩm nào.</td></tr>`;
  }
}

// ==============================
//  HÀM TIỆN ÍCH
// (Không thay đổi)
// ==============================

function parseVietnameseDate(dateStr) {
  try {
    const parts = dateStr.split("/");
    // new Date(year, monthIndex, day)
    return new Date(parts[2], parts[1] - 1, parts[0]);
  } catch (e) {
    console.error("Lỗi parse ngày:", dateStr);
    return null;
  }
}