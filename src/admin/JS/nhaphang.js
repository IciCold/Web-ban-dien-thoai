// ==============================
//  IMPORT CÁC HÀM DÙNG CHUNG
// ==============================
import {
  docdulieuLocalStorage, //
  ghidulieuLocalStorage //
} from "./readandwrite.js";

// ==============================
//  KHAI BÁO BIẾN & PHẦN TỬ HTML
// ==============================
let dataProducts = [];
let dataPhieuNhap = [];
let currentPhieu = null; // Phiếu đang được chọn để sửa
let phieuIdCounter = 0;

// Các phần tử HTML của trang Nhập Hàng
const btnTaoPhieuMoi = document.getElementById("btnTaoPhieuMoi");
const nhSearch = document.getElementById("nh-search");
const nhTableContainer = document.querySelector("#ds_nhapHang .nh-table-container");

const formChiTiet = document.getElementById("nh-form-chitiet");
const nhId = document.getElementById("nh-id");
const nhNgayNhap = document.getElementById("nh-ngayNhap");
const nhTrangThai = document.getElementById("nh-trangThai");

const fieldsetAddSP = document.getElementById("nh-add-sp-fieldset");
const spSelect = document.getElementById("nh-sp-select");
const spSoLuong = document.getElementById("nh-sp-soluong");
const spGiaNhap = document.getElementById("nh-sp-gianhap");
const btnThemSPVaoPhieu = document.getElementById("btnThemSPVaoPhieu");

const chiTietTableContainer = document.getElementById("nh-chitiet-table-container");
const nhTongTien = document.getElementById("nh-tongTien");
const btnHoanThanhPhieu = document.getElementById("btnHoanThanhPhieu");
const btnXoaPhieu = document.getElementById("btnXoaPhieu");

// ==============================
//  KHỞI TẠO KHI TẢI TRANG
// ==============================
window.addEventListener("DOMContentLoaded", () => {
  // Chỉ chạy code này nếu các phần tử tồn tại (tức là đang ở trang admin)
  if (!btnTaoPhieuMoi) return;

  dataProducts = docdulieuLocalStorage("dataProducts"); //
  dataPhieuNhap = docdulieuLocalStorage("dataPhieuNhap"); //

  // Lấy ID phiếu lớn nhất để đếm tiếp
  if (dataPhieuNhap.length > 0) {
    const nums = dataPhieuNhap.map(pn => parseInt(String(pn.id).slice(2), 10));
    phieuIdCounter = Math.max(...nums);
  }

  populateProductSelect();
  renderPhieuNhapTable();
  resetFormChiTiet();

  // Gán sự kiện
  btnTaoPhieuMoi.addEventListener("click", handleTaoPhieuMoi);
  btnThemSPVaoPhieu.addEventListener("click", handleThemSPVaoPhieu);
  btnHoanThanhPhieu.addEventListener("click", handleHoanThanhPhieu);
  btnXoaPhieu.addEventListener("click", handleXoaPhieu);
  nhSearch.addEventListener("input", renderPhieuNhapTable);
});

