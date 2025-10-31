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

    // ======== PHÂN LOẠI VAI TRÒ (ROLE) ========
    if (foundUser.role === "admin") {
        // Nếu là admin, chuyển hướng sang trang admin
        window.location.href = 'test.html'; // Chuyển sang trang admin
    } 
    else {
        // Nếu là khách hàng, cập nhật UI và ở lại trang
        const userSpan = document.querySelector(".username");
        userSpan.textContent = foundUser.userName;

        // Tự động chuyển về trang chủ (của khách)
        location.hash = '#home';
    }
}
});
