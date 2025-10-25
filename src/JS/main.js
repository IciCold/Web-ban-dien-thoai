import "./register.js";
import "./login.js";    
import "./Home.js";

//==============Chuyển Page bằng pushState=======================//
const pages = {
  home: document.querySelector('.Home'),
  login: document.querySelector('.page-login'),
  register: document.querySelector('.page-register'),
};
//Ẩn tất cả page 
function hideAll() {
  Object.values(pages).forEach(page => page.classList.add('hidden'));
}
//Hiện page
export function showPage(pageName, push = true) { //export dùng khi hàm được import ở file js khác
  hideAll();
  if (pages[pageName]) {
    pages[pageName].classList.remove('hidden');
    if (push) history.pushState({ page: pageName }, '', `/${pageName}`);
  } else {
    pages.home.classList.remove('hidden');
  }
}
//Quay lại/Tiến tới page
window.onpopstate = (event) => {
  if (event.state && event.state.page) {
    showPage(event.state.page, false);
  } else {
    showPage('home', false);
  }
};
//Load trang mặc định là home
window.addEventListener('load', () => {
  const path = location.pathname.split('/').pop().replace('.html', '') || 'home';
  showPage(path, false);
});
