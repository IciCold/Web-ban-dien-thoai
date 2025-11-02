// 1. Sửa import: Bỏ 'products' và 'displayProducts'
// Chúng ta chỉ cần 'productsGrid' để biết NƠI hiển thị kết quả.
import { productsGrid } from "./Home.js";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const viewMoreBtn = document.getElementById("viewMoreBtn"); // Lấy nút "Xem thêm"

// 2. Tạo biến để lưu trữ tất cả sản phẩm
let allProducts = [];

// 3. Hàm tải dữ liệu JSON (giống hệt Home.js)
// File: search.js

// (XÓA HÀM CŨ)

// ✅ HÀM MỚI (Dán hàm này vào)
async function loadSearchData() {
  try {
    // 1. Tải tệp JSON (dữ liệu gốc)
    const response = await fetch("../asset/data/dienthoai.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonProducts = await response.json();

    // 2. Tải dữ liệu từ localStorage (dữ liệu admin đã thêm)
    const savedProductsRaw = localStorage.getItem("datalist");
    const localProducts = savedProductsRaw ? JSON.parse(savedProductsRaw) : [];

    // 3. Gộp hai nguồn dữ liệu
    const allData = [...localProducts];
    const localIds = new Set(localProducts.map(p => p.id));

    // 4. Thêm dữ liệu từ JSON nếu ID chưa tồn tại trong localStorage
    jsonProducts.forEach(sp => {
      // Chuẩn hóa ID từ JSON (nếu cần)
      const adminId = sp.id.toString().startsWith("S") ? sp.id : "S" + String(sp.id).padStart(3, "0");
      if (!localIds.has(adminId)) {
        allData.push({ ...sp, id: adminId });
      }
    });

    // 5. Ánh xạ (map) dữ liệu TỔNG HỢP sang định dạng mà search.js mong đợi
    allProducts = allData.map(item => {
      let effectiveBrand = (item.brand || item.thuonghieu || "");
      if (item.loai === 'Tablet') {
        effectiveBrand = 'ipad';
      }

      // Giữ lại ID để có thể click vào chi tiết
      return {
        ...item, // Quan trọng: Giữ lại 'id' và các trường gốc
        name: item.ten || item.tensp,         // Lấy 'ten' (JSON) hoặc 'tensp' (admin)
        brand: effectiveBrand.toLowerCase(), // Chuẩn hóa brand về chữ thường
        price: item.gia,
        img: item.src || item.anh            // Lấy 'src' (JSON) hoặc 'anh' (admin)
      };
    });

  } catch (error) {
    console.error("Lỗi tải dữ liệu cho search:", error);
  }
}
// 5. Hàm riêng để hiển thị KẾT QUẢ TÌM KIẾM
// (Chúng ta không dùng displayProducts từ Home.js vì nó có logic "Xem thêm")
function displaySearchResults(list) {
  productsGrid.innerHTML = ""; // Xóa các sản phẩm cũ

  // Nếu không có kết quả
  if (list.length === 0) {
    productsGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px;color:gray;">Không tìm thấy sản phẩm</div>`;
    return;
  }

  // Nếu có kết quả, tạo card cho TẤT CẢ sản phẩm tìm được
  list.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
            <img src="${product.img}" alt="${product.name}">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price.toLocaleString()} VND</div>
            <button class="buy-btn">Mua ngay</button>
        `;
    productsGrid.appendChild(card);
  });

  // Gọi lại hàm actionsBuy để các card mới có thể click được
  actionsBuyForSearch();
}

// 6. Hàm xử lý tìm kiếm
function handleSearch() {
  const keyword = searchInput.value.trim().toLowerCase();

  // Nếu không nhập gì, ta không làm gì cả (hoặc có thể reset về trang chủ)
  if (!keyword) {
    // Để reset, cách đơn giản nhất là giả lập như đang ở trang chủ
    // bằng cách reload lại hash (nếu bạn muốn)
    // location.hash = "home"; 
    return;
  }

  // 7. Dùng 'allProducts' đã tải về để lọc
  const result = allProducts.filter(p =>
    p.name.toLowerCase().includes(keyword)
  );

  // Ẩn nút "Xem thêm" đi khi hiển thị kết quả tìm kiếm
  if (viewMoreBtn) viewMoreBtn.style.display = "none";

  // 8. Hiển thị kết quả bằng hàm mới
  displaySearchResults(result);
}

// 9. Copy hàm actionsBuy từ Home.js để gán sự kiện click
function actionsBuyForSearch() {
  const clickOnProduct = productsGrid.querySelectorAll(".product-card");
  clickOnProduct.forEach((element) => {
    element.addEventListener("click", () => {
      location.hash = "chitiet";
    });
  });
}

// 10. Gắn sự kiện cho nút tìm kiếm và phím Enter
searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") handleSearch();
});

// 11. Tải dữ liệu tìm kiếm ngay khi tệp được nạp
loadSearchData();