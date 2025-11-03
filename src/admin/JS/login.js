// ================== XỬ LÝ ĐĂNG NHẬP ==================
const loginForm = document.querySelector(".login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const warningUser = document.querySelector(".warning-user");
const warningPassword = document.querySelector(".warning-incorrect-password");
const adminSpan = document.querySelector(".textUser");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Reset cảnh báo mỗi lần submit
  warningUser.style.display = "none";
  warningPassword.style.display = "none";
  usernameInput.style.border = "none";
  passwordInput.style.border = "none";

  // Nếu là admin, cho đăng nhập vào
  if (usernameInput.value === "admin" && passwordInput.value === "123") {
    localStorage.setItem("adminLogged", "true"); //Lưu trạng thái đăng nhập của admin
    // --- BỔ SUNG: Cập nhật tên "admin" trên giao diện admin ---
    location.hash = "home"; // Chuyển sang trang admin
    return;
  }
  // ====== Kiểm tra tài khoản tồn tại ======
  else if (usernameInput.value !== "admin") {
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
   else if (passwordInput.value !== "123") {
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
    localStorage.setItem("adminLogged", "true");
    location.hash = "home";
  }
});

// Kiểm tra và hiển thị tên người dùng khi tải trang
function displayUsername() {
  if (adminSpan) {
    adminSpan.textContent = "admin";
  }
}
// Gọi hàm hiển thị username khi trang được tải
window.addEventListener("hashchange", displayUsername);

// Khi tải lại trang, kiểm tra xem admin có đang đăng nhập không
window.addEventListener("load", () => {
  const isAdminLogged = localStorage.getItem("adminLogged");
  if (isAdminLogged === "true" && adminSpan) {
    adminSpan.textContent = "admin";
  }
});
