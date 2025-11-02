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
const logo = document.querySelector(".logo");
let visibleProducts = 8;
let currentBrand = "all";
let minPrice = 0;
let maxPrice = Infinity;
// đọc sản phẩm từ json và localstorage

if(logo){
  logo.addEventListener("click",e =>{
    location.reload();
  })
}

async function loadProducts() {
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
    // Ưu tiên dữ liệu từ localStorage (localProducts)
    const allData = [...localProducts];
    const localIds = new Set(localProducts.map(p => p.id));

    // 4. Thêm dữ liệu từ JSON nếu ID chưa tồn tại trong localStorage
    jsonProducts.forEach(sp => {
      // Chuẩn hóa ID từ JSON (nếu cần) để khớp với format "S001"
      const adminId = sp.id.toString().startsWith("S") ? sp.id : "S" + String(sp.id).padStart(3, "0");
      
      if (!localIds.has(adminId)) {
        // Chỉ thêm sản phẩm từ JSON nếu nó chưa có trong danh sách của admin
        allData.push({
            ...sp, // Giữ tất cả: cpu, camera, group_id, v.v.
            id: adminId // Đảm bảo ID đã chuẩn hóa
        });
      }
    });

    // 5. Quan trọng: Ánh xạ (map) dữ liệu TỔNG HỢP sang định dạng mà code của bạn mong đợi
    // Code này sẽ chuẩn hóa các tên trường (ví dụ: 'tensp' và 'ten' -> 'name')
    allProducts = allData.map(item => {
      let effectiveBrand = item.brand || item.thuonghieu; // Lấy brand (từ JSON) hoặc thuonghieu (từ admin)
      if (item.loai === 'Tablet') {
        effectiveBrand = 'ipad';
      }

      // Giữ lại toàn bộ dữ liệu gốc (item) để chuyển sang trang chi tiết
      // và thêm các trường đã chuẩn hóa (name, price, img) để hiển thị
      return {
        ...item, // Giữ tất cả: id, cpu, camera, ram, battery, memory, color, group_id, v.v.
        
        // Chuẩn hóa cho Home.js hiển thị
        name: item.ten || item.tensp,         // Lấy 'ten' (JSON) hoặc 'tensp' (admin)
        price: item.gia,                      // 'gia' (cả hai đều có)
        img: item.src || item.anh,            // Lấy 'src' (JSON) hoặc 'anh' (admin)

        // Chuẩn hóa trường brand
        brand: effectiveBrand.toLowerCase(),
        
        // Chuẩn hóa các trường chi tiết (để chitiet.js dễ sử dụng)
        ten: item.ten || item.tensp,
        src: item.src || item.anh,
        bo_nho: item.bo_nho || item.memory,
        mau_sac: item.mau_sac || item.color,
        dung_luong_pin: item.dung_luong_pin || item.battery
      };
    });

    // 6. Sau khi tải và xử lý xong, gọi hàm hiển thị lần đầu
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
    card.dataset.id = product.id; // (THÊM) Thêm ID vào data-attribute
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
    visibleProducts = 8;
    updateDisplay();
  });
});

// ======= NÚT XEM THÊM =======
viewMoreBtn.addEventListener("click", () => {
  visibleProducts += 4;
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

// (SỬA) ======= ẤN VÀO SẢN PHẨM SẼ LƯU ID VÀ CHUYỂN TRANG=======
function actionsBuy(){
  // Gắn lại sự kiện cho tất cả card sản phẩm mới tạo
    const clickOnProduct = productsGrid.querySelectorAll(".product-card");
    clickOnProduct.forEach((card) => {
      card.addEventListener("click", (e) => {
        // Ngăn việc click vào nút "Mua ngay" cũng kích hoạt
        if (e.target.classList.contains('buy-btn')) {
            // Xử lý logic thêm vào giỏ hàng ở đây nếu muốn
            console.log("Thêm vào giỏ hàng (chưa làm)");
            e.stopPropagation(); // Ngăn sự kiện nổi bọt lên card
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
// (XÓA) Xóa bỏ listener bị sai
// const buyNowBtn = document.querySelector(".buy-now-button");
// buyNowBtn.addEventListener("click", () => {
//   location.hash = "thanhtoan";
// });

//POPUP LỌC SẢN PHẨM
  
// **6. Cập nhật lại export (nếu cần)**
// Xóa 'products' khỏi export vì nó không còn tồn tại
export { allProducts, productsGrid, displayProducts };
// [SỬA LỖI]: Đã xóa dấu '}' thừa ở đây