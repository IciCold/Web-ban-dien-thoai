// Carousel Logic
const carousel = document.getElementById("carousel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const indicators = document.querySelectorAll(".indicator");
let currentSlide = 0;
let slideInterval;
const slideCount = document.querySelectorAll(".carousel-slide").length;

// ... (Toàn bộ code Carousel của bạn giữ nguyên)...
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
// PHẦN LOGIC SẢN PHẨM
// ===================================================

let allProducts = [];
const productsGrid = document.getElementById("productsGrid");
const viewMoreBtn = document.getElementById("viewMoreBtn");
const logo = document.querySelector(".logo");

let visibleProducts = 8; // Số sản phẩm hiển thị ban đầu
let currentFilteredList = []; // Lưu trữ danh sách đã lọc cho nút "Xem thêm"

if(logo){
  logo.addEventListener("click",e =>{
    location.reload();
  })
}

// Hàm reset số lượng sản phẩm (để LocSanPham.js gọi)
export function resetVisibleProducts() {
  visibleProducts = 8;
}

async function loadProducts() {
  try {
    // 1. Tải tệp JSON
    const response = await fetch("../asset/data/dienthoai.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonProducts = await response.json();

    // 2. Tải dữ liệu từ localStorage
    const savedProductsRaw = localStorage.getItem("datalist");
    const localProducts = savedProductsRaw ? JSON.parse(savedProductsRaw) : [];

    // 3. Gộp hai nguồn dữ liệu
    const allData = [...localProducts];
    const localIds = new Set(localProducts.map(p => p.id));

    // 4. Thêm dữ liệu từ JSON nếu ID chưa tồn tại
    jsonProducts.forEach(sp => {
      const adminId = sp.id.toString().startsWith("S") ? sp.id : "S" + String(sp.id).padStart(3, "0");
      
      if (!localIds.has(adminId)) {
        allData.push({
            ...sp,
            id: adminId
        });
      }
    });

    // 5. Ánh xạ (map) dữ liệu TỔNG HỢP sang định dạng chuẩn
    allProducts = allData.map(item => {
      let effectiveBrand = item.brand || item.thuonghieu;
      if (item.loai === 'Tablet') {
        effectiveBrand = 'ipad';
      }
      return {
        ...item,
        name: item.ten || item.tensp,
        price: item.gia,
        img: item.src || item.anh,
        brand: effectiveBrand.toLowerCase(),
        ten: item.ten || item.tensp,
        src: item.src || item.anh,
        bo_nho: item.bo_nho || item.memory,
        mau_sac: item.mau_sac || item.color,
        dung_luong_pin: item.dung_luong_pin || item.battery
      };
    });

    // 6. Hiển thị lần đầu (hiển thị tất cả sản phẩm)
    displayProducts(allProducts);

  } catch (error) {
    console.error("Không thể tải sản phẩm:", error);
    productsGrid.innerHTML = "<p>Lỗi khi tải sản phẩm. Vui lòng thử lại.</p>";
  }
}
// ======= HIỂN THỊ SẢN PHẨM =======
// Hàm này giờ sẽ được gọi từ cả Home.js (lần đầu) và LocSanPham.js (khi lọc)
export function displayProducts(list) {
  // 1. Lưu lại danh sách đã lọc để "Xem thêm" có thể dùng
  currentFilteredList = list;
  
  // 2. Xóa nội dung cũ
  productsGrid.innerHTML = "";

  // 3. Cắt danh sách theo số lượng `visibleProducts`
  const shown = list.slice(0, visibleProducts);
  
  // 4. Hiển thị
  shown.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.id = product.id;
    card.innerHTML = `
                    <img src="${product.img}" alt="${product.name}">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price.toLocaleString()} VND</div>
                    <button class="buy-btn">Mua ngay</button>
                `;
    productsGrid.appendChild(card);
  });
  
  // 5. Gắn lại sự kiện cho các card sản phẩm
  actionsBuy();
  
  // 6. Ẩn/hiện nút "Xem thêm"
  viewMoreBtn.style.display = visibleProducts >= list.length ? "none" : "block";
}


// ======= NÚT XEM THÊM =======
viewMoreBtn.addEventListener("click", () => {
  visibleProducts += 4; // Tăng số lượng
  displayProducts(currentFilteredList); // Vẽ lại từ danh sách đã lọc
});

// ======= KHỞI TẠO =======
loadProducts(); // Bắt đầu tải dữ liệu

// ===================================================
// PHẦN LOGIC POPUP VÀ CHUYỂN TRANG
// ===================================================

// ... (Phần code này của bạn đã chính xác, giữ nguyên) ...
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
  
// **6. Cập nhật lại export**
export { allProducts, productsGrid };