import "./ds_sanpham.js";
import "./nhaphang.js";
import { loadCustomerList, setupCustomerSearch } from "./ds_khachhang.js";
import { loadStatistics, seedOrderData } from "./thongke.js";
import "./login.js";
import "./logout.js";
import "./ds_donhang.js";
import "./quan_ly_gia.js";
import "./forgot.js";


//==============Chuyển Page bằng Hash=======================//
const pages = {
  login: document.querySelector(".page-login"),
  register: document.querySelector(".page-register"),
  adminPages: document.querySelectorAll(".page-section"),
  admin: document.querySelector(".page-admin"),
  forgot: document.querySelector(".page-forgot"),
};

const adminSpan = document.querySelector(".textUser");
//Hàm hiển thị tên admin-ẩn tên admin
function displayUsername() {
  if (adminSpan) adminSpan.textContent = "admin";
}
function hideUsername() {
  if (adminSpan) adminSpan.textContent = "";
}

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
      page.classList.add("hidden");
      page.classList.remove("page-active", "page-active-enter");
    }
  });
}

//Hiện page
function showPage() {
  const isAdminLogged = localStorage.getItem("adminLogged") === "true"; //lấy trạng thái đăng nhập của admin
  const key = location.hash.replace("#", "") || (isAdminLogged ? "home" : "login"); // nếu đã đăng nhập thì quay về home, không thì quay lại login
  const subPage = document.querySelector(`#${key}`);
  const isAdminSubPage = subPage?.closest(".container-admin");
  const page = pages[key];

  hideAll();
  hideUsername(); //ẩn tên admin trước

  if (isAdminSubPage) {
    if (isAdminLogged) {
      // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP
      pages.admin.classList.remove("hidden");
      subPage.classList.remove("hidden", "page-active-enter");
      subPage.classList.add("page-active");
      requestAnimationFrame(() => {
        subPage.classList.add("page-active-enter");
      });

      displayUsername(); //Hiển thị tên user khi đã an toàn

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
      //TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP
      // -> Đẩy về trang login
      location.hash = "login";
    }
  } else if (page) {
    
    // Nếu ĐÃ đăng nhập mà còn vào trang login -> đẩy về home
    if (key === 'login' && isAdminLogged) {
      location.hash = "home";
      return; // Dừng lại, để hashchange xử lý
    }
    
    // Bình thường: Hiển thị trang login
    page.classList.remove("hidden", "page-active-enter");
    page.classList.add("page-active"); 
    requestAnimationFrame(() => {
      page.classList.add("page-active-enter"); 
    });
  } else {
    // Không tìm thấy trang (hash linh tinh)
    // Đẩy về trang mặc định
    location.hash = isAdminLogged ? "home" : "login";
  }
}

//Quay lại/Tiến tới page
window.addEventListener("hashchange", () => {
  //khi hash thay đổi thì sẽ hiện page tương ứng với nó
  showPage();
});

//Load trang
window.addEventListener("load", () => {
  showPage();
});
