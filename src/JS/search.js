// 1. Nhập MỌI THỨ chúng ta cần từ Home.js
// Giờ đây search.js sẽ dùng chung danh sách sản phẩm và hàm hiển thị của Home.js
import {
  productsGrid,
  displayProducts,
  resetToFirstPage,
  returnHome
} from "./Home.js";
import { docdulieuLocalStorage } from "./readandwrite.js";


// 2. Lấy các phần tử DOM
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const logo = document.querySelector(".logo");
let data = docdulieuLocalStorage("dataProducts");

// 3. Hàm xử lý tìm kiếm (đã được làm lại hoàn toàn)
function handleSearch() {
  const keyword = searchInput.value.trim().toLowerCase();

  // Ẩn các yếu tố của trang chủ
  const carousel = document.querySelector(".carousel-container");

  const filterbar = document.querySelector(".brand-filter");

  // Đổi tiêu đề
  const heading = document.querySelector(".products-section h2");

  // Nếu không có từ khóa, ta có thể hiển thị lại TẤT CẢ sản phẩm
  if (!keyword) {
    if (carousel) carousel.style.display = "block";
    if (filterbar) filterbar.style.display = "flex";
    if (heading) heading.innerHTML = "Sản phẩm nổi bật"; // Trả lại tiêu đề
    resetToFirstPage();
    displayProducts(data); // Hiển thị lại tất cả
    return;
  } else {
    if (carousel) carousel.style.display = "none";
    if (filterbar) filterbar.style.display = "none";
    if (heading) heading.innerHTML = "Kết quả tìm kiếm";
  }



  // 4. Lọc sản phẩm từ 'dataProducts' đã nhập từ Home.js
   const result = data.filter(
     (p) => !p.hidden && p.ten.toLowerCase().includes(keyword)
   );

  // 5. GỌI LOGIC CỦA HOME.JS
  // Reset về trang 1 cho kết quả tìm kiếm mới
  resetToFirstPage();

  // Dùng hàm 'displayProducts' của Home.js.
  // Hàm này đã bao gồm logic 4x4 (16 sản phẩm) và tự động tạo phân trang!
  displayProducts(result);
}

// 6. Gắn sự kiện
searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});
logo.addEventListener("click",e => {
  searchInput.value = "";
  returnHome();
});

// KHÔNG CẦN loadSearchData() hay displaySearchResults() nữa
// vì chúng ta đang dùng chung logic từ Home.js