// ==============================
//  HÀM HIỂN THỊ DANH SÁCH PHIẾU NHẬP (Bên trái)
// ==============================
function renderPhieuNhapTable() {
  nhTableContainer.innerHTML = "";
  
  const keyword = nhSearch.value.trim().toLowerCase();
  const filteredList = dataPhieuNhap.filter(pn => pn.id.toLowerCase().includes(keyword));

  if (filteredList.length === 0) {
    nhTableContainer.innerHTML = "<p>Chưa có phiếu nhập nào.</p>";
    return;
  }

  const table = document.createElement("table");
  table.className = "nh-table"; // Dùng class này để CSS
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID Phiếu</th>
        <th>Ngày Nhập</th>
        <th>Trạng Thái</th>
        <th>Tổng Tiền</th>
        <th>Sửa</th>
      </tr>
    </thead>
    <tbody>
      ${filteredList.slice().reverse().map(pn => `
        <tr class="nh-row ${pn.id === currentPhieu?.id ? 'selected' : ''}" data-id="${pn.id}">
          <td>${pn.id}</td>
          <td>${pn.ngayNhap}</td>
          <td>${pn.trangThai === 'hoanThanh' ? '✅ Hoàn thành' : '📝 Đang tạo'}</td>
          <td>${tinhTongTien(pn).toLocaleString("vi-VN")}₫</td>
          <td><button class="nh-edit">Chọn</button></td>
        </tr>
      `).join("")}
    </tbody>
  `;
  
  // Thêm sự kiện cho các nút "Chọn"
  table.querySelectorAll(".nh-edit").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.closest("tr").dataset.id;
      loadPhieuDeSua(id);
    });
  });

  nhTableContainer.appendChild(table);
}

// ==============================
//  HÀM HIỂN THỊ CHI TIẾT PHIẾU (Bên phải)
// ==============================
function renderChiTietPhieu() {
  if (!currentPhieu) {
    resetFormChiTiet();
    return;
  }

  // Cập nhật thông tin phiếu
  nhId.value = currentPhieu.id;
  nhNgayNhap.value = currentPhieu.ngayNhap;
  nhTrangThai.value = currentPhieu.trangThai === 'hoanThanh' ? 'Đã hoàn thành' : 'Đang tạo';
  nhTongTien.textContent = tinhTongTien(currentPhieu).toLocaleString("vi-VN");

  // Hiển thị bảng chi tiết sản phẩm
  chiTietTableContainer.innerHTML = "";
  const table = document.createElement("table");
  table.className = "nh-chitiet-table"; // Dùng class này để CSS
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID SP</th>
        <th>Tên SP</th>
        <th>Số Lượng</th>
        <th>Giá Nhập</th>
        <th>Thành Tiền</th>
        <th>Xóa</th>
      </tr>
    </thead>
    <tbody>
      ${currentPhieu.chiTiet.map(item => `
        <tr>
          <td>${item.idSP}</td>
          <td>${item.tenSP}</td>
          <td>${item.soLuong}</td>
          <td>${item.giaNhap.toLocaleString("vi-VN")}₫</td>
          <td>${(item.soLuong * item.giaNhap).toLocaleString("vi-VN")}₫</td>
          <td>
            ${currentPhieu.trangThai !== 'hoanThanh' ? 
              `<button class="nh-del-item" data-idsp="${item.idSP}">X</button>` : 
              '--'}
          </td>
        </tr>
      `).join("")}
    </tbody>
  `;
  
  // Sự kiện xóa item khỏi phiếu
  table.querySelectorAll(".nh-del-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idSP = e.target.dataset.idsp;
      handleXoaSPKhoiPhieu(idSP);
    });
  });
  chiTietTableContainer.appendChild(table);

  // Cập nhật trạng thái form (Yêu cầu: chỉ sửa/hoàn thành khi chưa hoàn thành)
  if (currentPhieu.trangThai === 'hoanThanh') {
    fieldsetAddSP.disabled = true;
    btnHoanThanhPhieu.style.display = 'none';
    btnXoaPhieu.style.display = 'none';
  } else {
    fieldsetAddSP.disabled = false;
    btnHoanThanhPhieu.style.display = 'inline-block';
    btnXoaPhieu.style.display = 'inline-block';
  }
}

// ==============================
//  CÁC HÀM TIỆN ÍCH (RENDER)
// ==============================

// Đổ danh sách sản phẩm vào <select>
function populateProductSelect() {
  spSelect.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
  dataProducts.forEach(sp => {
    spSelect.innerHTML += `<option value="${sp.id}">${sp.ten} (ID: ${sp.id})</option>`;
  });
}

// Reset form chi tiết
function resetFormChiTiet() {
  formChiTiet.reset();
  nhId.value = "[PHIẾU MỚI]";
  nhNgayNhap.value = "";
  nhTrangThai.value = "";
  chiTietTableContainer.innerHTML = "<p>Chưa có sản phẩm nào trong phiếu.</p>";
  nhTongTien.textContent = "0";
  
  fieldsetAddSP.disabled = true;
  btnHoanThanhPhieu.style.display = 'none';
  btnXoaPhieu.style.display = 'none';
  currentPhieu = null;
  
  // Bỏ highlight
  if (document.querySelector(".nh-row.selected")) {
    document.querySelector(".nh-row.selected").classList.remove("selected");
  }
}

// Tính tổng tiền
function tinhTongTien(phieu) {
  return phieu.chiTiet.reduce((total, item) => total + (item.soLuong * item.giaNhap), 0);
}

// ==============================
//  HÀM XỬ LÝ SỰ KIỆN
// ==============================

// (1) Tạo Phiếu Mới
function handleTaoPhieuMoi() {
  phieuIdCounter++;
  const newID = "PN" + String(phieuIdCounter).padStart(3, "0");
  const newPhieu = {
    id: newID,
    ngayNhap: new Date().toLocaleDateString("vi-VN"),
    trangThai: "dangTao", // 'dangTao' hoặc 'hoanThanh'
    chiTiet: [] // Mảng chứa { idSP, tenSP, soLuong, giaNhap }
  };
  
  dataPhieuNhap.push(newPhieu);
  ghidulieuLocalStorage("dataPhieuNhap", dataPhieuNhap); //
  
  currentPhieu = newPhieu;
  renderPhieuNhapTable();
  renderChiTietPhieu();
}

