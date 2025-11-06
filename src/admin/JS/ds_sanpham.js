// ==============================
//  IMPORT CÁC HÀM DÙNG CHUNG
// ==============================
import {
  docdulieuLocalStorage,
  ghidulieuLocalStorage,
  docJSONvaLuuLocalStorage
} from "./readandwrite.js";

// ==============================
//  KHAI BÁO BIẾN & PHẦN TỬ HTML
// ==============================
const themsanpham = document.getElementById("themsanphambtn");
const tenspinp = document.getElementById("tensp");
const thuonghieuinp = document.getElementById("brand");
const giainp = document.getElementById("price");
const kichthuocinp = document.getElementById("size");
const loaiinp = document.getElementById("type");
const image = document.getElementById("revenue1");
const preview = document.getElementById("preview");
const divContainer = document.querySelector(".sp-table-container");
const tim = document.getElementById("timbtn");
const timten = document.getElementById("timten");
const timbrand = document.getElementById("timbrand");

let id = 0;
let currentEditingId = null;
let datalist = [];

// ==============================
//  KHI TẢI TRANG
// ==============================
window.addEventListener("DOMContentLoaded", async () => {
  datalist = docdulieuLocalStorage("dataProducts");
  if (!datalist || datalist.length === 0){
    datalist = await docJSONvaLuuLocalStorage("dataProducts", "../../asset/data/dienthoai.json");
  }

  if (datalist.length) {
    const nums = datalist.map(sp => parseInt(String(sp.id).slice(1), 10));
    const validNums = nums.filter(n => !isNaN(n));
    if (validNums.length > 0) id = Math.max(...validNums);
  }

  updateBang();
});

// ==============================
//  XỬ LÝ NÚT THÊM / SỬA
// ==============================
themsanpham.addEventListener("click", function (e) {
  e.preventDefault();
  const ten = tenspinp.value.trim();
  const brand = thuonghieuinp.value.trim();
  const gia = parseInt(giainp.value) || 0;
  const kich_thuoc = kichthuocinp.value.trim();
  const loai = loaiinp.value.trim();
  const anhFile = image.files[0];

  if (!ten || !brand || gia <= 0) {
    alert("Vui lòng nhập đầy đủ thông tin hợp lệ!");
    return;
  }

  if (anhFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64 = e.target.result;
      preview.src = base64;
      saveProduct({ten, brand, gia, kich_thuoc, loai, base64});
    };
    reader.readAsDataURL(anhFile);
  } else {
    saveProduct({ten, brand, gia, kich_thuoc, loai, base64: currentEditingId ? null : ""});
  }
});

// ==============================
//  HÀM SAVE PRODUCT
// ==============================
function saveProduct({ten, brand, gia, mau_sac = "", camera = "", cpu = "", bo_nho = "", ram = "", dung_luong_pin = "", kich_thuoc = "", loai = "", base64 = ""}) {
  mau_sac = document.getElementById("color").value.trim() || mau_sac;
  camera = document.getElementById("camera").value.trim() || camera;
  cpu = document.getElementById("cpu").value.trim() || cpu;
  bo_nho = document.getElementById("memory").value.trim() || bo_nho;
  ram = document.getElementById("ram").value.trim() || ram;
  dung_luong_pin = document.getElementById("battery").value.trim() || dung_luong_pin;

  if (currentEditingId) {
    const productToUpdate = datalist.find(item => item.id === currentEditingId);
    const duplicate = datalist.find(item => item.ten.toLowerCase() === ten.toLowerCase() && item.id !== currentEditingId);

    if (duplicate) {
      alert("Tên sản phẩm này đã tồn tại ở một sản phẩm khác!");
      return;
    }

    if (productToUpdate) {
      Object.assign(productToUpdate, {ten, brand, gia, mau_sac, kich_thuoc, bo_nho, ram, cpu, camera, dung_luong_pin, loai});
      if (base64) productToUpdate.src = base64;
    }
    currentEditingId = null;
  } else {
    const existed = datalist.find(item => item.ten.toLowerCase() === ten.toLowerCase());
    if (existed) {
      alert("Tên sản phẩm đã tồn tại. Không thể thêm mới.");
      return;
    }

    id++;
    const newId = "S" + String(id).padStart(3, "0");
    datalist.push({id: newId, src: base64 || "", ten, brand, gia, so_luong: 0, mau_sac, kich_thuoc, bo_nho, ram, cpu, camera, dung_luong_pin, loai});
  }

  ghidulieuLocalStorage("dataProducts", datalist);

  // Reset form
  ["tensp","brand","price","color","camera","cpu","memory","ram","battery","size","type"].forEach(id => document.getElementById(id).value = "");
  image.value = "";
  preview.src = "";
  themsanpham.textContent = "Thêm";

  updateBang();
}

