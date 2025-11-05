import { docdulieuLocalStorage, ghidulieuLocalStorage } from "./readandwrite.js";

let dsdonhang = [];
const divContainer = document.querySelector(".dh-table-container");
const formSearch = document.querySelector(".dh-search-form");

// Tải dữ liệu đơn hàng khi trang load
window.addEventListener("DOMContentLoaded", () => {
  dsdonhang = docdulieuLocalStorage("orders") || [];

  if (dsdonhang.length === 0) {
    console.log("Chưa có đơn hàng!");
  } else {
    console.log("Đã load đơn hàng");
  }

  updateTable(dsdonhang);
});

// Hàm cập nhật bảng hiển thị
function updateTable(data) {
  const table = document.querySelector(".dh-table");
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Chưa có đơn hàng nào!</td></tr>`;
    return;
  }

  data.forEach((donhang, index) => {
    const row = document.createElement("tr");

    // Định dạng trạng thái để hiển thị
    let statusText = donhang.status;
    if (statusText === "pending") statusText = "Chờ xử lý";
    else if (statusText === "shipping") statusText = "Đang giao";
    else if (statusText === "delivered") statusText = "Đã giao";

    row.innerHTML = `
      <td>${new Date(donhang.date).toLocaleDateString("vi-VN")}</td>
      <td>${donhang.customer}</td>
      <td>${donhang.total.toLocaleString("vi-VN")}₫</td>
      <td>${donhang.deliveryAddress}</td>
      <td>${statusText}</td>
      <td>
        <div class="dh-actions">
          <button class="dh-edit" data-index="${index}">Chi tiết</button>
          <button class="dh-update" data-index="${index}">Sửa</button>
          <button class="dh-del" data-index="${index}">Xóa</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  addRowEvents();
}

// =======================
// Thêm sự kiện các nút
// =======================
function addRowEvents() {
  const btnDelete = document.querySelectorAll(".dh-del");
  const btnDetail = document.querySelectorAll(".dh-edit");
  const btnUpdate = document.querySelectorAll(".dh-update");

  // XÓA
  btnDelete.forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      if (confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
        dsdonhang.splice(index, 1);
        ghidulieuLocalStorage("orders", dsdonhang);
        updateTable(dsdonhang);
      }
    });
  });

  // CHI TIẾT
  btnDetail.forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      const dh = dsdonhang[index];

      // Xử lý danh sách sản phẩm
      let productList = "";
      if (dh.products && Array.isArray(dh.products) && dh.products.length > 0) {
        productList = dh.products
          .map(
            (p, i) =>
              `${i + 1}. ${p.name} — ${p.quantity} x ${Number(
                p.price
              ).toLocaleString("vi-VN")}₫`
          )
          .join("\n");
      } else {
        productList = "(Không có sản phẩm)";
      }

      // Định dạng trạng thái hiển thị
      let statusText = dh.status;
      if (statusText === "pending") statusText = "Chờ xử lý";
      else if (statusText === "shipping") statusText = "Đang giao";
      else if (statusText === "delivered") statusText = "Đã giao";

      // Hiển thị chi tiết
      alert(
        `🧾 Chi tiết đơn hàng\n` +
          `───────────────────────────────\n` +
          `Mã đơn: ${dh.id || "(Không có)"}\n` +
          `Khách hàng: ${dh.customer}\n` +
          `Email: ${dh.customerEmail || "(Không có)"}\n` +
          `Ngày đặt: ${new Date(dh.date).toLocaleString("vi-VN")}\n` +
          `Địa chỉ giao hàng: ${dh.deliveryAddress}\n` +
          `Phương thức thanh toán: ${dh.paymentMethod || "(Không có)"}\n` +
          `\n📦 Sản phẩm:\n${productList}\n` +
          `───────────────────────────────\n` +
          `Tổng tiền: ${Number(dh.total).toLocaleString("vi-VN")}₫\n` +
          `Trạng thái: ${statusText}`
      );
    });
  });

  // SỬA
  btnUpdate.forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      const dh = dsdonhang[index];

      const newCustomer = prompt(
        "Nhập tên khách hàng mới (bỏ trống để giữ nguyên):",
        dh.customer
      );
      if (newCustomer === null) return;

      const newDateInput = prompt(
        "Nhập ngày đặt hàng mới (YYYY-MM-DD, bỏ trống để giữ nguyên):",
        new Date(dh.date).toISOString().slice(0, 10)
      );
      if (newDateInput === null) return;

      const newAddress = prompt(
        "Nhập địa chỉ giao hàng mới (bỏ trống để giữ nguyên):",
        dh.deliveryAddress
      );
      if (newAddress === null) return;

      const newStatusText = prompt(
        "Chọn trạng thái mới (Chờ xử lý / Đang giao / Đã giao, bỏ trống để giữ nguyên):",
        dh.status === "pending"
          ? "Chờ xử lý"
          : dh.status === "shipping"
          ? "Đang giao"
          : "Đã giao"
      );
      if (newStatusText === null) return;

      const updatedOrder = { ...dh };

      if (newCustomer.trim() !== "") updatedOrder.customer = newCustomer.trim();
      if (newDateInput.trim() !== "")
        updatedOrder.date = new Date(newDateInput).toISOString();
      if (newAddress.trim() !== "")
        updatedOrder.deliveryAddress = newAddress.trim();

      if (newStatusText.trim() !== "") {
        if (newStatusText === "Chờ xử lý") updatedOrder.status = "pending";
        else if (newStatusText === "Đang giao") updatedOrder.status = "shipping";
        else if (newStatusText === "Đã giao") updatedOrder.status = "delivered";
        else {
          alert("⚠️ Trạng thái không hợp lệ! Chỉ nhập: Chờ xử lý, Đang giao hoặc Đã giao.");
          return;
        }
      }

      dsdonhang[index] = updatedOrder;
      ghidulieuLocalStorage("orders", dsdonhang);

      alert("✅ Cập nhật đơn hàng thành công!");
      updateTable(dsdonhang);
    });
  });
}

// =======================
// TÌM KIẾM
// =======================
// TÌM KIẾM
formSearch.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputs = formSearch.querySelectorAll("input");
  const select = formSearch.querySelector("select");

  const keyword = inputs[0].value.trim().toLowerCase();
  const dateFrom = inputs[1].value ? new Date(inputs[1].value) : null;
  const dateTo = inputs[2].value ? new Date(inputs[2].value) : null;
  const status = select.value;

  const filtered = dsdonhang.filter((dh) => {
    const nameMatch = dh.customer.toLowerCase().includes(keyword);
    const date = new Date(dh.date);
    const inDateRange =
      (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);

    // So sánh trạng thái theo value chuẩn
    const statusMatch =
      !status || dh.status === status;

    return nameMatch && inDateRange && statusMatch;
  });

  updateTable(filtered);
});

// RESET BỘ LỌC
const btnReset = document.getElementById("resetFilter");
btnReset.addEventListener("click", () => {
  formSearch.reset(); // Xóa hết dữ liệu trong form
  updateTable(dsdonhang); // Hiển thị lại toàn bộ đơn hàng
});



