import "./ds_sanpham.js";
import { loadCustomerList, setupCustomerSearch } from "./ds_khachhang.js";
import { loadStatistics, seedOrderData } from "./thongke.js";
import "./login.js";
import "./logout.js";
import "./ds_donhang.js";

//==============Chuyển Page bằng Hash=======================//
const pages = {
  login: document.querySelector(".page-login"),
  register: document.querySelector(".page-register"),
  adminPages: document.querySelectorAll(".page-section"),
  admin: document.querySelector(".page-admin"),
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
    } else if (page) {
      // THÊM: Kiểm tra page có tồn tại
      page.classList.add("hidden");
      page.classList.remove("page-active", "page-active-enter");
    }
  });
}

//Hiện page
function showPage() {
  const key = location.hash.replace("#", "") || "home";
  const subPage = document.querySelector(`#${key}`);
  const isAdminSubPage = subPage?.closest(".container-admin");
  const page = pages[key];

  hideAll();

  if (subPage && isAdminSubPage) {
    pages.admin.classList.remove("hidden");
    subPage.classList.remove("hidden", "page-active-enter");
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
      if (subPage.id === "ds_donHang") {
        // loadOrderList(); // Nếu có
      }
      if (subPage.id === "thongKe") {
        console.log("Loading statistics data...");
        seedOrderData();
        loadStatistics();
      }
    }, 100);
  } else {
    // XỬ LÝ CÁC PAGE THÔNG THƯỜNG
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
  }
}

//Quay lại/Tiến tới page
window.addEventListener("hashchange", () => {
  //khi hash thay đổi thì sẽ hiện page tương ứng với nó
  showPage();
});

//Load trang
window.addEventListener("load", () => {
  const isAdminLogged = localStorage.getItem("adminLogged") === "true";
  if (isAdminLogged) {
    location.hash = "home";
  } else {
    location.hash = "login";
  }
  showPage();
});
