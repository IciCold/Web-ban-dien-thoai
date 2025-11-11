// ==============================
//  IMPORT CÁC HÀM DÙNG CHUNG
// ==============================
import { showalert } from "../../JS/alert.js";
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
  const kich_thuoc = kichthuocinp.value.trim();
  const loai = loaiinp.value.trim();
  const anhFile = image.files[0];

  if (!ten || !brand) {
    showalert("Vui lòng nhập đầy đủ thông tin hợp lệ!","warning");
    return;
  }

  if (anhFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const base64 = e.target.result;
      preview.src = base64;
      saveProduct({ten, brand, kich_thuoc, loai, base64});
    };
    reader.readAsDataURL(anhFile);
  } else {
    saveProduct({ten, brand, kich_thuoc, loai, base64: currentEditingId ? null : ""});
  }
});

// ==============================
//  HÀM SAVE PRODUCT
// ==============================
function saveProduct({ten, brand, mau_sac = "", camera = "", cpu = "", bo_nho = "", ram = "", dung_luong_pin = "", kich_thuoc = "", loai = "", base64 = ""}) {
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
      showalert("Tên sản phẩm này đã tồn tại ở một sản phẩm khác!","warning");
      return;
    }

    if (productToUpdate) {
      const oldGia = productToUpdate.gia; 
      const oldGiaBan = productToUpdate.giaBan;
      Object.assign(productToUpdate, {ten, brand, gia:oldGia,giaBan:oldGiaBan, mau_sac, kich_thuoc, bo_nho, ram, cpu, camera, dung_luong_pin, loai});
      if (base64) productToUpdate.src = base64;
      showalert(`Đã cập nhật sản phẩm "${ten}" thành công!`, "success");
    }

  } else {
    const existed = datalist.find(item => item.ten.toLowerCase() === ten.toLowerCase());
    if (existed) {
      const useExisting = confirm(`Sản phẩm "${ten}" đã tồn tại.\n\n` +`Bạn có muốn:\n` +
        `• OK: Chỉnh sửa sản phẩm hiện có\n` +
        `• Cancel: Đổi tên sản phẩm mới`
      );
      if (useExisting) {
        // Tự động chuyển sang chế độ chỉnh sửa
        currentEditingId = existed.id;
        autofillProductForm(existed);
        themsanpham.textContent = "Cập nhật sản phẩm";
        return;
      } else {
        showalert("Vui lòng đổi tên sản phẩm mới.","warning");
        return;
      }
    }

    id++;
    const newId = "S" + String(id).padStart(3, "0");
    datalist.push({id: newId, src: base64 || "", ten, brand, gia:0, so_luong: 0, mau_sac, kich_thuoc, bo_nho, ram, cpu, camera, dung_luong_pin, loai});
    showalert(`Đã thêm sản phẩm "${ten}" thành công!`, "success");
  }

  ghidulieuLocalStorage("dataProducts", datalist);

  // Reset form
  ["tensp","brand","color","camera","cpu","memory","ram","battery","size","type"].forEach(id => document.getElementById(id).value = "");
  image.value = "";
  preview.src = "";
  themsanpham.textContent = "Thêm";

  resetProductForm();
  updateBang();
  populateDatalists();
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
      <td>${ item.giaBan 
      ? item.giaBan.toLocaleString("vi-VN") + "₫" 
      : "không có giá bán"}</td>
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
    
      document.getElementById("color").value = item.mau_sac || "";
      document.getElementById("size").value = item.kich_thuoc || "";
      document.getElementById("memory").value = item.bo_nho || "";
      document.getElementById("ram").value = item.ram || "";
      document.getElementById("cpu").value = item.cpu || "";
      document.getElementById("camera").value = item.camera || "";
      document.getElementById("battery").value = item.dung_luong_pin || "";
      document.getElementById("type").value = item.loai || "";
      preview.src = item.src || "";

      setFormMode('edit', item);
      currentEditingId = item.id;

      window.scrollTo({ top: 0, behavior: "smooth" });

      showalert(`Đang chỉnh sửa sản phẩm: "${item.ten}"`, "info");
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
      showalert(`
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
  populateDatalists();
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
      showalert(`
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
//  HÀM ĐIỀN DỮ LIỆU GỢI Ý (AUTOCOMPLETE)
// ==============================
function populateDatalists() {
  if (!datalist || datalist.length === 0) return;
  
  // Lấy tất cả các giá trị duy nhất từ danh sách sản phẩm
  const brands = [...new Set(datalist.map(sp => sp.brand).filter(Boolean))];
  const sizes = [...new Set(datalist.map(sp => sp.kich_thuoc).filter(Boolean))];
  const types = [...new Set(datalist.map(sp => sp.loai).filter(Boolean))];
  const colors = [...new Set(datalist.map(sp => sp.mau_sac).filter(Boolean))];
  const cameras = [...new Set(datalist.map(sp => sp.camera).filter(Boolean))];
  const cpus = [...new Set(datalist.map(sp => sp.cpu).filter(Boolean))];
  const memories = [...new Set(datalist.map(sp => sp.bo_nho).filter(Boolean))];
  const rams = [...new Set(datalist.map(sp => sp.ram).filter(Boolean))];
  const batteries = [...new Set(datalist.map(sp => sp.dung_luong_pin).filter(Boolean))];
  
  // Hàm điền dữ liệu vào datalist
  const populateList = (listId, data) => {
    const datalistElement = document.getElementById(listId);
    if (datalistElement) {
      datalistElement.innerHTML = '';
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalistElement.appendChild(option);
      });
    }
  };
  
  // Điền dữ liệu vào các datalist
  populateList('brand-list', brands);
  populateList('size-list', sizes);
  populateList('type-list', types);
  populateList('color-list', colors);
  populateList('camera-list', cameras);
  populateList('cpu-list', cpus);
  populateList('memory-list', memories);
  populateList('ram-list', rams);
  populateList('battery-list', batteries);
}
// ==============================
//  HÀM GỢI Ý TỰ ĐỘNG CHO TÊN SẢN PHẨM
// ==============================

