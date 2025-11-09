import { showalert } from "../../JS/alert.js";
import {
  docdulieuLocalStorage,
  ghidulieuLocalStorage,
} from "./readandwrite.js";

let dsSanPham = [];
const tableBody = document.querySelector("#ds_giaBan .price-table tbody");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchProduct");

// Load dữ liệu khi trang được tải
window.addEventListener("DOMContentLoaded", () => {
  // Thêm listener để khi chuyển trang thì load lại
  window.addEventListener("hashchange", () => {
    if (location.hash === "#ds_giaBan") {
      loadData();
    }
  });

  // Load lần đầu nếu đang ở đúng trang
  if (location.hash === "#ds_giaBan") {
    loadData();
  }
});

// Load và hiển thị dữ liệu
function loadData() {
  // Đọc từ "dataProducts"
  dsSanPham = docdulieuLocalStorage("dataProducts") || [];

  // Chuẩn hóa dữ liệu:
  // sp.gia (từ ds_sanpham.js) LÀ giá vốn.
  // Cần một trường mới là sp.giaBan (giá bán).
  dsSanPham.forEach((sp) => {
    if (sp.giaBan === undefined) {
      sp.giaBan = sp.gia; // Khởi tạo giá bán = giá vốn nếu chưa có
    }
  });

  console.log("Loaded products from dataProducts:", dsSanPham);
  renderTable(dsSanPham);
}

// Render bảng giá
function renderTable(data) {
  if (!tableBody) {
    console.error("Không tìm thấy table body!");
    return;
  }
  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Không có dữ liệu</td></tr>`;
    return;
  }

  tableBody.innerHTML = data
    .map((sp, index) => {
      // SỬA 1: Dùng sp.gia (giá vốn) và sp.giaBan (giá bán)
      const loiNhuan = calculateProfit(sp.gia, sp.giaBan);
      return `
      <tr>
        <td>${sp.id}</td>
        <td>${sp.ten}</td>
        <td>${sp.loai}</td>
        <td>
          <input type="number" class="cost-input" value="${
            sp.gia
          }" data-index="${index}">
        </td>
        <td>
          <input type="number" class="profit-input" value="${loiNhuan}" data-index="${index}">
        </td>
        <td>
          <input type="number" class="price-input" value="${
            sp.giaBan
          }" data-index="${index}">
        </td>
        <td>
          <button class="save-btn" data-index="${index}">Lưu</button>
        </td>
      </tr>
    `;
    })
    .join("");

  addEventListeners();
}

// Tính % lợi nhuận
function calculateProfit(giaVon, giaBan) {
  // sp.gia là giá vốn
  if (!giaVon || giaVon <= 0) {
    return 0;
  }
  return Math.round(((giaBan - giaVon) / giaVon) * 100);
}

// Thêm các sự kiện
function addEventListeners() {
  // Xử lý khi thay đổi giá vốn (cost-input)
  document.querySelectorAll("#ds_giaBan .cost-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const index = e.target.dataset.index;
      const giaVon = Number(e.target.value);
      const profitInput = document.querySelector(
        `#ds_giaBan .profit-input[data-index="${index}"]`
      );
      const priceInput = document.querySelector(
        `#ds_giaBan .price-input[data-index="${index}"]`
      );

      if (giaVon < 0) {
        showalert("Giá vốn không thể âm!","warning");
        e.target.value = dsSanPham[index].gia; // Reset về giá trị cũ
        return;
      }

      // Tính lại giá bán dựa trên % lợi nhuận hiện tại
      const giaBan = giaVon * (1 + Number(profitInput.value) / 100);
      priceInput.value = Math.round(giaBan);
    });
  });

  // Xử lý khi thay đổi % lợi nhuận
  document.querySelectorAll("#ds_giaBan .profit-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const index = e.target.dataset.index;
      const loiNhuan = Number(e.target.value);
      const costInput = document.querySelector(
        `#ds_giaBan .cost-input[data-index="${index}"]`
      );
      const priceInput = document.querySelector(
        `#ds_giaBan .price-input[data-index="${index}"]`
      );

      // Tính lại giá bán dựa trên giá vốn và % lợi nhuận mới
      const giaBan = Number(costInput.value) * (1 + loiNhuan / 100);
      priceInput.value = Math.round(giaBan);
    });
  });

  // Xử lý khi nhấn nút Lưu
  document.querySelectorAll("#ds_giaBan .save-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      const giaVon = Number(
        document.querySelector(
          `#ds_giaBan .cost-input[data-index="${index}"]`
        ).value
      );
      const giaBan = Number(
        document.querySelector(
          `#ds_giaBan .price-input[data-index="${index}"]`
        ).value
      );

      if (giaVon < 0 || giaBan <= 0) {
        showalert("Giá trị không hợp lệ! Giá vốn không thể âm và giá bán phải lớn hơn 0.","error");
        return;
      }

      // SỬA 2: Cập nhật 'gia' (giá vốn) và 'giaBan' (giá bán)
      dsSanPham[index].gia = giaVon;
      dsSanPham[index].giaBan = giaBan;

      // Lưu lại vào "dataProducts"
      ghidulieuLocalStorage("dataProducts", dsSanPham);
      showalert("Đã lưu thành công!","success");

      // Cập nhật lại % lợi nhuận trên UI
      const profitInput = document.querySelector(
        `#ds_giaBan .profit-input[data-index="${index}"]`
      );
      profitInput.value = calculateProfit(giaVon, giaBan);
    });
  });
}

// Xử lý lọc và tìm kiếm
if (categoryFilter && searchInput) {
  categoryFilter.addEventListener("change", filterData);
  searchInput.addEventListener("input", filterData);
}

function filterData() {
  const category = categoryFilter.value;
  const keyword = searchInput.value.toLowerCase().trim();

  const filteredData = dsSanPham.filter((sp) => {
    const matchCategory = category === "all" || sp.loai === category;
    const matchKeyword = sp.ten.toLowerCase().includes(keyword);
    return matchCategory && matchKeyword;
  });

  renderTable(filteredData);
}