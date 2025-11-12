// ==============================
//  IMPORT CÁC HÀM DÙNG CHUNG
// ==============================
import { showalert } from "../../JS/alert.js";
import {
  docdulieuLocalStorage,
  ghidulieuLocalStorage
} from "./readandwrite.js";

// ==============================
//  KHAI BÁO BIẾN & PHẦN TỬ HTML
// ==============================
let dataProducts = [];
let dataPhieuNhap = [];
let currentPhieu = null;
let phieuIdCounter = 0;

// Các phần tử HTML
const btnTaoPhieuMoi = document.getElementById("btnTaoPhieuMoi");
const nhSearch = document.getElementById("nh-search");
const nhLeftContainer = document.querySelector("#nh-left .nh-table-container");
const nhRightContainer = document.querySelector("#nh-right .nh-table-container");

// Popup elements
const popupOverlay = document.querySelector(".nh-popup-overlay");
const popup = document.querySelector(".nh-popup");
const popupClose = document.querySelector(".nh-popup-close");

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
  if (!btnTaoPhieuMoi) return;

  dataProducts = docdulieuLocalStorage("dataProducts");
  dataPhieuNhap = docdulieuLocalStorage("dataPhieuNhap");

  if (dataPhieuNhap.length > 0) {
    const nums = dataPhieuNhap.map(pn => parseInt(String(pn.id).slice(2), 10));
    phieuIdCounter = Math.max(...nums);
  }

  populateProductSelect();
  renderPhieuDangTao();
  renderPhieuHoanThanh();

  // Gán sự kiện
  btnTaoPhieuMoi.addEventListener("click", handleTaoPhieuMoi);
  btnThemSPVaoPhieu.addEventListener("click", handleThemSPVaoPhieu);
  btnHoanThanhPhieu.addEventListener("click", handleHoanThanhPhieu);
  btnXoaPhieu.addEventListener("click", handleXoaPhieu);
  nhSearch.addEventListener("input", renderPhieuHoanThanh);
  
  // Đóng popup
  popupClose.addEventListener("click", closePopup);
  popupOverlay.addEventListener("click", closePopup);
});

// ==============================
//  HÀM HIỂN THỊ PHIẾU ĐANG TẠO
// ==============================
function renderPhieuDangTao() {
  nhLeftContainer.innerHTML = "";
  
  const phieuDangTao = dataPhieuNhap.filter(pn => pn.trangThai === 'dangTao');

  if (phieuDangTao.length === 0) {
    nhLeftContainer.innerHTML = '<div class="nh-empty-message">Chưa có phiếu đang tạo</div>';
    return;
  }

  const table = document.createElement("table");
  table.className = "nh-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID Phiếu</th>
        <th>Ngày Nhập</th>
        <th>Tổng Tiền</th>
        <th>Thao tác</th>
      </tr>
    </thead>
    <tbody>
      ${phieuDangTao.slice().reverse().map(pn => `
        <tr data-id="${pn.id}">
          <td>${pn.id}</td>
          <td>${pn.ngayNhap}</td>
          <td>${tinhTongTien(pn).toLocaleString("vi-VN")}₫</td>
          <td><button class="nh-edit" data-id="${pn.id}">Sửa</button></td>
        </tr>
      `).join("")}
    </tbody>
  `;
  
  table.querySelectorAll(".nh-edit").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      loadPhieuDeSua(id);
    });
  });

  nhLeftContainer.appendChild(table);
}

// ==============================
//  HÀM HIỂN THỊ PHIẾU ĐÃ HOÀN THÀNH
// ==============================
function renderPhieuHoanThanh() {
  nhRightContainer.innerHTML = "";
  
  const keyword = nhSearch.value.trim().toLowerCase();
  const phieuHoanThanh = dataPhieuNhap.filter(pn => 
    pn.trangThai === 'hoanThanh' && 
    pn.id.toLowerCase().includes(keyword)
  );

  if (phieuHoanThanh.length === 0) {
    nhRightContainer.innerHTML = '<div class="nh-empty-message">Chưa có phiếu hoàn thành</div>';
    return;
  }

  const table = document.createElement("table");
  table.className = "nh-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID Phiếu</th>
        <th>Ngày Nhập</th>
        <th>Tổng Tiền</th>
        <th>Xem</th>
      </tr>
    </thead>
    <tbody>
      ${phieuHoanThanh.slice().reverse().map(pn => `
        <tr data-id="${pn.id}">
          <td>${pn.id}</td>
          <td>${pn.ngayNhap}</td>
          <td>${tinhTongTien(pn).toLocaleString("vi-VN")}₫</td>
          <td><button class="nh-edit" data-id="${pn.id}">Xem</button></td>
        </tr>
      `).join("")}
    </tbody>
  `;
  
  table.querySelectorAll(".nh-edit").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      loadPhieuDeSua(id);
    });
  });

  nhRightContainer.appendChild(table);
}

