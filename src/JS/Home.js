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

  // Cập nhật indicator
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
  slideInterval = setInterval(nextSlide, 5000); // 5 giây
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
// PHẦN LOGIC SẢN PHẨM ĐÃ THAY ĐỔI
// ===================================================

// **2. Tạo một biến để lưu trữ tất cả sản phẩm**
let allProducts = [];

const productsGrid = document.getElementById("productsGrid");
const viewMoreBtn = document.getElementById("viewMoreBtn");
const brandBtns = document.querySelectorAll(".brand-btn");
let visibleProducts = 6;
let currentBrand = "all";
let minPrice = 0;
let maxPrice = Infinity;
// **3. Tạo hàm để tải và xử lý dữ liệu từ JSON**
async function loadProducts() {
  try {
    // Tải tệp JSON (đường dẫn này là tương đối so với tệp index.html)
    const response = await fetch("../asset/data/dienthoai.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // **Quan trọng: Ánh xạ dữ liệu từ JSON sang định dạng mà code của bạn mong đợi**
    allProducts = data.map(item => {
      // Xử lý logic cho "Máy Tính Bảng"
      // Nút lọc của bạn dùng 'data-brand="ipad"' cho Máy Tính Bảng.
      // Tệp JSON dùng 'loai: "Tablet"'.
      // Chúng ta sẽ gán lại 'brand' thành 'ipad' nếu 'loai' là 'Tablet'.
      let effectiveBrand = item.brand;
      if (item.loai === 'Tablet') {
        effectiveBrand = 'ipad';
      }

      return {
        name: item.ten,         // 'ten' từ JSON -> 'name'
        brand: effectiveBrand,  // 'brand' hoặc 'ipad' (nếu là tablet)
        price: item.gia,        // 'gia' từ JSON -> 'price'
        img: item.src           // 'src' từ JSON -> 'img'
      };
    });

    // **4. Sau khi tải và xử lý xong, gọi hàm hiển thị lần đầu**
    updateDisplay();

  } catch (error) {
    console.error("Không thể tải sản phẩm:", error);
    productsGrid.innerHTML = "<p>Lỗi khi tải sản phẩm. Vui lòng thử lại.</p>";
  }
}

// ======= HIỂN THỊ SẢN PHẨM =======
function displayProducts(list) {
  productsGrid.innerHTML = "";

  const shown = list.slice(0, visibleProducts);
  shown.forEach((product) => {
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
  // Gắn lại sự kiện cho tất cả nút "Mua ngay" mới tạo
  actionsBuy();
  viewMoreBtn.style.display = visibleProducts >= list.length ? "none" : "block";
}

// ======= LỌC THEO HÃNG =======
// Hàm này giờ sẽ dùng 'allProducts' thay vì 'products'
function filterByBrand() {
  if (currentBrand === "all") return [...allProducts];
  // Vì đã xử lý 'ipad' ở hàm loadProducts, logic lọc này vẫn đúng
  return allProducts.filter((p) => p.brand === currentBrand);
}

// ======= CẬP NHẬT HIỂN THỊ =======
function updateDisplay() {
  const filtered = filterByBrand();
  displayProducts(filtered);
}

// ======= SỰ KIỆN NHẤN NÚT HÃNG =======
brandBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    brandBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentBrand = btn.dataset.brand;
    visibleProducts = 6;
    updateDisplay();
  });
});

// ======= NÚT XEM THÊM =======
viewMoreBtn.addEventListener("click", () => {
  visibleProducts += 3;
  updateDisplay();
});

// ======= KHỞI TẠO =======
// **5. Gọi hàm loadProducts() thay vì updateDisplay()**
// updateDisplay(); // XÓA DÒNG NÀY
loadProducts(); // THÊM DÒNG NÀY ĐỂ BẮT ĐẦU TẢI DỮ LIỆU

// ===================================================
// PHẦN LOGIC POPUP VÀ CHUYỂN TRANG (ĐÃ SỬA)
// ===================================================

// [SỬA LỖI] ======= POPUP / USER PROFILE NAVIGATION =======
const userName = document.querySelector(".user-name");
const popUp = document.getElementById("overlay-Popup");

// Luôn gắn listener vào .user-name
userName.addEventListener("click", (e) => {
  // Kiểm tra trạng thái đăng nhập MỖI KHI CLICK
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (currentUser) {
    // ĐÃ ĐĂNG NHẬP: Chuyển đến trang profile
    location.hash = "profile";
  } else {
    // CHƯA ĐĂNG NHẬP: Hiển thị popup đăng nhập/đăng ký
    popUp.style.opacity = "1";
    popUp.style.visibility = "visible";
  }
});

// Gắn listener để đóng popup (luôn luôn)
popUp.addEventListener("click", (e) => {
  if (e.target === popUp) {
    popUp.style.visibility = "hidden";
    popUp.style.opacity = "0";
  }
});

//=======Click Option============
const option = document.querySelector(".option");
option.addEventListener("click", (e) => {
  if (!e.target.classList || !e.target.classList.contains("text")) return;
  if (e.target.textContent === "Đăng nhập") {
    location.hash = "login";
  }
  if (e.target.textContent === "Đăng ký") {
    location.hash = "register";
  }

  // Ẩn popup sau khi chọn
  popUp.style.visibility = "hidden";
  popUp.style.opacity = "0";
});

// ======= ẤN MUA SẼ HIỆN TRANG THANH TOÁN-CHI TIẾT=======
function actionsBuy(){
  // Gắn lại sự kiện cho tất cả nút "Mua ngay" mới tạo
    const clickOnProduct = productsGrid.querySelectorAll(".product-card");
    clickOnProduct.forEach((element) => {
      element.addEventListener("click", () => {
        location.hash = "chitiet";
      });
    });
}
const buyNowBtn = document.querySelector(".buy-now-button");
buyNowBtn.addEventListener("click", () => {
  location.hash = "thanhtoan";
});
//POPUP LỌC SẢN PHẨM
  
// **6. Cập nhật lại export (nếu cần)**
// Xóa 'products' khỏi export vì nó không còn tồn tại
export { productsGrid, displayProducts };
// [SỬA LỖI]: Đã xóa dấu '}' thừa ở đây