// (2) Load phiếu đã có lên form
function loadPhieuDeSua(id) {
  const phieu = dataPhieuNhap.find(pn => pn.id === id);
  if (phieu) {
    currentPhieu = phieu;
    renderPhieuNhapTable(); // để highlight
    renderChiTietPhieu();
  }
}

// (3) Thêm SP vào phiếu (chưa lưu vào kho)
function handleThemSPVaoPhieu() {
  const idSP = spSelect.value;
  const soLuong = parseInt(spSoLuong.value);
  const giaNhap = parseInt(spGiaNhap.value);

  if (!idSP || !soLuong || isNaN(giaNhap) || soLuong <= 0 || giaNhap < 0) {
    alert("Vui lòng chọn sản phẩm, nhập số lượng và giá nhập hợp lệ.");
    return;
  }
  
  const spData = dataProducts.find(sp => sp.id === idSP);
  
  // Kiểm tra xem SP đã có trong phiếu chưa
  const existingItem = currentPhieu.chiTiet.find(item => item.idSP === idSP);
  
  if (existingItem) {
    // Nếu đã có, chỉ cập nhật
    existingItem.soLuong += soLuong;
    existingItem.giaNhap = giaNhap; // Cập nhật giá nhập mới
  } else {
    // Nếu chưa, thêm mới
    currentPhieu.chiTiet.push({
      idSP: spData.id,
      tenSP: spData.ten,
      soLuong: soLuong,
      giaNhap: giaNhap
    });
  }
  
  ghidulieuLocalStorage("dataPhieuNhap", dataPhieuNhap); //
  renderChiTietPhieu();
  renderPhieuNhapTable(); // Cập nhật tổng tiền
  
  // Reset form thêm SP
  spSelect.value = "";
  spSoLuong.value = 1;
  spGiaNhap.value = "";
}

// (4) Xóa SP khỏi phiếu
function handleXoaSPKhoiPhieu(idSP) {
  if (!currentPhieu) return;
  
  currentPhieu.chiTiet = currentPhieu.chiTiet.filter(item => item.idSP !== idSP);
  
  ghidulieuLocalStorage("dataPhieuNhap", dataPhieuNhap); //
  renderChiTietPhieu();
  renderPhieuNhapTable(); // Cập nhật tổng tiền
}

// (5) Hoàn Thành Phiếu (Cập nhật số lượng vào kho)
function handleHoanThanhPhieu() {
  if (!currentPhieu || currentPhieu.chiTiet.length === 0) {
    alert("Phiếu đang trống, không thể hoàn thành.");
    return;
  }
  
  if (confirm(`Bạn có chắc muốn hoàn thành phiếu ${currentPhieu.id}? Hành động này sẽ cập nhật số lượng tồn kho và không thể sửa phiếu này nữa.`)) {
    // 1. Cập nhật số lượng vào dataProducts
    currentPhieu.chiTiet.forEach(item => {
      const spIndex = dataProducts.findIndex(sp => sp.id === item.idSP);
      if (spIndex !== -1) {
        dataProducts[spIndex].so_luong = (dataProducts[spIndex].so_luong || 0) + item.soLuong;
        dataProducts[spIndex].gia = item.giaNhap; // Gán giá nhập làm GIÁ VỐN (sp.gia)

    // Nếu sản phẩm chưa có giá bán, tạm gán giá bán = giá vốn
    if (!dataProducts[spIndex].giaBan) {
       dataProducts[spIndex].giaBan = item.giaNhap;
    }
      }
    });
    
    // 2. Cập nhật trạng thái phiếu
    currentPhieu.trangThai = "hoanThanh";
    
    // 3. Lưu cả hai mảng dữ liệu
    ghidulieuLocalStorage("dataProducts", dataProducts); //
    ghidulieuLocalStorage("dataPhieuNhap", dataPhieuNhap); //
    
    // 4. Reset form
    resetFormChiTiet();
    alert("Đã hoàn thành phiếu và cập nhật tồn kho!");
    // 5. Cập nhật lại select
    populateProductSelect();
  }
}

// (6) Xóa phiếu (chỉ khi đang tạo)
function handleXoaPhieu() {
  if (!currentPhieu || currentPhieu.trangThai === 'hoanThanh') {
    alert("Không thể xóa phiếu đã hoàn thành.");
    return;
  }
  
  if (confirm(`Bạn có chắc muốn xóa vĩnh viễn phiếu ${currentPhieu.id}?`)) {
    dataPhieuNhap = dataPhieuNhap.filter(pn => pn.id !== currentPhieu.id);
    ghidulieuLocalStorage("dataPhieuNhap", dataPhieuNhap); //
    resetFormChiTiet();
    renderPhieuNhapTable();
  }
}