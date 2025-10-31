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
const products = [
  //iphone
  {
    name: "iPhone 7",
    brand: "iphone",
    price: 32990000,
    img: "/asset/Images/Dienthoai/iphone/iphone-7-pink_32.webp",
  },
  {
    name: "iPhone 11 Pro Max Vàng",
    brand: "iphone",
    price: 19990000,
    img: "/asset/Images/Dienthoai/iphone/iphone-11-pro-max-vang.jpg.webp",
  },
  {
    name: "iPhone 11 Tím",
    brand: "iphone",
    price: 32990000,
    img: "/asset/Images/Dienthoai/iphone/iphone-11-tim.jpg.webp",
  },
  {
    name: "iPhone 12 Pro vàng",
    brand: "iphone",
    price: 32990000,
    img: "../asset/Images/Dienthoai/iphone/iphone-12-pro-vang.jpg.webp",
  },
  {
    name: "iPhone 14 Plus Tím",
    brand: "iphone",
    price: 32990000,
    img: "../asset/Images/Dienthoai/iphone/iphone-14-plus-tim.jpg.webp",
  },
  {
    name: "iPhone 14 Pro Max Đen",
    brand: "iphone",
    price: 32990000,
    img: "../asset/Images/Dienthoai/iphone/iphone-14-pro-max-den-cu.jpg.webp",
  },
  {
    name: "iPhone 14 Pro Tím",
    brand: "iphone",
    price: 32990000,
    img: "../asset/Images/Dienthoai/iphone/iphone-14pro-tim-chinh-thuc.png.webp",
  },
  {
    name: "iPhone 15 vàng",
    brand: "iphone",
    price: 32990000,
    img: "../asset/Images/Dienthoai/iphone/iphone-15-cu-vang.jpg.webp",
  },
  {
    name: "iPhone 15 Plus",
    brand: "iphone",
    price: 32990000,
    img: "../asset/Images/Dienthoai/iphone/iphone-15-plus_1_.webp",
  },
  {
    name: "iPhone 16 Xanh Lam",
    brand: "iphone",
    price: 32990000,
    img: "../asset/Images/Dienthoai/iphone/iphone-16-1.webp",
  },
  {
    name: "iPhone 16 Pro Max",
    brand: "iphone",
    price: 32990000,
    img: "../asset/Images/Dienthoai/iphone/iphone-16-pro-max.webp",
  },
  {
    name: "iPhone 17 Pro Max",
    brand: "iphone",
    price: 32990000,
    img: "../asset/Images/Dienthoai/iphone/iphone-17-pro-max_3.webp",
  },
  //xiaomi
  {
    name: "POCO C71 4G",
    brand: "xiaomi",
    price: 4990000,
    img: "../asset/Images/Dienthoai/xiaomi/dien-thoai-xiaomi-poco-c71_2__1.webp",
  },
  {
    name: "Xiaomi 15 Utra",
    brand: "xiaomi",
    price: 7490000,
    img: "../asset/Images/Dienthoai/xiaomi/dien-thoai-xiaomi-15-ultra.webp",
  },
  {
    name: "POCO X7 Pro 5G",
    brand: "xiaomi",
    price: 7490000,
    img: "../asset/Images/Dienthoai/xiaomi/dien-thoai-poco-x7-pro-5g_1_.webp",
  },
  {
    name: "POCO C75 Xanh lá",
    brand: "xiaomi",
    price: 7490000,
    img: "../asset/Images/Dienthoai/xiaomi/poco-c75-xanh-la.jpg.webp",
  },
  {
    name: "Xiaomi redmi note 11",
    brand: "xiaomi",
    price: 7490000,
    img: "../asset/Images/Dienthoai/xiaomi/xiaomi-redmi-note-11_1.webp",
  },
  //samsung
  {
    name: "Samsung Galaxi A06",
    brand: "samsung",
    price: 28990000,
    img: "../asset/Images/Dienthoai/samsung/dien-thoai-samsung-galaxy-a06_3.webp",
  },
  {
    name: "Samsung Galaxi A06 5G",
    brand: "samsung",
    price: 28990000,
    img: "../asset/Images/Dienthoai/samsung/dien-thoai-samsung-galaxy-a06-5g_1__1.webp",
  },
  {
    name: "Samsung Galaxi A16",
    brand: "samsung",
    price: 28990000,
    img: "../asset/Images/Dienthoai/samsung/dien-thoai-samsung-galaxy-a16_1__3.webp",
  },
  {
    name: "Samsung Galaxi A36",
    brand: "samsung",
    price: 28990000,
    img: "../asset/Images/Dienthoai/samsung/dien-thoai-samsung-galaxy-a36.2.webp",
  },
  {
    name: "Samsung Galaxi A56",
    brand: "samsung",
    price: 8990000,
    img: "../asset/Images/Dienthoai/samsung/dien-thoai-samsung-galaxy-a56.1_1.webp",
  },
  //tablet-samsung
  {
    name: "Samsung Galaxi Tab S10",
    brand: "ipad",
    price: 9999999,
    img: "../asset/Images/Tablet/samsung/may-tinh-bang-samsung-galaxy-tab-s10-fe.1.webp",
  },
  {
    name: "Samsung Galaxi Tab S10 Plus 5G",
    brand: "ipad",
    price: 9999999,
    img: "../asset/Images/Tablet/samsung/may-tinh-bang-samsung-galaxy-tab-s10-plus-5g_2.webp",
  },
  {
    name: "Samsung Galaxi Tab S11 Ultra 4",
    brand: "ipad",
    price: 9999999,
    img: "../asset/Images/Tablet/samsung/may-tinh-bang-samsung-galaxy-tab-s11-ultra-4.webp",
  },
  {
    name: "Samsung Galaxi Tab A11",
    brand: "ipad",
    price: 9999999,
    img: "../asset/Images/Tablet/samsung/samsung_galaxy_tab_a11_wifi_1_1.webp",
  },
  {
    name: "Samsung Galaxi Tab A7 Lite Xám",
    brand: "ipad",
    price: 9999999,
    img: "../asset/Images/Tablet/samsung/samsung-galaxy-tab-a7-lite-gray-600x600_2_1.webp",
  },
  //tablet-xiaomi
  {
    name: "Xiaomi Pad 5 Đen",
    brand: "ipad",
    price: 9999999,
    img: "../asset/Images/Tablet/xiaomi/xiaomi-mi-pad-5-dai-dien-den.jpg.webp",
  },
  {
    name: "Xiaomi Pad 5 Pro Trắng",
    brand: "ipad",
    price: 9999999,
    img: "../asset/Images/Tablet/xiaomi/xiaomi-mi-pad-5-pro-dai-dien-trang.jpg.webp",
  },
  {
    name: "Xiaomi Pad 6 Đen",
    brand: "ipad",
    price: 9999999,
    img: "../asset/Images/Tablet/xiaomi/xiaomi-mi-pad-6-den.jpg.webp",
  },
  {
    name: "Xiaomi Pad 6 Vàng",
    brand: "ipad",
    price: 9999999,
    img: "../asset/Images/Tablet/xiaomi/xiaomi-mi-pad-6-vang.jpg.webp",
  },
  {
    name: "Xiaomi Pad 7 Xám",
    brand: "ipad",
    price: 9999999,
    img: "../asset/Images/Tablet/xiaomi/xiaomi-pad-7-dai-dien.jpg.webp",
  },
];

const productsGrid = document.getElementById("productsGrid");
const viewMoreBtn = document.getElementById("viewMoreBtn");
const brandBtns = document.querySelectorAll(".brand-btn");
let visibleProducts = 6;
let currentBrand = "all";

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
function filterByBrand() {
  if (currentBrand === "all") return [...products];
  return products.filter((p) => p.brand === currentBrand);
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
updateDisplay();

// ======= POPUP =======
const userName = document.querySelector(".user-name");
const popUp = document.getElementById("overlay-Popup");
userName.addEventListener("click", (e) => {
  popUp.style.opacity = "1";
  popUp.style.visibility = "visible";
});
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
 
export { products, productsGrid, displayProducts };
