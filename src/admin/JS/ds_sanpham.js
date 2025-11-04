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
  // 1️⃣ Đọc dữ liệu từ localStorage (nếu có)
  datalist = docdulieuLocalStorage("datalist");

  if (datalist.length) {
    const nums = datalist.map(sp => parseInt(String(sp.id).slice(1), 10));
    const validNums = nums.filter(n => !isNaN(n));
    if (validNums.length > 0) {
      id = Math.max(...validNums);
    }
  }

  // 2️⃣ Nếu chưa có thì đọc JSON và lưu vào localStorage
  const jsonData = await docJSONvaLuuLocalStorage("jsonProducts", "../../asset/data/dienthoai.json");

  // 3️⃣ Chuẩn hóa dữ liệu từ JSON
  const fromFile = jsonData.map(sp => ({
    id: sp.id.toString().startsWith("S") ? sp.id : "S" + String(sp.id).padStart(3, "0"),
    tensp: sp.ten || sp.tensp || "",
    thuonghieu: sp.brand || sp.thuonghieu || "",
    gia: sp.gia || 0,
    anh: sp.src || sp.anh || "",
    color: sp.color || sp.mau_sac || "",
    camera: sp.camera || "",
    cpu: sp.cpu || "",
    ram: sp.ram || "",
    memory: sp.memory || sp.bo_nho || "",
    battery: sp.battery || sp.dung_luong_pin || ""
  }));

  // 4️⃣ Gộp JSON + LocalStorage (tránh trùng id)
  const existingIds = new Set(datalist.map(sp => sp.id));
  datalist = [
    ...datalist,
    ...fromFile.filter(sp => !existingIds.has(sp.id))
  ];

  // 5️⃣ Ghi lại vào localStorage
  ghidulieuLocalStorage("datalist", datalist);

  // 6️⃣ Hiển thị bảng
  updateBang();
});


// ==============================
//  XỬ LÝ NÚT THÊM / SỬA
// ==============================
themsanpham.addEventListener("click", function (e) {
  e.preventDefault();
  const tensp = tenspinp.value.trim();
  const thuonghieu = thuonghieuinp.value.trim();
  const gia = parseInt(giainp.value) || 0;
  const anhFile = image.files[0];

  if (!tensp || !thuonghieu || gia <= 0) {
    alert("Vui lòng nhập đầy đủ thông tin hợp lệ!");
    return;
  }

  if (anhFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64 = e.target.result;
      preview.src = base64;
      saveProduct(tensp, thuonghieu, gia, base64);
    };
    reader.readAsDataURL(anhFile);
  } else {
    saveProduct(tensp, thuonghieu, gia, currentEditingId ? null : "");
  }
});


