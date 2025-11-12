import { showalert } from "../../JS/alert.js";
import {
  docdulieuLocalStorage,
  ghidulieuLocalStorage,
} from "./readandwrite.js";

let dsSanPham = [];
const tableBody = document.querySelector("#ds_giaBan .price-table tbody");
const categoryFilter = document.getElementById("categoryFilter");
const batchProfitInput = document.getElementById("batchProfitInput");
const btnApplyBatchProfit = document.getElementById("btnApplyBatchProfit");

// SỬA 1: Thêm ô tìm kiếm tên
const priceSearchProduct = document.getElementById("priceSearchProduct");

// Lấy 6 ô input (Min và Max) từ Pop-up
const costFilterInputMin = document.getElementById("costFilterInputMin");
const costFilterInputMax = document.getElementById("costFilterInputMax");
const profitFilterMin = document.getElementById("profitFilterMin");
const profitFilterMax = document.getElementById("profitFilterMax");
const priceFilterInputMin = document.getElementById("priceFilterInputMin");
const priceFilterInputMax = document.getElementById("priceFilterInputMax");

// Lấy các phần tử của Pop-up
const btnOpenSearchPopup = document.getElementById("btnOpenSearchPopup");
const btnCloseSearchPopup = document.getElementById("btnCloseSearchPopup");
const priceSearchOverlay = document.getElementById("priceSearchOverlay");
const priceSearchPopup = document.getElementById("priceSearchPopup");
const btnApplySearchPopup = document.getElementById("btnApplySearchPopup");
const btnResetSearchPopup = document.getElementById("btnResetSearchPopup");

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
  dsSanPham.forEach((sp) => {
    if (sp.giaBan === undefined) {
      sp.giaBan = sp.gia; // Khởi tạo giá bán = giá vốn nếu chưa có
    }
  });

  console.log("Loaded products from dataProducts:", dsSanPham);

  populateBrandFilter();
  renderTable(dsSanPham);
}

// Hàm điền (populate) bộ lọc hãng
function populateBrandFilter() {
  if (!categoryFilter) return;
  const brands = [...new Set(dsSanPham.map((sp) => sp.brand).filter(Boolean))];
  categoryFilter.innerHTML = `<option value="all">Tất cả hãng</option>`;
  brands.sort().forEach((brand) => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    categoryFilter.appendChild(option);
  });
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
      const loiNhuan = calculateProfit(sp.gia, sp.giaBan);
      return `
      <tr>
        <td>${sp.id}</td>
        <td>${sp.ten}</td>
        <td>${sp.brand || "N/A"}</td>
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
        showalert("Giá vốn không thể âm!", "warning");
        e.target.value = dsSanPham[index].gia;
        return;
      }

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
        showalert(
          "Giá trị không hợp lệ! Giá vốn không thể âm và giá bán phải lớn hơn 0.",
          "error"
        );
        return;
      }

      dsSanPham[index].gia = giaVon;
      dsSanPham[index].giaBan = giaBan;

      ghidulieuLocalStorage("dataProducts", dsSanPham);
      showalert("Đã lưu thành công!", "success");

      const profitInput = document.querySelector(
        `#ds_giaBan .profit-input[data-index="${index}"]`
      );
      profitInput.value = calculateProfit(giaVon, giaBan);
    });
  });
}

