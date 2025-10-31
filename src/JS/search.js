// 1. Sửa import: Bỏ 'products' và 'displayProducts'
// Chúng ta chỉ cần 'productsGrid' để biết NƠI hiển thị kết quả.
import { productsGrid } from "./Home.js";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const viewMoreBtn = document.getElementById("viewMoreBtn"); // Lấy nút "Xem thêm"

// 2. Tạo biến để lưu trữ tất cả sản phẩm
let allProducts = [];

// 3. Hàm tải dữ liệu JSON (giống hệt Home.js)
async function loadSearchData() {
  try {
    const response = await fetch("../asset/data/dienthoai.json"); // Đảm bảo đường dẫn này đúng
    if (!response.ok) throw new Error("Không thể tải JSON cho tìm kiếm");

    const data = await response.json();

    // 4. Ánh xạ dữ liệu từ JSON
    allProducts = data.map(item => {
      let effectiveBrand = item.brand;
      if (item.loai === 'Tablet') {
        effectiveBrand = 'ipad';
      }
      return {
        name: item.ten,
        brand: effectiveBrand,
        price: item.gia,
        img: item.src
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