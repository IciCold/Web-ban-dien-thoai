// Lấy reference đến các elements
const userNameDiv = document.querySelector('.user-name');
const userSpan = document.querySelector('.username');

// Tạo các elements cho popup
function createLogoutPopup() {
    // Tạo overlay
    const overlay = document.createElement('div');
    overlay.className = 'logout-overlay';
    
    // Tạo popup
    const popup = document.createElement('div');
    popup.className = 'logout-popup';
    
    // Nội dung popup
    popup.innerHTML = `
        <h2>Xác nhận đăng xuất</h2>
        <p>Bạn có chắc chắn muốn đăng xuất không?</p>
        <div class="buttons">
            <button class="cancel-logout">Hủy</button>
            <button class="confirm-logout">Đăng xuất</button>
        </div>
    `;
    
    // Thêm vào body
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    return { overlay, popup };
}

// Xử lý đăng xuất
function handleLogout() {
    localStorage.removeItem('currentUser');
    userSpan.textContent = 'Đăng nhập';
    // window.location.hash = 'home';
    
    // Đảm bảo trang home được hiển thị
    const homePage = document.querySelector('.Home');
    if (homePage) {
       location.hash = 'home';
    }
    
    // // Ẩn các trang khác
    // const pages = document.querySelectorAll('.page-login, .page-register');
    // pages.forEach(page => {
    //     if (page) {
    //         page.classList.add('hidden');
    //         page.classList.remove('page-active', 'page-active-enter');
    //     }
    // });
}   

// Hiển thị popup đăng xuất
function showLogoutPopup() {
    const { overlay, popup } = createLogoutPopup();
    
    // Hiển thị overlay và popup
    overlay.style.display = 'block';
    popup.style.display = 'block';
    
    // Xử lý các nút
    const confirmBtn = popup.querySelector('.confirm-logout');
    const cancelBtn = popup.querySelector('.cancel-logout');
    
    // Hàm đóng popup
    const closePopup = () => {
        overlay.remove();
        popup.remove();
    };
    
    // Xử lý sự kiện cho các nút
    confirmBtn.addEventListener('click', () => {
        handleLogout();
        closePopup();
        
    });
    
    cancelBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', closePopup);
}

// Xử lý sự kiện click vào username
// NOTE: listener is attached in capture phase so we can intercept the click
// and prevent other handlers from showing the login popup when user is logged in.
function handleUserClick(event) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        // Stop other handlers (which may open the login popup)
        if (event) {
            try { event.stopPropagation(); } catch (e) {}
            try { event.preventDefault(); } catch (e) {}
        }
        showLogoutPopup();
        return;
    }
    // Nếu chưa đăng nhập thì không chặn sự kiện — cho các handler khác xử lý popup đăng nhập
}

// Kiểm tra và hiển thị tên người dùng khi tải trang
function displayUsername() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.userName) {
        userSpan.textContent = currentUser.userName;
    } else {
        userSpan.textContent = 'Đăng nhập';
    }
}

// Thêm event listener cho user-name div
if (userNameDiv) {
    // Use capture phase to intercept clicks before other listeners
    userNameDiv.addEventListener('click', handleUserClick, true);
}

// Gọi hàm hiển thị username khi trang được tải
window.addEventListener('load', displayUsername);

// --- BỔ SUNG: XỬ LÝ ĐĂNG XUẤT CHO ADMIN ---
const adminLoginButton = document.querySelector(".admin .main .login");

if (adminLoginButton) {
  adminLoginButton.addEventListener("click", () => {
    const adminSpan = adminLoginButton.querySelector("span");

    // Chỉ thực hiện đăng xuất nếu đang đăng nhập (tên là "admin")
    if (adminSpan && adminSpan.textContent === "admin") {
      // 1. Đặt lại văn bản thành "Đăng nhập"
      adminSpan.textContent = "Đăng nhập";
      
      // 2. Chuyển hướng về trang chủ của khách
      location.hash = "home";
    }
  });
}