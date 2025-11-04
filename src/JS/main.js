import "./register.js";
import "./login.js";
import "./Home.js";
import "./search.js";
import "./thanhtoan.js";
import "./logout.js";
import "./cart.js";
import "./LocSanPham.js";
import { initProfilePage } from "./profile.js";
import { initChiTietPage } from "./chitiet.js"; // (THÊM) Import file chi tiết
import { initCartDetailPage } from './cart-page.js';
import { initThanhToanPage } from "./thanhtoan.js"; 

//==============Chuyển Page bằng Hash=======================//
const pages = {
  home: document.querySelector(".Home"),
  login: document.querySelector(".page-login"),
  register: document.querySelector(".page-register"),
  thanhtoan: document.querySelector(".payment-section"),
  chitiet: document.querySelector(".product-section"),
  profile: document.querySelector(".page-profile"),
  cartDetailPage: document.getElementById("cartDetailPage")
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
    } else if (page) { // THÊM: Kiểm tra page có tồn tại
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
    // XỬ LÝ CÁC PAGE THÔNG THƯỜNG
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

    // Gọi hàm khởi tạo của trang profile
    if (key === "profile") {
        initProfilePage();
    }
    // (THÊM) Gọi hàm khởi tạo của trang chi tiết
    if (key === "chitiet") {
        initChiTietPage();
    }

    if(key === "cartDetailPage"){
      initCartDetailPage();
    }
    if(key==="thanhtoan"){
      initThanhToanPage();
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