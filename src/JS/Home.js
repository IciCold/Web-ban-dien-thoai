import { docJSONvaLuuLocalStorage, docdulieuLocalStorage, ghidulieuLocalStorage } from "./readandwrite.js";
// Carousel Logic
const carousel = document.getElementById("carousel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const indicators = document.querySelectorAll(".indicator");
let currentSlide = 0;
let slideInterval;
const slideCount = document.querySelectorAll(".carousel-slide").length;

// Hàm chuyển slide
function goToSlide(index) {
  currentSlide = index;
  carousel.style.transform = `translateX(-${currentSlide * 100}%)`;

  indicators.forEach((indicator, i) => {
    if (i === currentSlide) {
      indicator.classList.add("active");
    } else {
      indicator.classList.remove("active");
    }
  });
}

// Hàm chuyển đến slide tiếp theo
function nextSlide() {
  currentSlide = (currentSlide + 1) % slideCount;
  goToSlide(currentSlide);
}

// Hàm chuyển đến slide trước đó
function prevSlide() {
  currentSlide = (currentSlide - 1 + slideCount) % slideCount;
  goToSlide(currentSlide);
}

// Bắt đầu tự động chuyển slide
function startSlideShow() {
  slideInterval = setInterval(nextSlide, 5000);
}

// Dừng tự động chuyển slide
function stopSlideShow() {
  clearInterval(slideInterval);
}

// Sự kiện nút điều hướng
nextBtn.addEventListener("click", () => {
  stopSlideShow();
  nextSlide();
  startSlideShow();
});

prevBtn.addEventListener("click", () => {
  stopSlideShow();
  prevSlide();
  startSlideShow();
});

// Sự kiện cho indicators
indicators.forEach((indicator) => {
  indicator.addEventListener("click", () => {
    stopSlideShow();
    const index = parseInt(indicator.getAttribute("data-index"));
    goToSlide(index);
    startSlideShow();
  });
});

// Dừng carousel khi hover
carousel.addEventListener("mouseenter", stopSlideShow);
carousel.addEventListener("mouseleave", startSlideShow);

// Bắt đầu carousel
startSlideShow();

// ===================================================
// PHẦN LOGIC SẢN PHẨM VỚI PHÂN TRANG
// ===================================================

let dataProducts = [];
const productsGrid = document.getElementById("productsGrid");
const logo = document.querySelector(".logo");

// Cấu hình phân trang
const PRODUCTS_PER_PAGE = 16; // Số sản phẩm mỗi trang
let currentPage = 1; // Trang hiện tại
let currentFilteredList = []; // Danh sách đã lọc

export function returnHome(){
  if (logo) {
    logo.addEventListener("click", (e) => {
      if (location.hash !== "home") {
        location.hash = "home";
      }
    
    const carousel = document.querySelector(".carousel-container");
    if (carousel) carousel.style.display = "block";

    const filterbar = document.querySelector(".brand-filter");
    if (filterbar) filterbar.style.display = "flex";

    // Reset heading
    const heading = document.querySelector(".products-section h2");
    if (heading) heading.innerHTML = "Sản phẩm nổi bật";

    resetToFirstPage();
    displayProducts(dataProducts);
    });
    
  }
}

// Hàm reset về trang 1 (để LocSanPham.js gọi)
export function resetToFirstPage() {
  currentPage = 1;
}

export async function loadProducts() {
  try {
    

    // 2️ Đọc dữ liệu người dùng từ localStorage
    dataProducts = await docJSONvaLuuLocalStorage("dataProducts", "../asset/data/dienthoai.json");

    // 5️ Hiển thị ban đầu

    displayProducts(dataProducts);

  } catch (error) {
    console.error("Không thể tải sản phẩm:", error);
    productsGrid.innerHTML = "<p>Chưa có sản phẩm. Vui lòng đợi</p>";
  }
}




// ======= HIỂN THỊ SẢN PHẨM VỚI PHÂN TRANG =======
export function displayProducts(list) {
   // 1. Lọc bỏ các sản phẩm bị ẩn (chỉ hiển thị cho khách hàng)
  const visibleList = list.filter(product => !product.hidden);

  // Lưu lại danh sách đã lọc
  currentFilteredList = visibleList;

  // 2. Tính toán phân trang
  const totalPages = Math.ceil(visibleList.length / PRODUCTS_PER_PAGE);
  
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const productsToShow = visibleList.slice(startIndex, endIndex);
  
  // 3. Xóa nội dung cũ
  productsGrid.innerHTML = "";
  
  // 4. Hiển thị sản phẩm
  productsToShow.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = product.id;
    card.innerHTML = `
      <img src="${product.src}" alt="${product.ten}">
      <div class="product-name">${product.ten}</div>
      <div class="product-price">${product.giaBan.toLocaleString()} VND</div>
    `;
    productsGrid.appendChild(card);
  });
  
  // 5. Gắn lại sự kiện cho các card sản phẩm
  actionsBuy();
  
  // 6. Hiển thị phân trang
  renderPagination(totalPages);
  
  
}

