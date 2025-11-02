import "./register.js";
import "./login.js";
import "./Home.js";
import "./search.js";
import "./thanhtoan.js";
import "./logout.js";
import "./cart.js";
import "./LocSanPham.js";
import { loadCustomerList, setupCustomerSearch } from "./ds_khachhang.js";
import { loadStatistics, seedOrderData } from './thongke.js';
import { initProfilePage } from "./profile.js";
import { initChiTietPage } from "./chitiet.js"; // (THÊM) Import file chi tiết

//==============Chuyển Page bằng Hash=======================//
const pages = {
  home: document.querySelector(".Home"),
  login: document.querySelector(".page-login"),
  register: document.querySelector(".page-register"),
  thanhtoan: document.querySelector(".payment-section"),
  chitiet: document.querySelector(".product-section"),
  admin: document.querySelector(".admin"),
  adminPages: document.querySelectorAll(".page-section"),
  profile: document.querySelector(".page-profile")
};

//Ẩn tất cả page
function hideAll() {
  Object.values(pages).forEach((page) => {
    // Nếu là NodeList (nhiều phần tử)
    if (page instanceof NodeList) {
      page.forEach((el) => {
        el.classList.add("hidden");
        el.classList.remove("page-active", "page-active-enter");
      });
    } else if (page) { // ✅ THÊM: Kiểm tra page có tồn tại
      page.classList.add("hidden");
      page.classList.remove("page-active", "page-active-enter");
    }
  });
}

//Hiện page
function showPage() {
  const key = location.hash.replace("#", "") || "home";
  const subPage = document.querySelector(`#${key}`);
  const isAdminSubPage = subPage?.closest(".admin");
  const page = pages[key] || pages.home;

  hideAll();
  
  
  // Nếu là admin thì bật riêng trang admin
  // Nếu là admin hoặc page con của admin
  if (key === "admin" || isAdminSubPage) {
    document.body.classList.add("no-header-footer");
    
    // Hiển thị container admin
    if (pages.admin) {
      pages.admin.classList.remove("hidden","page-active-enter");
      pages.admin.classList.add("page-active");
      requestAnimationFrame(() => {
        pages.admin.classList.add("page-active-enter"); // opacity: 1
      });
    }
    
    // Hiển thị page con cụ thể
    if (subPage && isAdminSubPage) {
      subPage.classList.remove("hidden","page-active-enter");
      subPage.classList.add("page-active");
      requestAnimationFrame(() => {
        subPage.classList.add("page-active-enter");
      });
      
      // Load dữ liệu khi trang con admin được hiển thị
      setTimeout(() => {
        if (subPage.id === "ds_khachHang") {
          console.log("Đang load danh sách khách hàng...");
          loadCustomerList();
          setupCustomerSearch();
        }
        if (subPage.id === "ds_sanPham") {
          // loadProductList(); // Nếu có
        }
        if (subPage.id === "ds_donHang") {
          // loadOrderList(); // Nếu có
        }
        if (subPage.id === "thongKe") {
          console.log("Loading statistics data...");
          seedOrderData();
          loadStatistics();
        }
      }, 100);
    }
    
  } else {
    // ✅ XỬ LÝ CÁC PAGE THÔNG THƯỜNG
    document.body.classList.remove("no-header-footer");
    if (!page) {
      console.log("Không tìm thấy page");
      return;
    }
    page.classList.remove("hidden", "page-active-enter");
    // Bắt đầu hiệu ứng fade-in
    page.classList.add("page-active"); // opacity: 0

    // Chờ 1 frame để trình duyệt áp dụng CSS transition
    requestAnimationFrame(() => {
      page.classList.add("page-active-enter"); // opacity: 1
    });

    // ===================================
    // --- (SỬA Ở ĐÂY) ---
    // ===================================
    // Gọi hàm khởi tạo của trang profile
    if (key === "profile") {
        initProfilePage();
    }
    // (THÊM) Gọi hàm khởi tạo của trang chi tiết
    if (key === "chitiet") {
        initChiTietPage();
    }
    // ===================================
    // --- (KẾT THÚC SỬA) ---
    // ===================================
  }
}

//Quay lại/Tiến tới page
window.addEventListener("hashchange", () => {
  //khi hash thay đổi thì sẽ hiện page tương ứng với nó
  showPage();
});

//Load trang
window.addEventListener("load", () => {
  const hash = location.hash || "home";
  console.log("hash hiện tại là ", hash);
  showPage();
});