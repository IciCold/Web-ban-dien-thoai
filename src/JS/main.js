import "./register.js";
import "./login.js";
import "./forgot.js"
import "./Home.js";
import "./search.js";
import "./thanhtoan.js";
import "./logout.js";
import "./cart.js";
import "./LocSanPham.js";
import "./alert.js";
import { initProfilePage } from "./profile.js";
import { initChiTietPage } from "./chitiet.js";
import { initCartDetailPage } from "./cart-page.js";
import { initThanhToanPage } from "./thanhtoan.js";
import { renderData, renderUser } from "./autoRender.js";
import { docdulieuLocalStorage } from "./readandwrite.js";

//==============Chuyển Page bằng Hash=======================//
const pages = {
  home: document.querySelector(".Home"),
  login: document.querySelector(".page-login"),
  forgot:document.querySelector(".page-forgot"),
  register: document.querySelector(".page-register"),
  thanhtoan: document.querySelector(".payment-section"),
  chitiet: document.querySelector(".product-section"),
  profile: document.querySelector(".page-profile"),
  cartDetailPage: document.getElementById("cartDetailPage"),
  

};

//Ẩn tất cả page
function hideAll() {
  Object.values(pages).forEach((page) => {
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
  const fullHash = location.hash.replace("#", "") || "home";

  // Tách key chính và sub-route (nếu có)
  // "profile", "banking", "address" đều thuộc page profile
  const key = getMainPageKey(fullHash);
  const page = pages[key] || pages.home;

  hideAll();

  if (!page) {
    console.log("Không tìm thấy page");
    return;
  }

  page.classList.remove("hidden", "page-active-enter");
  page.classList.add("page-active");

  requestAnimationFrame(() => {
    page.classList.add("page-active-enter");
  });

  // Gọi hàm khởi tạo của trang tương ứng
  if (key === "profile") {
    initProfilePage();
  } else if (key === "chitiet") {
    initChiTietPage();
  } else if (key === "cartDetailPage") {
    initCartDetailPage();
  } else if (key === "thanhtoan") {
    initThanhToanPage();
  }
}

/**
 * Xác định page chính từ hash
 * banking, address -> profile
 * Các hash khác giữ nguyên
 */
function getMainPageKey(hash) {
  // Danh sách sub-routes của profile
  const profileSubRoutes = ["banking", "address", "history", "changepw"];
  if (profileSubRoutes.includes(hash)) {
    return "profile";
  }
  //nếu không phải banking và address thì chả về hash và được sử dụng ở trên
  return hash || "home";
}

//Quay lại/Tiến tới page
window.addEventListener("hashchange", () => {
  showPage();
});

//Load trang
window.addEventListener("load", () => {
  const hash = location.hash || "home";
  console.log("hash hiện tại là ", hash);
  showPage();
});

//==============Cập nhật lại trang page=======================//
window.addEventListener("storage", (e) => {
  //Cập nhật lại sản phẩm
  if (e.key === "dataProducts") renderData();

  // Chỉ kiểm tra trạng thái khóa tài khoản nếu user đã đăng nhập
  if (e.key === "users") {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser){
      renderUser();
    }
  }
});
