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
let currentEditingId = null; // BIẾN MỚI ĐỂ THEO DÕI VIỆC SỬA

let datalist = [];

// Khi tải trang
window.addEventListener("DOMContentLoaded", async () => {
    //  Lấy dữ liệu từ localStorage
    const saved = localStorage.getItem("datalist");
    if (saved) {
        datalist = JSON.parse(saved);
        if (datalist.length){
            const nums = datalist.map(sp => parseInt(String(sp.id).slice(1),10));
            // Lọc ra các giá trị hợp lệ trước khi tìm max
            const validNums = nums.filter(n => !isNaN(n));
            if (validNums.length > 0) {
                 id = Math.max(...validNums);
            }
        }
    }

    //  Lấy dữ liệu từ file dienthoai.json
    try {
        const res = await fetch("../../asset/data/dienthoai.json");
        const jsonData = await res.json();

        // 3️Chọn ra tất cả các trường cần thiết từ file (bao gồm chi tiết)
        const fromFile = jsonData.map(sp => ({
            id: sp.id.toString().startsWith("S") ? sp.id : "S" + String(sp.id).padStart(3, "0"),
            tensp: sp.ten || sp.tensp || "",
            thuonghieu: sp.brand || sp.thuonghieu || "",
            gia: sp.gia || 0,
            anh: sp.src || sp.anh || "",

            //  Bổ sung các thông tin chi tiết
            color: sp.color || sp.mau_sac || "",
            camera: sp.camera || "",
            cpu: sp.cpu || "",
            ram: sp.ram || "",
            memory: sp.memory || sp.bo_nho || "",
            battery: sp.battery || sp.dung_luong_pin || ""
        }));

        // 4️ Gộp 2 nguồn dữ liệu lại (tránh trùng id)
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

// Khi bấm nút thêm sản phẩm (LOGIC NÀY KHÔNG ĐỔI)
themsanpham.addEventListener("click", function (e) {
    e.preventDefault(); // Thêm dòng này để tránh form submit
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
         // Nếu không có ảnh mới (khi sửa), ta truyền null
         // Khi thêm mới, ta truyền ""
        saveProduct(tensp, thuonghieu, gia, currentEditingId ? null : "");
    }
});

// ===============================================
// HÀM SAVEPRODUCT ĐƯỢC VIẾT LẠI HOÀN TOÀN
// ===============================================
function saveProduct(tensp, thuonghieu, gia, base64) {
    const color = document.getElementById("color").value.trim();
    const camera = document.getElementById("camera").value.trim();
    const cpu = document.getElementById("cpu").value.trim();
    const memory = document.getElementById("memory").value.trim();
    const ram = document.getElementById("ram").value.trim();
    const battery = document.getElementById("battery").value.trim();

    // KIỂM TRA XEM ĐANG SỬA HAY THÊM MỚI
    if (currentEditingId) {
        // === LOGIC CẬP NHẬT (SỬA) ===
        const productToUpdate = datalist.find(item => item.id === currentEditingId);

        // Kiểm tra xem tên mới có bị trùng với sản phẩm KHÁC không
        const duplicate = datalist.find(
            item => item.tensp.toLowerCase() === tensp.toLowerCase() && item.id !== currentEditingId
        );
        if (duplicate) {
            alert("Tên sản phẩm này đã tồn tại ở một sản phẩm khác!");
            return;
        }

        if (productToUpdate) {
            productToUpdate.tensp = tensp;
            productToUpdate.thuonghieu = thuonghieu;
            productToUpdate.gia = gia;
            productToUpdate.color = color;
            productToUpdate.camera = camera;
            productToUpdate.cpu = cpu;
            productToUpdate.memory = memory;
            productToUpdate.ram = ram;
            productToUpdate.battery = battery;
            if (base64) {
                productToUpdate.anh = base64; // Chỉ cập nhật ảnh nếu có ảnh mới
            }
        }
        
        // Reset ID đang sửa
        currentEditingId = null;
        
    } else {
        // === LOGIC THÊM MỚI (Logic cũ của bạn) ===
        const existed = datalist.find(item => item.tensp.toLowerCase() === tensp.toLowerCase());
        if (existed) {
             alert("Tên sản phẩm đã tồn tại. Không thể thêm mới.");
             return; // Dừng lại
        }
        
        id++;
        const newId = "S" + String(id).padStart(3, "0");
        datalist.push({
            id: newId,
            anh: base64 || "", // Đảm bảo 'anh' có giá trị
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

    localStorage.setItem("datalist", JSON.stringify(datalist));

    // Reset form
    [
        "tensp", "brand", "price", "color", "camera",
        "cpu", "memory", "ram", "battery"
    ].forEach(id => document.getElementById(id).value = "");
    image.value = "";
    preview.src = "";
    
    // Trả lại chữ cho nút
    themsanpham.textContent = "Thêm";

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
            <button class="sp-view">Chi tiết</button>
        `;
        row.appendChild(actionCell);

        // ===============================================
        // LOGIC NÚT SỬA (TRONG updateBang) ĐÃ SỬA
        // ===============================================
        actionCell.querySelector(".sp-edit").addEventListener("click", () => {
            // 1. Điền dữ liệu vào form
            tenspinp.value = item.tensp;
            thuonghieuinp.value = item.thuonghieu;
            giainp.value = item.gia;
            document.getElementById("color").value = item.color || "";
            document.getElementById("camera").value = item.camera || "";
            document.getElementById("cpu").value = item.cpu || "";
            document.getElementById("memory").value = item.memory || "";
            document.getElementById("ram").value = item.ram || "";
            document.getElementById("battery").value = item.battery || "";
            preview.src = item.anh || ""; // Hiển thị ảnh cũ

            // 2. Đặt ID đang sửa
            currentEditingId = item.id;

            // 3. Đổi chữ trên nút
            themsanpham.textContent = "Cập nhật sản phẩm";

            // 4. (Tùy chọn) Cuộn lên đầu trang để sửa
            window.scrollTo({ top: 0, behavior: "smooth" });

            // KHÔNG XÓA SẢN PHẨM KHỎI DATALIST
        });

        // Xóa (LOGIC NÀY KHÔNG ĐỔI)
        actionCell.querySelector(".sp-del").addEventListener("click", () => {
            // Thêm xác nhận trước khi xóa
            if (confirm(`Bạn có chắc muốn xóa sản phẩm "${item.tensp}"?`)) {
                datalist = datalist.filter(sp => sp.id !== item.id);
                localStorage.setItem("datalist", JSON.stringify(datalist));
                updateBang(); // Cập nhật lại bảng
            }
        });

        // Xem chi tiết (LOGIC NÀY KHÔNG ĐỔI)
        actionCell.querySelector(".sp-view").addEventListener("click", () => {
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

        table.appendChild(row);
    });

    divContainer.appendChild(table);
}

// Bấm nút tìm
tim.addEventListener("click", function(e) {
    e.preventDefault(); // Thêm dòng này để tránh form submit
    timkiem();
});

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

    // Hiển thị kết quả (Tái sử dụng hàm updateBang với danh sách đã lọc)
    // Tốt hơn là tạo hàm riêng
    displayFilteredTable(filtered);
}

// Hàm riêng để hiển thị bảng đã lọc (tránh lặp code)
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
            <button class="sp-view">Chi tiết</button> 
        `; // Thêm lại nút chi tiết
        row.appendChild(actionCell);

        // ===============================================
        // LOGIC NÚT SỬA (TRONG BẢNG LỌC)
        // ===============================================
        actionCell.querySelector(".sp-edit").addEventListener("click", () => {
            // 1. Điền dữ liệu
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

            // 2. Đặt ID
            currentEditingId = item.id;

            // 3. Đổi nút
            themsanpham.textContent = "Cập nhật sản phẩm";
            
            // 4. Cuộn lên
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        // Xóa
        actionCell.querySelector(".sp-del").addEventListener("click", () => {
             if (confirm(`Bạn có chắc muốn xóa sản phẩm "${item.tensp}"?`)) {
                // Xóa khỏi danh sách CHÍNH
                datalist = datalist.filter(sp => sp.id !== item.id);
                localStorage.setItem("datalist", JSON.stringify(datalist));
                
                // Cập nhật lại bảng KẾT QUẢ LỌC
                timkiem(); 
             }
        });

        // Xem chi tiết
         actionCell.querySelector(".sp-view").addEventListener("click", () => {
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

        table.appendChild(row);
    });

    divContainer.appendChild(table);
}