// ==============================
//  HIỂN THỊ BẢNG SẢN PHẨM
// ==============================
function updateBang() {
  divContainer.innerHTML = "";
  if (datalist.length === 0) {
    divContainer.innerHTML = "<p>Chưa có sản phẩm nào!</p>";
    return;
  }

  const table = document.createElement("table");
  table.classList.add("sp-table");

  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
    <th>ID</th>
    <th>Ảnh</th>
    <th>Tên sản phẩm</th>
    <th>Thương hiệu</th>
    <th>Giá</th>
    <th>Số lượng</th>
    <th>Hành động</th>
  `;
  table.appendChild(headerRow);

  datalist.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td><img src="${item.src || ""}" width="50" height="50" alt="${item.ten}"></td>
      <td>${item.ten}</td>
      <td>${item.brand}</td>
      <td>${item.gia.toLocaleString("vi-VN")}₫</td>
      <td>${item.so_luong || 0}</td>
      <td>
        <button class="sp-edit">Sửa</button>
        <button class="sp-del">X</button>
        <button class="sp-view">Chi tiết</button>
      </td>
    `;
    table.appendChild(row);

    // --- Nút sửa ---
    row.querySelector(".sp-edit").addEventListener("click", () => {
      tenspinp.value = item.ten;
      thuonghieuinp.value = item.brand;
      giainp.value = item.gia;
      document.getElementById("color").value = item.mau_sac || "";
      document.getElementById("size").value = item.kich_thuoc || "";
      document.getElementById("memory").value = item.bo_nho || "";
      document.getElementById("ram").value = item.ram || "";
      document.getElementById("cpu").value = item.cpu || "";
      document.getElementById("camera").value = item.camera || "";
      document.getElementById("battery").value = item.dung_luong_pin || "";
      document.getElementById("type").value = item.loai || "";
      preview.src = item.src || "";

      currentEditingId = item.id;
      themsanpham.textContent = "Cập nhật sản phẩm";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // --- Nút xóa ---
    row.querySelector(".sp-del").addEventListener("click", () => {
      if (confirm(`Bạn có chắc muốn xóa "${item.ten}"?`)) {
        datalist = datalist.filter(sp => sp.id !== item.id);
        ghidulieuLocalStorage("dataProducts", datalist);
        updateBang();
      }
    });

    // --- Nút xem chi tiết ---
    row.querySelector(".sp-view").addEventListener("click", () => {
      alert(`
Tên: ${item.ten}
Thương hiệu: ${item.brand}
Giá: ${item.gia.toLocaleString("vi-VN")}₫
Số lượng: ${item.so_luong}
Màu: ${item.mau_sac || "-"}
Kích thước: ${item.kich_thuoc || "-"}
Bộ nhớ: ${item.bo_nho || "-"}
RAM: ${item.ram || "-"}
CPU: ${item.cpu || "-"}
Camera: ${item.camera || "-"}
Pin: ${item.dung_luong_pin || "-"}
Loại: ${item.loai || "-"}
      `);
    });
  });

  divContainer.appendChild(table);
}

// ==============================
//  HÀM TÌM KIẾM
// ==============================
tim.addEventListener("click", e => {
  e.preventDefault();
  timkiem();
});

function timkiem() {
  const ten = timten.value.trim().toLowerCase();
  const brand = timbrand.value.trim().toLowerCase();

  if (!ten && !brand) {
    updateBang();
    return;
  }

  const filtered = datalist.filter(sp => {
    const matchTen = ten ? sp.ten.toLowerCase().includes(ten) : true;
    const matchBrand = brand ? sp.brand.toLowerCase().includes(brand) : true;
    return matchTen && matchBrand;
  });

  displayFilteredTable(filtered);
}

// ==============================
//  HIỂN THỊ KẾT QUẢ LỌC
// ==============================
function displayFilteredTable(filteredList) {
  divContainer.innerHTML = "";
  if (filteredList.length === 0) {
    divContainer.innerHTML = "<p>Không tìm thấy sản phẩm phù hợp!</p>";
    return;
  }

  const table = document.createElement("table");
  table.classList.add("sp-table");

  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
    <th>ID</th>
    <th>Ảnh</th>
    <th>Tên sản phẩm</th>
    <th>Thương hiệu</th>
    <th>Giá</th>
    <th>Số lượng</th>
    <th>Hành động</th>
  `;
  table.appendChild(headerRow);

  filteredList.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td><img src="${item.src || ""}" width="50" height="50" alt="${item.ten}"></td>
      <td>${item.ten}</td>
      <td>${item.brand}</td>
      <td>${item.gia.toLocaleString("vi-VN")}₫</td>
      <td>${item.so_luong || 0}</td>
      <td>
        <button class="sp-edit">Sửa</button>
        <button class="sp-del">X</button>
        <button class="sp-view">Chi tiết</button>
      </td>
    `;
    table.appendChild(row);

    row.querySelector(".sp-edit").addEventListener("click", () => {
      tenspinp.value = item.ten;
      thuonghieuinp.value = item.brand;
      giainp.value = item.gia;
      document.getElementById("color").value = item.mau_sac || "";
      document.getElementById("size").value = item.kich_thuoc || "";
      document.getElementById("memory").value = item.bo_nho || "";
      document.getElementById("ram").value = item.ram || "";
      document.getElementById("cpu").value = item.cpu || "";
      document.getElementById("camera").value = item.camera || "";
      document.getElementById("battery").value = item.dung_luong_pin || "";
      document.getElementById("type").value = item.loai || "";
      preview.src = item.src || "";

      currentEditingId = item.id;
      themsanpham.textContent = "Cập nhật sản phẩm";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    row.querySelector(".sp-del").addEventListener("click", () => {
      if (confirm(`Bạn có chắc muốn xóa "${item.ten}"?`)) {
        datalist = datalist.filter(sp => sp.id !== item.id);
        ghidulieuLocalStorage("dataProducts", datalist);
        timkiem();
      }
    });

    row.querySelector(".sp-view").addEventListener("click", () => {
      alert(`
Tên: ${item.ten}
Thương hiệu: ${item.brand}
Giá: ${item.gia.toLocaleString("vi-VN")}₫
Số lượng: ${item.so_luong}
Màu: ${item.mau_sac || "-"}
Kích thước: ${item.kich_thuoc || "-"}
Bộ nhớ: ${item.bo_nho || "-"}
RAM: ${item.ram || "-"}
CPU: ${item.cpu || "-"}
Camera: ${item.camera || "-"}
Pin: ${item.dung_luong_pin || "-"}
Loại: ${item.loai || "-"}
      `);
    });
  });

  divContainer.appendChild(table);
}
