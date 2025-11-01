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

let datalist = [];

// Khi tải trang
window.addEventListener("DOMContentLoaded", async () => {
    // 1️⃣ Lấy dữ liệu từ localStorage
    const saved = localStorage.getItem("datalist");
    if (saved) {
        datalist = JSON.parse(saved);
        if (datalist.length){
            const nums = datalist.map(sp => parseInt(String(sp.id).slice(1),10));
            id = Math.max(...nums);
        }
    }

    // 2️⃣ Lấy dữ liệu từ file dienthoai.json
    try {
        const res = await fetch("../asset/data/dienthoai.json");
        const jsonData = await res.json();

        // 3️⃣ Chọn ra các trường cần thiết (giả sử file có các thuộc tính phức tạp)
        const fromFile = jsonData.map(sp => ({
            id: sp.id.toString().startsWith("S") ? sp.id : "S" + String(sp.id).padStart(3, "0"),
            tensp: sp.ten,
            thuonghieu: sp.brand,
            gia: sp.gia,
            anh: sp.src
        }));

        // 4️⃣ Gộp 2 nguồn dữ liệu lại (tránh trùng id)
        const existingIds = new Set(datalist.map(sp => sp.id));
        datalist = [
            ...datalist,
            ...fromFile.filter(sp => !existingIds.has(sp.id))
        ];

        
        localStorage.setItem("datalist", JSON.stringify(datalist));
    } catch (err) {
        console.error("Không thể load dienthoai.json:", err);
    }

    updateBang();
});

// Khi bấm nút thêm sản phẩm
themsanpham.addEventListener("click", function () {
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
        saveProduct(tensp, thuonghieu, gia, "");
    }
});

function saveProduct(tensp, thuonghieu, gia, base64) {
    const existed = datalist.find(item => item.tensp === tensp);

    if (existed) {
        existed.thuonghieu = thuonghieu;
        existed.gia = gia;
        if (base64) existed.anh = base64;
    } else {
        id++;
        const newId = "S" + String(id).padStart(3, "0");
        datalist.push({ id: newId, anh: base64, tensp, thuonghieu, gia });
    }

    localStorage.setItem("datalist", JSON.stringify(datalist));

    tenspinp.value = "";
    thuonghieuinp.value = "";
    giainp.value = "";
    image.value = "";
    preview.src = "";

    updateBang();
}

// Hiển thị bảng
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

        // ID
        const idCell = document.createElement("td");
        idCell.textContent = item.id;
        row.appendChild(idCell);

        // Ảnh
        const imgCell = document.createElement("td");
        const img = document.createElement("img");
        img.src = item.anh || "";
        img.alt = item.tensp;
        img.width = 50;
        img.height = 50;
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        // Tên
        const nameCell = document.createElement("td");
        nameCell.textContent = item.tensp;
        row.appendChild(nameCell);

        // Thương hiệu
        const brandCell = document.createElement("td");
        brandCell.textContent = item.thuonghieu;
        row.appendChild(brandCell);

        // Giá
        const priceCell = document.createElement("td");
        priceCell.textContent = item.gia.toLocaleString("vi-VN") + "₫";
        row.appendChild(priceCell);

        // Hành động
        const actionCell = document.createElement("td");
        actionCell.innerHTML = `
            <button class="sp-edit">Sửa</button>
            <button class="sp-del">X</button>
        `;
        row.appendChild(actionCell);

        // Sửa
        actionCell.querySelector(".sp-edit").addEventListener("click", () => {
            tenspinp.value = item.tensp;
            thuonghieuinp.value = item.thuonghieu;
            giainp.value = item.gia;
            preview.src = item.anh;
            datalist = datalist.filter(sp => sp.id !== item.id);
            localStorage.setItem("datalist", JSON.stringify(datalist));
            updateBang();
        });

        // Xóa
        actionCell.querySelector(".sp-del").addEventListener("click", () => {
            datalist = datalist.filter(sp => sp.id !== item.id);
            localStorage.setItem("datalist", JSON.stringify(datalist));
            updateBang();
        });

        table.appendChild(row);
    });

    divContainer.appendChild(table);
}

tim.addEventListener("click", timkiem);

function timkiem() {
    const tensp = timten.value.trim().toLowerCase();
    const brand = timbrand.value.trim().toLowerCase();

    // Nếu cả hai ô tìm kiếm đều trống → hiển thị lại toàn bộ
    if (!tensp && !brand) {
        updateBang();
        return;
    }

    // Lọc sản phẩm theo tên hoặc thương hiệu (không phân biệt hoa thường)
    const filtered = datalist.filter(sp => {
        const matchTen = tensp ? sp.tensp.toLowerCase().includes(tensp) : true;
        const matchBrand = brand ? sp.thuonghieu.toLowerCase().includes(brand) : true;
        return matchTen && matchBrand;
    });

    // Hiển thị kết quả
    divContainer.innerHTML = "";

    if (filtered.length === 0) {
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

    filtered.forEach(item => {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = item.id;
        row.appendChild(idCell);

        const imgCell = document.createElement("td");
        const img = document.createElement("img");
        img.src = item.anh || "";
        img.alt = item.tensp;
        img.width = 50;
        img.height = 50;
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        const nameCell = document.createElement("td");
        nameCell.textContent = item.tensp;
        row.appendChild(nameCell);

        const brandCell = document.createElement("td");
        brandCell.textContent = item.thuonghieu;
        row.appendChild(brandCell);

        const priceCell = document.createElement("td");
        priceCell.textContent = item.gia.toLocaleString("vi-VN") + "₫";
        row.appendChild(priceCell);

        const actionCell = document.createElement("td");
        actionCell.innerHTML = `
            <button class="sp-edit">Sửa</button>
            <button class="sp-del">X</button>
        `;
        row.appendChild(actionCell);

        // Sửa
        actionCell.querySelector(".sp-edit").addEventListener("click", () => {
            tenspinp.value = item.tensp;
            thuonghieuinp.value = item.thuonghieu;
            giainp.value = item.gia;
            preview.src = item.anh;
            datalist = datalist.filter(sp => sp.id !== item.id);
            localStorage.setItem("datalist", JSON.stringify(datalist));
            updateBang();
        });

        // Xóa
        actionCell.querySelector(".sp-del").addEventListener("click", () => {
            datalist = datalist.filter(sp => sp.id !== item.id);
            localStorage.setItem("datalist", JSON.stringify(datalist));
            updateBang();
        });

        table.appendChild(row);
    });

    divContainer.appendChild(table);
}