// ==============================
//  HÀM HIỂN THỊ CHI TIẾT PHIẾU TRONG POPUP
// ==============================
function renderChiTietPhieu() {
  if (!currentPhieu) {
    closePopup();
    return;
  }

  nhId.value = currentPhieu.id;
  nhNgayNhap.value = currentPhieu.ngayNhap;
  nhTrangThai.value = currentPhieu.trangThai === 'hoanThanh' ? 'Đã hoàn thành' : 'Đang tạo';
  nhTongTien.textContent = tinhTongTien(currentPhieu).toLocaleString("vi-VN");

  chiTietTableContainer.innerHTML = "";
  
  if (currentPhieu.chiTiet.length === 0) {
    chiTietTableContainer.innerHTML = "<p>Chưa có sản phẩm nào trong phiếu.</p>";
  } else {
    const table = document.createElement("table");
    table.className = "nh-chitiet-table";
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
    
    table.querySelectorAll(".nh-del-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idSP = e.target.dataset.idsp;
        handleXoaSPKhoiPhieu(idSP);
      });
    });
    chiTietTableContainer.appendChild(table);
  }

  // Cập nhật trạng thái form
  if (currentPhieu.trangThai === 'hoanThanh') {
    fieldsetAddSP.disabled = true;
    btnHoanThanhPhieu.style.display = 'none';
    btnXoaPhieu.style.display = 'none';
  } else {
    fieldsetAddSP.disabled = false;
    btnHoanThanhPhieu.style.display = 'inline-block';
    btnXoaPhieu.style.display = 'inline-block';
  }

  // Hiển thị popup
  popup.classList.add('active');
  popupOverlay.classList.add('active');
}

// ==============================
//  HÀM ĐÓNG POPUP
// ==============================
function closePopup() {
  popup.classList.remove('active');
  popupOverlay.classList.remove('active');
  currentPhieu = null;
  
  // Reset form
  formChiTiet.reset();
  spSelect.value = "";
  spSoLuong.value = 1;
  spGiaNhap.value = "";
}

// ==============================
//  CÁC HÀM TIỆN ÍCH
// ==============================
function populateProductSelect() {
  spSelect.innerHTML = '<option value="">-- Chọn sản phẩm --</option>';
  dataProducts.forEach(sp => {
    spSelect.innerHTML += `<option value="${sp.id}">${sp.ten} (ID: ${sp.id})</option>`;
  });
}

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
    trangThai: "dangTao",
    chiTiet: []
  };
  
  dataPhieuNhap.push(newPhieu);
  ghidulieuLocalStorage("dataPhieuNhap", dataPhieuNhap);
  
  currentPhieu = newPhieu;
  renderPhieuDangTao();
  renderChiTietPhieu();
  
  showalert("Đã tạo phiếu nhập mới: " + newID, "success");
}

// (2) Load phiếu đã có lên popup
function loadPhieuDeSua(id) {
  const phieu = dataPhieuNhap.find(pn => pn.id === id);
  if (phieu) {
    currentPhieu = phieu;
    renderChiTietPhieu();
  }
}

