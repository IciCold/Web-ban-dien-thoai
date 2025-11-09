import { docdulieuLocalStorage, ghidulieuLocalStorage } from "./readandwrite.js";
import {showalert} from "../../JS/alert.js";
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

    // Định dạng trạng thái hiển thị và tạo select option
    const statusOptions = `
      <option value="pending" ${donhang.status === "pending" ? "selected" : ""}>Chờ xử lý</option>
      <option value="shipping" ${donhang.status === "shipping" ? "selected" : ""}>Đang giao</option>
      <option value="delivered" ${donhang.status === "delivered" ? "selected" : ""}>Đã giao</option>
    `;

    row.innerHTML = `
      <td>${new Date(donhang.date).toLocaleDateString("vi-VN")}</td>
      <td>${donhang.customer}</td>
      <td>${donhang.total.toLocaleString("vi-VN")}₫</td>
      <td>${donhang.deliveryAddress}</td>
      <td>
        <select class="dh-status-select" data-index="${index}">
          ${statusOptions}
        </select>
      </td>
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
// ===================================
// HÀM XỬ LÝ CẬP NHẬT TỒN KHO KHI GIAO HOẶC HỦY GIAO
// isDelivery: true (trừ), false (cộng)
// ===================================
function capNhatTonKhoKhiGiaoHang(order, isDelivery) {
  // 1. Lấy danh sách sản phẩm tổng (kho hàng)
  let dataProducts = docdulieuLocalStorage("dataProducts");
  const productsInOrder = order.products;
  const operation = isDelivery ? "trừ" : "cộng";

  // 2. Hàm tiện ích tìm Index (BỀN VỮNG HƠN)
  const findProductIndex = (productName) => {
    const normalizedName = (productName || '').trim().toLowerCase();
    return dataProducts.findIndex(p => (p.ten || '').trim().toLowerCase() === normalizedName);
  };

  // 3. Kiểm tra tính hợp lệ TRƯỚC KHI TRỪ (chỉ áp dụng khi trừ)
  if (isDelivery) {
    for (const item of productsInOrder) {
      const productName = item.name;
      const quantityNeeded = item.quantity;
      // Dùng hàm tìm mới
      const productIndex = findProductIndex(productName); 

      if (productIndex === -1) {
        return { success: false, action: operation, productName: productName, reason: "Sản phẩm không tồn tại trong kho (Có thể do tên sản phẩm đã bị thay đổi)." };
      }

      const currentStock = dataProducts[productIndex].so_luong || 0;

      if (currentStock < quantityNeeded) {
        return { success: false, action: operation, productName: productName, reason: `Không đủ hàng (Cần ${quantityNeeded}, chỉ còn ${currentStock}).` };
      }
    }
  }

  // 4. Thực hiện Cập nhật kho hàng
  for (const item of productsInOrder) {
    const productName = item.name;
    const quantity = item.quantity;
    // Dùng hàm tìm mới
    const productIndex = findProductIndex(productName); 

    if (productIndex !== -1) {
      if (isDelivery) {
        // TRỪ TỒN KHO: Khi chuyển sang "Đã giao"
        dataProducts[productIndex].so_luong -= quantity;
      } else {
        // CỘNG TỒN KHO: Khi chuyển từ "Đã giao" sang trạng thái khác
        dataProducts[productIndex].so_luong = (dataProducts[productIndex].so_luong || 0) + quantity;
      }
      // Đảm bảo số lượng không âm
      if (dataProducts[productIndex].so_luong < 0) {
        dataProducts[productIndex].so_luong = 0;
      }
    }
  }

  // 5. Lưu kho hàng đã cập nhật vào localStorage
  ghidulieuLocalStorage("dataProducts", dataProducts);

  // 6. Trả về thành công
  return { success: true, action: operation };
}

// =======================
// Thêm sự kiện các nút + xử lý đổi trạng thái
// =======================
function addRowEvents() {
  const btnDelete = document.querySelectorAll(".dh-del");
  const btnDetail = document.querySelectorAll(".dh-edit");
  const btnUpdate = document.querySelectorAll(".dh-update");
  const selects = document.querySelectorAll(".dh-status-select");

  // ====== XỬ LÝ ĐỔI TRẠNG THÁI (CÓ TRỪ/CỘNG KHO) ======
  selects.forEach((select) => {
    select.addEventListener("change", () => {
      const index = select.dataset.index;
      const newStatus = select.value;
      const oldStatus = dsdonhang[index].status; // Lấy trạng thái CŨ
      const order = dsdonhang[index];

      // Nếu trạng thái không đổi thì không làm gì
      if (newStatus === oldStatus) return;

      let result;

      // 1. TRƯỜNG HỢP: CHUYỂN TỪ TRẠNG THÁI KHÁC -> "ĐÃ GIAO" (TRỪ KHO)
      if (newStatus === "delivered" && oldStatus !== "delivered") {
        if (!confirm(`Bạn có chắc muốn cập nhật trạng thái "Đã giao"?\n(Hành động này sẽ TRỪ sản phẩm khỏi tồn kho.)`)) {
          select.value = oldStatus; 
          return;
        }
        
        // Gọi hàm trừ kho (isDelivery = true)
        result = capNhatTonKhoKhiGiaoHang(order, true); 

        if (result.success) {
          dsdonhang[index].status = newStatus;
          ghidulieuLocalStorage("orders", dsdonhang);
          showalert("✅ Đã giao hàng! Tồn kho đã được trừ.","success");
        } else {
          // Trừ kho thất bại
          showalert(`❌ LỖI TRỪ KHO!\nSản phẩm "${result.productName}" bị lỗi: ${result.reason}\n\nTrạng thái CHƯA được cập nhật.`,"error");
          select.value = oldStatus; 
        }
      } 
      
      // 2. TRƯỜNG HỢP: CHUYỂN TỪ "ĐÃ GIAO" -> TRẠNG THÁI KHÁC (CỘNG LẠI HÀNG VÀO KHO)
      else if (oldStatus === "delivered" && newStatus !== "delivered") {
        if (!confirm(`Bạn đang hủy trạng thái "Đã giao" cho đơn này.\n(Hành động này sẽ CỘNG lại sản phẩm vào tồn kho.)\nBạn có chắc chắn?`)) {
          select.value = oldStatus; 
          return;
        }
        
        // Gọi hàm cộng lại kho (isDelivery = false)
        result = capNhatTonKhoKhiGiaoHang(order, false); 
        
        // Cập nhật trạng thái và lưu, vì việc cộng kho không có rủi ro thiếu hàng
        dsdonhang[index].status = newStatus;
        ghidulieuLocalStorage("orders", dsdonhang);
        showalert(`✅ Cập nhật trạng thái thành công. Tồn kho đã được cộng lại.`,"success");
      }

      // 3. TRƯỜNG HỢP: THAY ĐỔI BÌNH THƯỜNG (Pending <-> Shipping)
      else if (newStatus !== "delivered" && oldStatus !== "delivered") {
        dsdonhang[index].status = newStatus;
        ghidulieuLocalStorage("orders", dsdonhang);
        
        let text = newStatus === "pending" ? "Chờ xử lý" : "Đang giao";
        showalert(`✅ Cập nhật trạng thái thành "${text}" thành công.`,"success");
      }
      
      // Trường hợp 4: Đổi từ Đã giao -> Đã giao (không làm gì)
      // Trường hợp 5: Đổi từ Khác -> Khác (đã xử lý ở trường hợp 3)
    });
  });

  // ====== XÓA ======
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

  // ====== CHI TIẾT ======
  btnDetail.forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      const dh = dsdonhang[index];

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

      let statusText =
        dh.status === "pending"
          ? "Chờ xử lý"
          : dh.status === "shipping"
          ? "Đang giao"
          : "Đã giao";

      showalert(
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

  // ====== SỬA (ngoại trừ trạng thái) ======
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

      const updatedOrder = { ...dh };

      if (newCustomer.trim() !== "") updatedOrder.customer = newCustomer.trim();
      if (newDateInput.trim() !== "")
        updatedOrder.date = new Date(newDateInput).toISOString();
      if (newAddress.trim() !== "")
        updatedOrder.deliveryAddress = newAddress.trim();

      dsdonhang[index] = updatedOrder;
      ghidulieuLocalStorage("orders", dsdonhang);

      showalert("✅ Cập nhật đơn hàng thành công!","success");
      updateTable(dsdonhang);
    });
  });
}



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



