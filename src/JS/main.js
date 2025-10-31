import "./register.js";
import "./login.js";    
import "./Home.js";
import "./search.js";
import "./thanhtoan.js";
import "./logout.js";
import "./cart.js";

//==============Chuyển Page bằng Hash=======================//
const pages = {
  home: document.querySelector('.Home'),
  login: document.querySelector('.page-login'),
  register: document.querySelector('.page-register'),
  thanhtoan: document.querySelector('.payment-section'),
  chitiet: document.querySelector('.product-section'),
};
//Ẩn tất cả page 
function hideAll() {
  Object.values(pages).forEach((page) => {
    if (page) {
      page.classList.add("hidden");
      page.classList.remove("page-active", "page-active-enter");
    }
  });
}
//Hiện page
function showPage() {
  hideAll();
  const key = location.hash.replace("#", "") || "home";
  const page = pages[key] || pages.home;
  console.log(pages[key]);
  if(!page){
    console.log('Không tìm thấy page'); return;
  }
  page.classList.remove('hidden','active');
  // Bắt đầu hiệu ứng fade-in
  page.classList.add('page-active'); // opacity: 0

  // Chờ 1 frame để trình duyệt áp dụng CSS transition
  requestAnimationFrame(() => {
    page.classList.add('page-active-enter'); // opacity: 1
  });
}

//Quay lại/Tiến tới page
window.addEventListener('hashchange',() => { //khi hash thay đổi thì sẽ hiện page tương ứng với nó
  showPage();
})

//Load trang 
window.addEventListener('load', () => {
 const hash = location.hash ||'home';
 console.log('hash hiện tại là', hash);
 showPage();
});