// (3) Thêm SP vào phiếu
function handleThemSPVaoPhieu() {
  const idSP = spSelect.value;
  const soLuong = parseInt(spSoLuong.value);
  const giaNhap = parseInt(spGiaNhap.value);

  if (!idSP || !soLuong || isNaN(giaNhap) || soLuong <= 0 || giaNhap < 0) {
    showalert("Vui lòng chọn sản phẩm, nhập số lượng và giá nhập hợp lệ.", "warning");
    return;
  }
  
  const spData = dataProducts.find(sp => sp.id === idSP);
  const existingItem = currentPhieu.chiTiet.find(item => item.idSP === idSP);
  
  if (existingItem) {
    existingItem.soLuong += soLuong;
    existingItem.giaNhap = giaNhap;
  } else {
    currentPhieu.chiTiet.push({
      idSP: spData.id,
      tenSP: spData.ten,
      soLuong: soLuong,
      giaNhap: giaNhap
    });
  }
  
  ghidulieuLocalStorage("dataPhieuNhap", dataPhieuNhap);
  renderChiTietPhieu();
  renderPhieuDangTao();
  
  // Reset form thêm SP
  spSelect.value = "";
  spSoLuong.value = 1;
  spGiaNhap.value = "";
  
  showalert("Đã thêm sản phẩm vào phiếu", "success");
}

// (4) Xóa SP khỏi phiếu
function handleXoaSPKhoiPhieu(idSP) {
  if (!currentPhieu) return;
  
  currentPhieu.chiTiet = currentPhieu.chiTiet.filter(item => item.idSP !== idSP);
  
  ghidulieuLocalStorage("dataPhieuNhap", dataPhieuNhap);
  renderChiTietPhieu();
  renderPhieuDangTao();
  
  showalert("Đã xóa sản phẩm khỏi phiếu", "success");
}

// (5) Hoàn Thành Phiếu
function handleHoanThanhPhieu() {
  if (!currentPhieu || currentPhieu.chiTiet.length === 0) {
    showalert("Phiếu đang trống, không thể hoàn thành.", "warning");
    return;
  }
  
  if (confirm(`Bạn có chắc muốn hoàn thành phiếu ${currentPhieu.id}? Hành động này sẽ cập nhật số lượng tồn kho và không thể sửa phiếu này nữa.`)) {
    // Cập nhật số lượng vào dataProducts
    currentPhieu.chiTiet.forEach(item => {
      const spIndex = dataProducts.findIndex(sp => sp.id === item.idSP);
      if (spIndex !== -1) {
        dataProducts[spIndex].so_luong = (dataProducts[spIndex].so_luong || 0) + item.soLuong;
        dataProducts[spIndex].gia = item.giaNhap;

        if (!dataProducts[spIndex].giaBan) {
          dataProducts[spIndex].giaBan = item.giaNhap;
        }
      }
    });
    
    currentPhieu.trangThai = "hoanThanh";
    
    ghidulieuLocalStorage("dataProducts", dataProducts);
    ghidulieuLocalStorage("dataPhieuNhap", dataPhieuNhap);
    
    closePopup();
    renderPhieuDangTao();
    renderPhieuHoanThanh();
    populateProductSelect();
    
    showalert("Đã hoàn thành phiếu và cập nhật tồn kho!", "success");
  }
}

// (6) Xóa phiếu (chỉ khi đang tạo)
function handleXoaPhieu() {
  if (!currentPhieu || currentPhieu.trangThai === 'hoanThanh') {
    showalert("Không thể xóa phiếu đã hoàn thành.", "error");
    return;
  }
  
  if (confirm(`Bạn có chắc muốn xóa vĩnh viễn phiếu ${currentPhieu.id}?`)) {
    dataPhieuNhap = dataPhieuNhap.filter(pn => pn.id !== currentPhieu.id);
    ghidulieuLocalStorage("dataPhieuNhap", dataPhieuNhap);
    
    closePopup();
    renderPhieuDangTao();
    
    showalert("Đã xóa phiếu", "success");
  }
}