// SỬA 2: Cập nhật khối xử lý sự kiện
if (
  categoryFilter &&
  btnApplyBatchProfit &&
  btnOpenSearchPopup &&
  priceSearchProduct // Thêm ô tìm kiếm
) {
  // Lọc hãng (lọc ngay)
  categoryFilter.addEventListener("change", filterData);
  
  // SỬA 3: Lọc theo tên (lọc ngay)
  priceSearchProduct.addEventListener("input", filterData);

  // Cập nhật lợi nhuận hàng loạt
  btnApplyBatchProfit.addEventListener("click", applyBatchProfit);

  // --- Logic Pop-up Mới ---

  // Hàm bật/tắt pop-up
  const togglePopup = (show) => {
    if (show) {
      priceSearchOverlay.classList.add("show");
      priceSearchPopup.classList.add("show");
    } else {
      priceSearchOverlay.classList.remove("show");
      priceSearchPopup.classList.remove("show");
    }
  };

  // Mở Pop-up
  btnOpenSearchPopup.addEventListener("click", () => togglePopup(true));
  
  // Đóng Pop-up
  btnCloseSearchPopup.addEventListener("click", () => togglePopup(false));
  priceSearchOverlay.addEventListener("click", () => togglePopup(false));

  // Nút "Áp dụng" trong Pop-up
  btnApplySearchPopup.addEventListener("click", () => {
    filterData(); // Chỉ lọc khi nhấn nút này
    togglePopup(false); // Đóng pop-up
  });

  // Cập nhật nút "Xóa bộ lọc"
  btnResetSearchPopup.addEventListener("click", () => {
    costFilterInputMin.value = "";
    costFilterInputMax.value = "";
    profitFilterMin.value = "";
    profitFilterMax.value = "";
    priceFilterInputMin.value = "";
    priceFilterInputMax.value = "";
    
    filterData(); // Lọc lại với các ô trống
  });
}

// SỬA 4: Cập nhật hàm filterData
function filterData() {
  const category = categoryFilter.value;
  // Lấy keyword từ ô tìm kiếm tên
  const keyword = priceSearchProduct ? priceSearchProduct.value.toLowerCase().trim() : "";

  // Lấy giá trị Min (nếu rỗng, mặc định là 0)
  const minCost = Number(costFilterInputMin.value) || 0;
  const minProfit = Number(profitFilterMin.value) || 0;
  const minPrice = Number(priceFilterInputMin.value) || 0;

  // Lấy giá trị Max (nếu rỗng, mặc định là Vô hạn)
  const maxCost = costFilterInputMax.value === "" ? Infinity : Number(costFilterInputMax.value);
  const maxProfit = profitFilterMax.value === "" ? Infinity : Number(profitFilterMax.value);
  const maxPrice = priceFilterInputMax.value === "" ? Infinity : Number(priceFilterInputMax.value);


  const filteredData = dsSanPham.filter((sp) => {
    // 1. Lọc Hãng
    const matchCategory = category === "all" || sp.brand === category;

    // 2. Lọc Tên
    const matchKeyword = sp.ten.toLowerCase().includes(keyword);

    // 3. Lọc Giá Vốn (trong khoảng Min - Max)
    const matchCost = sp.gia >= minCost && sp.gia <= maxCost;

    // 4. Lọc % Lợi nhuận
    const currentProfit = calculateProfit(sp.gia, sp.giaBan);
    const matchProfit = currentProfit >= minProfit && currentProfit <= maxProfit;

    // 5. Lọc Giá Bán
    const matchPrice = sp.giaBan >= minPrice && sp.giaBan <= maxPrice;

    // Trả về true nếu khớp TẤT CẢ
    return matchCategory && matchKeyword && matchCost && matchProfit && matchPrice;
  });

  renderTable(filteredData);
}

// Hàm applyBatchProfit (GIỮ NGUYÊN)
function applyBatchProfit() {
  const selectedBrand = categoryFilter.value;
  const newProfit = Number(batchProfitInput.value);

  if (selectedBrand === "all") {
    showalert("Vui lòng chọn một hãng cụ thể để áp dụng!", "warning");
    return;
  }
  if (isNaN(newProfit) || batchProfitInput.value.trim() === "") {
    showalert("Vui lòng nhập một % lợi nhuận hợp lệ!", "warning");
    return;
  }

  if (
    !confirm(
      `Bạn có chắc muốn cập nhật % lợi nhuận thành ${newProfit}% cho TẤT CẢ sản phẩm của hãng "${selectedBrand}" không?`
    )
  ) {
    return;
  }

  let updateCount = 0;
  dsSanPham.forEach((sp) => {
    if (sp.brand === selectedBrand) {
      const giaVon = sp.gia;
      sp.giaBan = Math.round(giaVon * (1 + newProfit / 100));
      updateCount++;
    }
  });

  ghidulieuLocalStorage("dataProducts", dsSanPham);

  showalert(
    `Đã cập nhật ${updateCount} sản phẩm của hãng "${selectedBrand}".`,
    "success"
  );
  batchProfitInput.value = "";

  filterData();
}