// ======= TẠO GIAO DIỆN PHÂN TRANG =======
function renderPagination(totalPages) {
  // Tìm hoặc tạo container phân trang
  let paginationContainer = document.getElementById("pagination-container");
  
  if (!paginationContainer) {
    paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination-container";
    paginationContainer.className = "pagination-container";
    
    // Chèn sau products-grid
    const productsSection = document.querySelector(".products-section");
    productsSection.appendChild(paginationContainer);
  }
  
  // Xóa nội dung cũ
  paginationContainer.innerHTML = "";
  
  // Nếu chỉ có 1 trang hoặc không có sản phẩm, ẩn phân trang
  if (totalPages <= 1) {
    paginationContainer.style.display = "none";
    return;
  }
  
  paginationContainer.style.display = "flex";
  
  // Nút Previous
  const prevButton = document.createElement("button");
  prevButton.className = "pagination-btn";
  prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayProducts(currentFilteredList);
    }
  });
  paginationContainer.appendChild(prevButton);
  
  // Tính toán các trang cần hiển thị
  const pagesToShow = calculatePagesToShow(currentPage, totalPages);
  
  pagesToShow.forEach(pageNum => {
    if (pageNum === "...") {
      const dots = document.createElement("span");
      dots.className = "pagination-dots";
      dots.textContent = "...";
      paginationContainer.appendChild(dots);
    } else {
      const pageButton = document.createElement("button");
      pageButton.className = "pagination-btn";
      if (pageNum === currentPage) {
        pageButton.classList.add("active");
      }
      pageButton.textContent = pageNum;
      pageButton.addEventListener("click", () => {
        currentPage = pageNum;
        displayProducts(currentFilteredList);
      });
      paginationContainer.appendChild(pageButton);
    }
  });
  
  // Nút Next
  const nextButton = document.createElement("button");
  nextButton.className = "pagination-btn";
  nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayProducts(currentFilteredList);
    }
  });
  paginationContainer.appendChild(nextButton);
}

// ======= TÍNH TOÁN CÁC TRANG CẦN HIỂN THỊ =======
function calculatePagesToShow(current, total) {
  const pages = [];
  const delta = 2; // Số trang hiển thị xung quanh trang hiện tại
  
  // Luôn hiển thị trang 1
  pages.push(1);
  
  // Tính toán khoảng hiển thị
  for (let i = current - delta; i <= current + delta; i++) {
    if (i > 1 && i < total) {
      // Thêm dấu ... nếu cần
      if (pages[pages.length - 1] !== i - 1 && pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
      pages.push(i);
    }
  }
  
  // Thêm dấu ... trước trang cuối nếu cần
  if (pages[pages.length - 1] !== total - 1 && pages[pages.length - 1] !== total && total > 1) {
    if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }
  
  // Luôn hiển thị trang cuối
  if (total > 1) {
    pages.push(total);
  }
  
  return pages;
}

// ======= KHỞI TẠO =======
if(dataProducts.length === 0) loadProducts();
else{
  dataProducts = docdulieuLocalStorage("dataProducts");
  displayProducts(dataProducts);
}
returnHome();


// ===================================================
// PHẦN LOGIC POPUP VÀ CHUYỂN TRANG
// ===================================================

const userName = document.querySelector(".user-name");
const popUp = document.getElementById("overlay-Popup");

userName.addEventListener("click", (e) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (currentUser) {
    location.hash = "profile";
  } else {
    popUp.style.opacity = "1";
    popUp.style.visibility = "visible";
  }
});

popUp.addEventListener("click", (e) => {
  if (e.target === popUp) {
    popUp.style.visibility = "hidden";
    popUp.style.opacity = "0";
  }
});

const option = document.querySelector(".option");
option.addEventListener("click", (e) => {
  if (!e.target.classList || !e.target.classList.contains("text")) return;
  if (e.target.textContent === "Đăng nhập") {
    location.hash = "login";
  }
  if (e.target.textContent === "Đăng ký") {
    location.hash = "register";
  }
  popUp.style.visibility = "hidden";
  popUp.style.opacity = "0";
});

function actionsBuy(){
    const clickOnProduct = productsGrid.querySelectorAll(".product-card");
    clickOnProduct.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.classList.contains('buy-btn')) {
            console.log("Thêm vào giỏ hàng (chưa làm)");
            e.stopPropagation();
            return;
        }

        const productId = card.dataset.id;
        if(productId) {
            localStorage.setItem("selectedProductId", productId);
            location.hash = "chitiet";
        }
      });
    });
}
  
// Export
export { productsGrid };



