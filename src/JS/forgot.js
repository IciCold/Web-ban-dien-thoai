const formForgot = document.getElementById("form-forgot");
const message = document.querySelector("#forgot .thongbao");

// Xử lý khi người dùng click "Xác nhận" để đổi mật khẩu
document.getElementById("btn-reset").addEventListener("click", () => {
  const email = document.getElementById("forgot-email").value.trim();
  const pw1 = document.getElementById("forgot-password").value.trim();
  const pw2 = document.getElementById("forgot-confirm").value.trim();

  const warningEmail = document.querySelector("#forgot .warning-email");
  const warningPw = document.querySelector("#forgot .warning-pw");

  // Kiểm tra email có tồn tại trong danh sách người dùng không
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex((u) => u.email === email);

  if (userIndex === -1) {
    warningEmail.style.display = "block";  // Nếu không tìm thấy email
    return;
  } else {
    warningEmail.style.display = "none";  // Nếu email tồn tại
  }

  // Kiểm tra mật khẩu nhập lại có trùng khớp không
  if (pw1 === "" || pw1 !== pw2) {
    warningPw.style.display = "block";  // Nếu mật khẩu không khớp
    return;
  } else {
    warningPw.style.display = "none";  // Nếu mật khẩu khớp
  }

  // Cập nhật mật khẩu mới cho người dùng
  users[userIndex].password = pw1;
  localStorage.setItem("users", JSON.stringify(users));  // Lưu lại danh sách người dùng vào localStorage

  // Hiển thị thông báo thành công
  formForgot.classList.add("fade-out");
  setTimeout(() => {
    formForgot.classList.add("hidden");
    message.classList.remove("hidden");
    message.classList.add("fade-in");
  }, 400);

  // Ẩn thông báo và quay lại trang đăng nhập sau 3s
  setTimeout(() => {
    message.classList.remove("fade-in");
    message.classList.add("fade-out");
    setTimeout(() => {
      message.classList.add("hidden");
      formForgot.classList.remove("fade-out", "hidden");
      formForgot.reset();  // Reset form sau khi hoàn thành
      location.hash = "login";  // Quay lại trang đăng nhập
    }, 500);
  }, 2500);
});

// Quay lại trang đăng nhập khi click "Quay lại đăng nhập"
document.getElementById("btn-back-login").addEventListener("click", () => {
  location.hash = "login";  // Quay lại trang đăng nhập
});
