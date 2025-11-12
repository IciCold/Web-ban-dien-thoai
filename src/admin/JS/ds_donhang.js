import { docdulieuLocalStorage, ghidulieuLocalStorage } from "./readandwrite.js";

let dsdonhang = [];

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

  data.forEach((donhang) => {
    const row = document.createElement("tr");

    

    row.innerHTML = `
      <td>${new Date(donhang.date).toLocaleDateString("vi-VN")}</td>
      <td>${donhang.customer}</td>
      <td>${donhang.total.toLocaleString("vi-VN")}₫</td>
      <td>${donhang.deliveryAddress}</td>
      <td class = "statuscell">${donhang.status}</td>
      <td>
        <div class="dh-actions">
          <button class="dh-details" data-id="${donhang.id}">Chi tiết</button>
        </div>
      </td>
    `;
    const change = row.querySelector('.statuscell'); // row works but document doesnt, maybe scope error?
    if(donhang.status==="đã giao"){
      change.style.color = "green";
    }
    else if(donhang.status === "đã hủy"){
      change.style.color = "red";
    }
    else if(donhang.status==="mới đặt"){
      change.style.color = "#c9a401";
    }
    else{
      change.style.color = "orange";
    }

  
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
  const btnDetail = document.querySelectorAll(".dh-details");
  

  /*// ====== XỬ LÝ ĐỔI TRẠNG THÁI (CÓ TRỪ/CỘNG KHO) ======
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
  });*/

  

  // ====== CHI TIẾT ======
  btnDetail.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const dh = dsdonhang.find(d => d.id === id);
      if(!dh) return;

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

      console.log(productList);

      const popup = document.createElement('div');
      
      popup.classList.add('dh-details-popup');
      popup.innerHTML = `
        <div class="popup-header">
          <p>🧾 Chi tiết đơn hàng</p>
          <button class="close-popup">X</button>
        </div>
        <div class="popup-body">
        Mã đơn: ${dh.id || "(Không có)"}<br>
        Khách hàng: ${dh.customer}<br>
        Email: ${dh.customerEmail || "(Không có)"}<br>
        Ngày đặt: ${new Date(dh.date).toLocaleString("vi-VN")}<br>
        Địa chỉ giao hàng: ${dh.deliveryAddress}<br>
        Phương thức thanh toán: ${dh.paymentMethod || "(Không có)"}<br>
        <br>📦 Sản phẩm:<br>${productList.replace(/\n/g, '<br>')}<br>
        ───────────────────────────────<br>
        Tổng tiền: ${Number(dh.total).toLocaleString("vi-VN")}₫<br>
        <br>
      
            
          <div>
            Trạng thái đơn hàng: 
            <span id="current-status">${dh.status || "Mới đặt"}</span>
            <button id="edit-status" type="button">Chỉnh sửa</button>
          </div>

          
          <form id="order-status-form" style="display:none;">
            <select id="status" name="status">
              <option value="mới đặt">Mới đặt</option>
              <option value="đã xử lý">Đã xử lý</option>
              <option value="đã giao">Đã giao</option>
              <option value="đã hủy">Đã hủy</option>
            </select>
            <button type="submit">Cập nhật trạng thái</button>
            <button type="button" id="cancel-status">Hủy</button>
          </form>  
           
        </div>  


      `;

      document.body.appendChild(popup);

      popup.querySelector('.close-popup').addEventListener('click', () => {
        popup.remove();
      });

      let isDragging = false;
      let offsetX, offsetY;

      const header = popup.querySelector('.popup-header');

      header.addEventListener('mousedown', (e) => {
          isDragging = true;
          offsetX = e.clientX - popup.getBoundingClientRect().left;
          offsetY = e.clientY - popup.getBoundingClientRect().top;
          popup.style.cursor = 'grabbing';
      });


      // Khi di chuột
      document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      popup.style.left = e.clientX - offsetX + 'px';
      popup.style.top = e.clientY - offsetY + 'px';
      popup.style.transform = 'none'; // bỏ transform khi di chuyển
      });

      // Khi thả chuột
      document.addEventListener('mouseup', () => {
      if (isDragging) {
          isDragging = false;
          popup.style.cursor = 'grab';
      }
      });  

      

      const currentStatusSpan = popup.querySelector('#current-status');
      const editBtn = popup.querySelector('#edit-status');
      const statusForm = popup.querySelector('#order-status-form');
      const statusSelect = popup.querySelector('#status');
      const cancelBtn = popup.querySelector('#cancel-status');

      // Ẩn form, hiện lại nút "Chỉnh sửa"
      statusForm.style.display = 'none';
      if(dh.status==='đã giao'||dh.status==='đã hủy'){
        editBtn.style.display = "none";
      }
      else{
        editBtn.style.display='inline-block';
      }

      

      // Khi nhấn "Chỉnh sửa"
      editBtn.addEventListener('click', () => {
        statusForm.style.display = 'block';       // hiển thị form
        editBtn.style.display = 'none';           // ẩn nút "Chỉnh sửa"
        
        // chọn giá trị hiện tại trong select
        statusSelect.value = dh.status;
      });

      // Khi nhấn "Hủy"
      cancelBtn.addEventListener('click', () => {
        statusForm.style.display = 'none';        // ẩn form
        editBtn.style.display = 'inline-block';   // hiện lại nút "Chỉnh sửa"
      });

      statusForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newStatus = statusSelect.value;
      if(newStatus==="đã giao"){
        const check = "Bạn có chắc chắn là đã giao hàng chưa?";
        if(!confirm(check)) return;
        capNhatTonKhoKhiGiaoHang(dh,true);
        statusForm.style.display = 'none';
        editBtn.style.display = "none";
      }
      else if(newStatus==="đã hủy"){
        const check = "Bạn có chắc chắn là hủy đơn hàng không?";
        if(!confirm(check)) return;
        capNhatTonKhoKhiGiaoHang(dh,false);
        statusForm.style.display = 'none';
        editBtn.style.display = "none";
      }
      // Cập nhật object đơn hàng
      updateTable(dsdonhang);
      dh.status = newStatus;

      // Cập nhật localStorage nếu bạn lưu ở đó
      ghidulieuLocalStorage('orders',dsdonhang);

      // Cập nhật giao diện
      currentStatusSpan.textContent = newStatus;

      
      


    });
      //tiếp tục làm tìm kiếm


      
      

      

      /*showalert(
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
      );*/
    });
  });

  /*// ====== SỬA (ngoại trừ trạng thái) ======
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
  });*/
}
const select = document.querySelector(".dh-search-options select");
const search = document.querySelector(".dh-search");
const datesearch = document.querySelector(".dh-search #date-search");
const statussearch = document.querySelector(".dh-search #status-search");



