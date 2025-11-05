// ================== XỬ LÝ ĐĂNG NHẬP ==================
const loginForm = document.querySelector(".login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const warningUser = document.querySelector(".warning-user");
const warningPassword = document.querySelector(".warning-incorrect-password");

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.userName === username && u.password === password);
    
    if (!user) {
        document.querySelector('.warning-user').style.display = 'block';
        return;
    }

    // Kiểm tra xem tài khoản có bị khóa không
    if (user.locked === true) {
        document.querySelector('.warning-user').textContent = 'Tài khoản của bạn đã bị khóa';
        document.querySelector('.warning-user').style.display = 'block';
        return;
    }

    // Nếu không bị khóa thì cho phép đăng nhập
    localStorage.setItem('currentUser', JSON.stringify(user));
    alert('Đăng nhập thành công!');
    window.location.href = '../index.html'; // Chuyển về trang chủ
}

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const users = JSON.parse(localStorage.getItem("users")) || [];

  const foundUser = users.find(
    (u) => u.userName === username || u.email === username
  );

  // Reset cảnh báo mỗi lần submit
  warningUser.style.display = "none";
  warningPassword.style.display = "none";
  usernameInput.style.border = "none";
  passwordInput.style.border = "none";
  
  // ====== Kiểm tra tài khoản tồn tại ======
  if (!foundUser) {
    warningUser.style.display = "block";
    usernameInput.style.border = "1px solid red";
    warningUser.classList.remove("Ierror");
    void warningUser.offsetWidth;
    warningUser.classList.add("Ierror");
    return;
  }

  // ====== Kiểm tra tài khoản có bị khóa không ======
  if (foundUser.locked === true) {
    warningUser.textContent = "Tài khoản đã bị khóa, vui lòng liên hệ Admin";
    warningUser.style.display = "block";
    usernameInput.style.border = "1px solid red";
    warningUser.classList.remove("Ierror");
    void warningUser.offsetWidth;
    warningUser.classList.add("Ierror");
    return;
  }

  // ====== Kiểm tra mật khẩu đúng ======
  if (foundUser.password !== password) {
    warningPassword.style.display = "block";
    passwordInput.style.border = "1px solid red";
    warningPassword.classList.remove("Ierror");
    void warningPassword.offsetWidth;
    warningPassword.classList.add("Ierror");
    return;
  }

  // ====== Đăng nhập thành công ======
  localStorage.setItem("currentUser", JSON.stringify(foundUser));
  const userSpan = document.querySelector(".username");
  userSpan.textContent = foundUser.userName;
  location.hash = "home";
});

// Thêm hàm kiểm tra trạng thái đăng nhập
export function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;

    // Kiểm tra xem tài khoản có bị khóa không
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userInDB = users.find(u => u.userName === currentUser.userName);
    
    if (userInDB && userInDB.locked === true) {
        // Nếu tài khoản bị khóa, đăng xuất user
        localStorage.removeItem('currentUser');
        alert('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin.');
        window.location.href = './login.html';
        return false;
    }

    return true;
}

// Thêm hàm này vào các trang cần bảo vệ
export function protectPage() {
    if (!checkLoginStatus()) {
        window.location.href = './login.html';
    }
}

// Kiểm tra trạng thái đăng nhập khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra nếu user đã đăng nhập
    checkLoginStatus();
    
    // Kiểm tra định kỳ xem tài khoản có bị khóa không
    setInterval(checkLoginStatus, 30000); // Kiểm tra mỗi 30 giây
});