function setupProductNameAutocomplete() {
  const productNameInput = document.getElementById('tensp');
  const productNameDatalist = document.getElementById('product-names');
  
  if (!productNameInput || !productNameDatalist) return;
  
  // Lấy tất cả tên sản phẩm hiện có
  const productNames = [...new Set(datalist.map(sp => sp.ten).filter(Boolean))];
  
  // Điền dữ liệu ban đầu
  populateProductNameDatalist(productNames);
  
  // Lắng nghe sự kiện input để gợi ý theo từ khóa
  productNameInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm.length < 2) {
      populateProductNameDatalist(productNames);
      return;
    }
    
    // Lọc sản phẩm theo từ khóa
    const filteredNames = productNames.filter(name => 
      name.toLowerCase().includes(searchTerm)
    );
    
    populateProductNameDatalist(filteredNames);
  });
}

function populateProductNameDatalist(names) {
  const datalistElement = document.getElementById('product-names');
  if (!datalistElement) return;
  
  datalistElement.innerHTML = '';
  names.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    datalistElement.appendChild(option);
  });
}
// ==============================
//  HÀM TỰ ĐỘNG ĐIỀN THÔNG TIN KHI CHỌN SẢN PHẨM
// ==============================

function setupAutoFillOnProductSelect() {
  const productNameInput = document.getElementById('tensp');
  
  if (!productNameInput) return;
  
  productNameInput.addEventListener('change', function(e) {
    const selectedProductName = e.target.value;
    
    if (!selectedProductName) return;
    
    // Tìm sản phẩm trong danh sách
    const existingProduct = datalist.find(sp => 
      sp.ten.toLowerCase() === selectedProductName.toLowerCase()
    );
    
    if (existingProduct) {
      // Tự động điền thông tin sản phẩm
      autofillProductForm(existingProduct);
    }
  });
}

function autofillProductForm(product) {
  // Điền thông tin vào các trường
  document.getElementById('brand').value = product.brand || '';
  document.getElementById('size').value = product.kich_thuoc || '';
  document.getElementById('type').value = product.loai || '';
  document.getElementById('color').value = product.mau_sac || '';
  document.getElementById('camera').value = product.camera || '';
  document.getElementById('cpu').value = product.cpu || '';
  document.getElementById('memory').value = product.bo_nho || '';
  document.getElementById('ram').value = product.ram || '';
  document.getElementById('battery').value = product.dung_luong_pin || '';
  
  // Hiển thị ảnh nếu có
  if (product.src) {
    document.getElementById('preview').src = product.src;
  }
  
  // Thông báo cho người dùng
  showalert(`Đã tự động điền thông tin từ sản phẩm "${product.ten}"`, "info");
}
// ==============================
//  CẬP NHẬT HÀM KHỞI TẠO
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
  // Khởi tạo form ở chế độ thêm mới
  setFormMode('add');
  
  // Thêm các hàm gợi ý
  populateDatalists();
  setupProductNameAutocomplete();
  setupAutoFillOnProductSelect();
  setupSmartAutocomplete();
});

// ==============================
//  GỢI Ý THÔNG MINH THEO THƯƠNG HIỆU
// ==============================

