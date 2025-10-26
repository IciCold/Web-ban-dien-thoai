import "./register.js";
import "./login.js";    
import "./Home.js";

//==============Chuyển Page bằng Hase=======================//
const pages = {
  home: document.querySelector('.Home'),
  login: document.querySelector('.page-login'),
  register: document.querySelector('.page-register'),
};
//Ẩn tất cả page 
function hideAll() {
  Object.values(pages).forEach(page => {
    page.classList.add('hidden',);
    page.classList.remove('page-active', 'page-active-enter');
  });
}
//Hiện page
function showPage() {
  
  hideAll();
  const key = location.hash.replace("#", "") || "home";
  const page = pages[key] || pages.home;
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
  showPage(location.hash);
})

//Load trang 
window.addEventListener('load', () => {
 const hash = location.hash ||'home';
 console.log('hash hiện tại là', hash);
 showPage(hash)
});
