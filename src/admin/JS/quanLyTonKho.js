import { docdulieuLocalStorage } from "./readandwrite.js";

// ==============================
//  KHAI BÁO BIẾN & PHẦN TỬ HTML
// ==============================
let dataProducts = [];
let dataPhieuNhap = [];
let dataDonHang = [];

// Các phần tử DOM
const btnCurrentStock = document.getElementById("btn-current-stock");
const btnIESReport = document.getElementById("btn-ies-report");
const viewCurrentStock = document.getElementById("inventory-current-stock");
const viewReport = document.getElementById("inventory-report");

// View 1: Tồn kho hiện tại
const invSearch = document.getElementById("inv-search");
const invCategoryFilter = document.getElementById("inv-category-filter");
const invThreshold = document.getElementById("inv-threshold");
const invTableBody = document.querySelector(".inventory-table tbody");

// View 2: Báo cáo N-X-T
const reportStartDate = document.getElementById("report-start-date");
const reportEndDate = document.getElementById("report-end-date");
const btnGenerateReport = document.getElementById("btn-generate-report");
const reportTableBody = document.querySelector(".report-table tbody");

// ==============================
//  KHỞI TẠO KHI TẢI TRANG
// ==============================
window.addEventListener("hashchange", () => {
  if (location.hash === "#ds_soLuongTon") {
    initInventoryPage();
  }
});

// Load lần đầu nếu đang ở đúng trang
if (location.hash === "#ds_soLuongTon") {
  initInventoryPage();
}

function initInventoryPage() {
  // Tải dữ liệu
  dataProducts = docdulieuLocalStorage("dataProducts") || [];
  dataPhieuNhap = docdulieuLocalStorage("dataPhieuNhap") || [];
  dataDonHang = docdulieuLocalStorage("orders") || [];

  // Thiết lập
  populateCategoryFilter();
  renderCurrentStockTable(); // Hiển thị bảng tồn kho hiện tại mặc định
  setupEventListeners();
}

function setupEventListeners() {
  // 1. Chuyển đổi giữa 2 view
btnCurrentStock.addEventListener("click", () => {
  btnCurrentStock.classList.add("toggle-active");
  btnIESReport.classList.remove("toggle-active");
  viewCurrentStock.classList.add("view-active");
  viewReport.classList.remove("view-active");
});

btnIESReport.addEventListener("click", () => {
  btnIESReport.classList.add("toggle-active");
  btnCurrentStock.classList.remove("toggle-active");
  viewReport.classList.add("view-active");
  viewCurrentStock.classList.remove("view-active");
  // Mặc định render báo cáo khi chuyển tab
  renderReportTable();
});

  // 2. Bộ lọc cho Tồn kho hiện tại
  invSearch.addEventListener("input", renderCurrentStockTable);
  invCategoryFilter.addEventListener("change", renderCurrentStockTable);
  invThreshold.addEventListener("input", renderCurrentStockTable);

  // 3. Nút xem báo cáo N-X-T
  btnGenerateReport.addEventListener("click", renderReportTable);
}

// ==============================
//  VIEW 1: TỒN KHO HIỆN TẠI
// (Đáp ứng Yêu cầu 8.1 và 8.2)
// ==============================

// Đổ danh mục vào select filter
function populateCategoryFilter() {
  const categories = [...new Set(dataProducts.map((sp) => sp.loai))];
  invCategoryFilter.innerHTML = '<option value="all">Tất cả loại</option>';
  categories.forEach((cat) => {
    if (cat) {
      invCategoryFilter.innerHTML += `<option value="${cat}">${cat}</option>`;
    }
  });
}

// Hiển thị bảng Tồn kho hiện tại
function renderCurrentStockTable() {
  if (!invTableBody) return;

  const keyword = invSearch.value.trim().toLowerCase();
  const category = invCategoryFilter.value;
  const threshold = parseInt(invThreshold.value) || 0;

  // Lọc dữ liệu
  const filteredData = dataProducts.filter((sp) => {
    const matchKeyword = sp.ten.toLowerCase().includes(keyword);
    const matchCategory = category === "all" || sp.loai === category;
    return matchKeyword && matchCategory;
  });

  // Render
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
        <td>${sp.loai || "N/A"}</td>
        <td>${currentStock}</td>
        <td>${statusHtml}</td>
      </tr>
    `;
    invTableBody.innerHTML += row;
  });
}

// ==============================
//  VIEW 2: BÁO CÁO NHẬP-XUẤT-TỒN
// (Đáp ứng Yêu cầu 8.3)
// ==============================

function renderReportTable() {
  if (!reportTableBody) return;

  const startDate = reportStartDate.value
    ? new Date(reportStartDate.value)
    : null;
  const endDate = reportEndDate.value ? new Date(reportEndDate.value) : null;

  // Cài đặt endDate về cuối ngày
  if (endDate) endDate.setHours(23, 59, 59, 999);

  reportTableBody.innerHTML = "";

  // Dùng dataProducts làm danh sách sản phẩm gốc
  dataProducts.forEach((sp) => {
    let tongNhap = 0;
    let tongXuat = 0;
    const tonHienTai = sp.so_luong || 0;

    // 1. Tính Tổng Nhập (Từ dataPhieuNhap)
    dataPhieuNhap.forEach((pn) => {
      // Chỉ tính phiếu đã hoàn thành
      if (pn.trangThai !== "hoanThanh") return;

      // Kiểm tra ngày
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

    // 2. Tính Tổng Xuất (Từ dataDonHang / orders)
    dataDonHang.forEach((dh) => {
      // Kiểm tra ngày (Đơn hàng dùng ISO date)
      const ngayDat = new Date(dh.date);
      const inDateRange =
        (!startDate || ngayDat >= startDate) &&
        (!endDate || ngayDat <= endDate);

      if (inDateRange) {
        // Lưu ý: dataDonHang lưu bằng p.name, không phải p.id
        // Đây là một hạn chế của cấu trúc dữ liệu, ta phải khớp theo tên
        dh.products.forEach((p) => {
          if (p.name === sp.ten) {
            tongXuat += p.quantity;
          }
        });
      }
    });

    // 3. Render row
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

  if (dataProducts.length === 0) {
    reportTableBody.innerHTML = `<tr><td colspan="5">Chưa có sản phẩm nào.</td></tr>`;
  }
}

// ==============================
//  HÀM TIỆN ÍCH
// ==============================

// Chuyển đổi ngày "DD/MM/YYYY" sang đối tượng Date
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