function setupSmartAutocomplete() {
  const brandInput = document.getElementById('brand');
  const typeInput = document.getElementById('type');
  
  if (!brandInput || !typeInput) return;
  
  // Khi thương hiệu thay đổi, gợi ý loại sản phẩm phù hợp
  brandInput.addEventListener('change', function(e) {
    const selectedBrand = e.target.value;
    if (!selectedBrand) return;
    
    const brandProducts = datalist.filter(sp => sp.brand === selectedBrand);
    const brandTypes = [...new Set(brandProducts.map(sp => sp.loai).filter(Boolean))];
    
    // Cập nhật datalist cho loại sản phẩm
    const typeDatalist = document.getElementById('type-list');
    if (typeDatalist) {
      typeDatalist.innerHTML = '';
      brandTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        typeDatalist.appendChild(option);
      });
    }
  });
}
// ==============================
//  HÀM THAY ĐỔI TRẠNG THÁI FORM (THÊM/ SỬA)
// ==============================
function setFormMode(mode, product = null) {
  const titleElement = document.getElementById('form-product-title');
  const submitButton = document.getElementById('themsanphambtn');
  const formBox = document.querySelector('.sp-add-box');
  const buttonsContainer = document.querySelector('.form-buttons-container');

  if (mode === 'edit' && product) {
    // Chế độ sửa
    if (titleElement) {
      titleElement.textContent = `Sửa sản phẩm: ${product.ten}`;
      titleElement.classList.add('editing-title');
    }
    
    if (submitButton) {
      submitButton.textContent = 'Cập nhật sản phẩm';
      submitButton.classList.remove('add-mode');
      submitButton.classList.add('edit-mode');
    }
    
    if (formBox) {
      formBox.classList.add('form-edit-mode');
    }
    if (buttonsContainer) {
      buttonsContainer.classList.add('editing-buttons');
    }
    // Thêm nút "Hủy" nếu chưa có
    addCancelButton();
    
  } else {
    // Chế độ thêm mới
    if (titleElement) {
      titleElement.textContent = 'Thêm sản phẩm';
      titleElement.classList.remove('editing-title');
    }
    
    if (submitButton) {
      submitButton.textContent = 'Thêm';
      submitButton.classList.remove('edit-mode');
      submitButton.classList.add('add-mode');
    }
    
    if (formBox) {
      formBox.classList.remove('form-edit-mode');
    }
    if (buttonsContainer) {
      buttonsContainer.classList.remove('editing-buttons');
    }
    // Xóa nút "Hủy" nếu có
    removeCancelButton();
  }
}
// ==============================
//  HÀM THÊM NÚT HỦY
// ==============================

function addCancelButton() {
  // Kiểm tra xem nút hủy đã tồn tại chưa
  if (document.getElementById('cancel-edit-btn')) return;
  
  const buttonsContainer = document.querySelector('.form-buttons-container');
  const submitButton = document.getElementById('themsanphambtn');
  
  if (buttonsContainer && submitButton) {
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.id = 'cancel-edit-btn';
    cancelButton.textContent = 'Hủy';
    cancelButton.className = 'cancel-button';
    
    // Chèn nút hủy vào container, sau nút submit
    buttonsContainer.appendChild(cancelButton);
    
    // Sự kiện cho nút hủy
    cancelButton.addEventListener('click', function() {
      resetProductForm();
      showalert('Đã hủy chỉnh sửa', 'info');
    });
    
    // Thêm hiệu ứng xuất hiện
    setTimeout(() => {
      cancelButton.style.opacity = '1';
      cancelButton.style.transform = 'translateX(0)';
    }, 10);
  }
}

function removeCancelButton() {
  const cancelButton = document.getElementById('cancel-edit-btn');
  if (cancelButton) {
    // Thêm hiệu ứng biến mất trước khi xóa
    cancelButton.style.opacity = '0';
    cancelButton.style.transform = 'translateX(-10px)';
    
    setTimeout(() => {
      cancelButton.remove();
    }, 300);
  }
}
// ==============================
//  HÀM RESET FORM HOÀN CHỈNH
// ==============================

function resetProductForm() {
  // Reset các trường input
  const fieldsToReset = [
    "tensp", "brand", "color", "camera", "cpu", 
    "memory", "ram", "battery", "size", "type"
  ];
  
  fieldsToReset.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });
  
  // Reset ảnh
  const imageInput = document.getElementById("revenue1");
  const preview = document.getElementById("preview");
  if (imageInput) imageInput.value = "";
  if (preview) preview.src = "";
  
  // Reset trạng thái form
  setFormMode('add');
  currentEditingId = null;
  
  // Focus vào ô đầu tiên
  const firstInput = document.getElementById("tensp");
  if (firstInput) firstInput.focus();
}

// Hàm debug để kiểm tra chiều cao nút
function debugButtonHeights() {
  const submitBtn = document.getElementById('themsanphambtn');
  const cancelBtn = document.getElementById('cancel-edit-btn');
  
  if (submitBtn) {
    console.log('Submit button height:', submitBtn.offsetHeight, 'px');
  }
  if (cancelBtn) {
    console.log('Cancel button height:', cancelBtn.offsetHeight, 'px');
  }
}

// Gọi hàm debug khi cần
// debugButtonHeights();