datesearch.style.display = 'none';
statussearch.style.display = 'none';
select.addEventListener("click", e => {
  if(select.value === 'Date'){
    datesearch.style.display = 'flex';
    statussearch.style.display = 'none';
  }
  else if(select.value ==='Status'){
    datesearch.style.display = 'none';
    statussearch.style.display = 'block';
  }
  else{
    datesearch.style.display = 'flex';
    statussearch.style.display = 'block';
  }
});

search.addEventListener("submit", e => {
  e.preventDefault();
  const dateInputs = search.querySelectorAll('input[type="date"]');
  const statusSelect = search.querySelector('select');

  const dateFrom = dateInputs[0].value ? new Date(dateInputs[0].value) : null;
  const dateTo = dateInputs[1].value ? new Date(dateInputs[1].value) : null;
  const status = statusSelect.value;

  const filtered = dsdonhang.filter(dh => {
    const date = new Date(dh.date);
    const inDateRange = (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
    const statusMatch = !status || dh.status === status;

    if(select.value === 'Date') return inDateRange;
    if(select.value === 'Status') return statusMatch;
    if(select.value === 'Both') return inDateRange && statusMatch;

    return true;
  });
  updateTable(filtered);
});








// RESET BỘ LỌC
const btnReset = document.getElementById("resetFilter");
btnReset.addEventListener("click", () => {
  search.reset(); // Xóa hết dữ liệu trong form
  updateTable(dsdonhang); // Hiển thị lại toàn bộ đơn hàng
});



