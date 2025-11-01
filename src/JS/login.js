// ================== XỬ LÝ ĐĂNG NHẬP ==================
const loginForm = document.querySelector(".login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const warningUser = document.querySelector(".warning-user");
const warningPassword = document.querySelector(".warning-incorrect-password");

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
  // Nếu là admin, chuyển hướng sang trang admin
  if (usernameInput.value === "admin" && passwordInput.value === "123") {
    const footer = document.querySelector('.footer');
    const header = document.querySelector('.header');
    // --- BỔ SUNG: Cập nhật tên "admin" trên giao diện admin ---
    const adminUsernameSpan = document.querySelector(".admin .main .login span");
    if (adminUsernameSpan) {
      adminUsernameSpan.textContent = "admin";
    }
    location.hash ='admin' // Chuyển sang trang admin
    return;
  }
  // ====== Kiểm tra tài khoản tồn tại ======
  if (!foundUser) {
    // Hiện thông báo lỗi "Tài khoản không tồn tại"
    warningUser.style.display = "block";
    usernameInput.style.border = "1px solid red";

    // Restart animation
    warningUser.classList.remove("Ierror");
    void warningUser.offsetWidth;
    warningUser.classList.add("Ierror");
    return;
  }

  // ====== Kiểm tra mật khẩu đúng ======
  if (foundUser.password !== password) {
    warningPassword.style.display = "block";
    passwordInput.style.border = "1px solid red";

    // Restart animation (hiệu ứng rung lại)
    warningPassword.classList.remove("Ierror");
    void warningPassword.offsetWidth;
    warningPassword.classList.add("Ierror");
    return;
  }
  // ====== Đăng nhập thành công ======
  else {
    // Lưu user đang đăng nhập
    localStorage.setItem("currentUser", JSON.stringify(foundUser));

    // Nếu là khách hàng, cập nhật UI và ở lại trang
    const userSpan = document.querySelector(".username");
    userSpan.textContent = foundUser.userName;

    // Tự động chuyển về trang chủ (của khách)
    location.hash = "home";
  }
});

// ================== KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP KHI TẢI TRANG ==================
function checkLoginStatus() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userSpan = document.querySelector(".username"); // Lấy thẻ span từ header

  if (currentUser && userSpan) {
    userSpan.textContent = currentUser.userName;
  } else if (userSpan) {
    userSpan.textContent = "Đăng nhập";
  }
}

// Gọi hàm này ngay khi file login.js được tải
checkLoginStatus();