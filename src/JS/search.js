import { products, productsGrid, displayProducts } from "./Home.js";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

function handleSearch() {
  const keyword = searchInput.value.trim().toLowerCase();
  if (!keyword) return displayProducts(products);

  const result = products.filter(p =>
    p.name.toLowerCase().includes(keyword)
  );

  productsGrid.innerHTML = result.length
    ? ""
    : `<div style="grid-column:1/-1;text-align:center;padding:20px;color:gray;">Không tìm thấy sản phẩm</div>`;
  
  if (result.length) displayProducts(result);
}

searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") handleSearch();
});