// ==============================
//  HÀM SAVE PRODUCT
// ==============================
function saveProduct(tensp, thuonghieu, gia, base64) {
  const color = document.getElementById("color").value.trim();
  const camera = document.getElementById("camera").value.trim();
  const cpu = document.getElementById("cpu").value.trim();
  const memory = document.getElementById("memory").value.trim();
  const ram = document.getElementById("ram").value.trim();
  const battery = document.getElementById("battery").value.trim();

  if (currentEditingId) {
    const productToUpdate = datalist.find(item => item.id === currentEditingId);
    const duplicate = datalist.find(item =>
      item.tensp.toLowerCase() === tensp.toLowerCase() &&
      item.id !== currentEditingId
    );

    if (duplicate) {
      alert("Tên sản phẩm này đã tồn tại ở một sản phẩm khác!");
      return;
    }

    if (productToUpdate) {
      Object.assign(productToUpdate, {
        tensp, thuonghieu, gia, color, camera, cpu, memory, ram, battery
      });
      if (base64) productToUpdate.anh = base64;
    }

    currentEditingId = null;
  } else {
    const existed = datalist.find(item => item.tensp.toLowerCase() === tensp.toLowerCase());
    if (existed) {
      alert("Tên sản phẩm đã tồn tại. Không thể thêm mới.");
      return;
    }

    id++;
    const newId = "S" + String(id).padStart(3, "0");
    datalist.push({
      id: newId,
      anh: base64 || "",
      tensp,
      thuonghieu,
      gia,
      color,
      camera,
      cpu,
      memory,
      ram,
      battery
    });
  }

  ghidulieuLocalStorage("datalist", datalist);

  // Reset form
  [
    "tensp", "brand", "price", "color", "camera",
    "cpu", "memory", "ram", "battery"
  ].forEach(id => document.getElementById(id).value = "");
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
    <th>Hành động</th>
  `;
  table.appendChild(headerRow);

  datalist.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td><img src="${item.anh || ""}" width="50" height="50" alt="${item.tensp}"></td>
      <td>${item.tensp}</td>
      <td>${item.thuonghieu}</td>
      <td>${item.gia.toLocaleString("vi-VN")}₫</td>
      <td>
        <button class="sp-edit">Sửa</button>
        <button class="sp-del">X</button>
        <button class="sp-view">Chi tiết</button>
      </td>
    `;
    table.appendChild(row);

    // --- Nút sửa ---
    row.querySelector(".sp-edit").addEventListener("click", () => {
      tenspinp.value = item.tensp;
      thuonghieuinp.value = item.thuonghieu;
      giainp.value = item.gia;
      document.getElementById("color").value = item.color || "";
      document.getElementById("camera").value = item.camera || "";
      document.getElementById("cpu").value = item.cpu || "";
      document.getElementById("memory").value = item.memory || "";
      document.getElementById("ram").value = item.ram || "";
      document.getElementById("battery").value = item.battery || "";
      preview.src = item.anh || "";

      currentEditingId = item.id;
      themsanpham.textContent = "Cập nhật sản phẩm";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // --- Nút xóa ---
    row.querySelector(".sp-del").addEventListener("click", () => {
      if (confirm(`Bạn có chắc muốn xóa "${item.tensp}"?`)) {
        datalist = datalist.filter(sp => sp.id !== item.id);
        ghidulieuLocalStorage("datalist", datalist);
        updateBang();
      }
    });

    // --- Nút xem chi tiết ---
    row.querySelector(".sp-view").addEventListener("click", () => {
      alert(`
Tên: ${item.tensp}
Thương hiệu: ${item.thuonghieu}
Giá: ${item.gia.toLocaleString("vi-VN")}₫
Màu: ${item.color || "-"}
Camera: ${item.camera || "-"}
CPU: ${item.cpu || "-"}
RAM: ${item.ram || "-"}
Bộ nhớ: ${item.memory || "-"}
Pin: ${item.battery || "-"}
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
  const tensp = timten.value.trim().toLowerCase();
  const brand = timbrand.value.trim().toLowerCase();

  if (!tensp && !brand) {
    updateBang();
    return;
  }

  const filtered = datalist.filter(sp => {
    const matchTen = tensp ? sp.tensp.toLowerCase().includes(tensp) : true;
    const matchBrand = brand ? sp.thuonghieu.toLowerCase().includes(brand) : true;
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
    <th>Hành động</th>
  `;
  table.appendChild(headerRow);

  filteredList.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td><img src="${item.anh || ""}" width="50" height="50" alt="${item.tensp}"></td>
      <td>${item.tensp}</td>
      <td>${item.thuonghieu}</td>
      <td>${item.gia.toLocaleString("vi-VN")}₫</td>
      <td>
        <button class="sp-edit">Sửa</button>
        <button class="sp-del">X</button>
        <button class="sp-view">Chi tiết</button>
      </td>
    `;
    table.appendChild(row);

    row.querySelector(".sp-edit").addEventListener("click", () => {
      tenspinp.value = item.tensp;
      thuonghieuinp.value = item.thuonghieu;
      giainp.value = item.gia;
      document.getElementById("color").value = item.color || "";
      document.getElementById("camera").value = item.camera || "";
      document.getElementById("cpu").value = item.cpu || "";
      document.getElementById("memory").value = item.memory || "";
      document.getElementById("ram").value = item.ram || "";
      document.getElementById("battery").value = item.battery || "";
      preview.src = item.anh || "";

      currentEditingId = item.id;
      themsanpham.textContent = "Cập nhật sản phẩm";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    row.querySelector(".sp-del").addEventListener("click", () => {
      if (confirm(`Bạn có chắc muốn xóa "${item.tensp}"?`)) {
        datalist = datalist.filter(sp => sp.id !== item.id);
        ghidulieuLocalStorage("datalist", datalist);
        timkiem();
      }
    });

    row.querySelector(".sp-view").addEventListener("click", () => {
      alert(`
Tên: ${item.tensp}
Thương hiệu: ${item.thuonghieu}
Giá: ${item.gia.toLocaleString("vi-VN")}₫
Màu: ${item.color || "-"}
Camera: ${item.camera || "-"}
CPU: ${item.cpu || "-"}
RAM: ${item.ram || "-"}
Bộ nhớ: ${item.memory || "-"}
Pin: ${item.battery || "-"}
      `);
    });
  });

  divContainer.appendChild(table);
}
