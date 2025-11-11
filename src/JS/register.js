const registerLink = document.querySelector(".register-link");
const loginDiv = document.querySelector("#login");
const registerDiv = document.querySelector("#register");
const form = document.getElementById("form-register");
let users = JSON.parse(localStorage.getItem("users")) || []; //lấy lại dữ liệu cũ từ localStorage, nếu không có tạo 1 mãng rỗng
// Nếu thiếu phần tử nào thì dừng để tránh lỗi runtime
if (!(!form || !registerLink || !loginDiv || !registerDiv)) {
  console.log("object");
}
//Chuyển page khi ấn vào nút đăng ký phía dưới
registerLink.addEventListener("click", (e) => {
  e.preventDefault();
  form.reset(); // reset lại các ô input
  location.hash = 'register'
  form.classList.remove("hidden"); // Thêm dòng này xoá hidden khi đăng ký thành công ở phía dưới
  form.classList.remove("fade-out"); //  để tránh bị mờ khi quay lại
});


// ================= Lưu thông tin User =================
function register(email, userName, password) {
  let newUser = {
    email: email,
    userName: userName,
    password: password,
    registrationDate: new Date().toLocaleDateString('vi-VN'), // THÊM DÒNG NÀY
    bankingList: [],
    addressList: [],
    locked: false,
  };
  users.push(newUser);
  //lưu lại vào localStorage
  localStorage.setItem("users", JSON.stringify(users)); //chuyển mảng thành chuỗi
}

// =======Sử lí dữ liệu form đăng ký==========
form.addEventListener("submit", function (event) {
  event.preventDefault();
  let complete = true;
  const email = form.email.value.trim();
  const userName = form.username.value.trim();
  const password = form.password.value.trim();
  const inputs = document.querySelectorAll(".register-Ip");
  const isEmpty = new Array(inputs.length).fill(false);
  // =============Báo lỗi nhập input cho người dùng===============
  inputs.forEach((input, index) => {
    if (input.value.trim() === "") {
      input.classList.remove("Ierror");
      void input.offsetWidth; //bắt trình duyệt tính lại layout(restart)
      input.classList.add("Ierror");
    } else {
      isEmpty[index] = true;
      input.classList.remove("Ierror");
    }
  });

// ================= Kiểm tra email =================
  const CheckEmail = document.querySelector("#register .warning-email");
  const CheckUser = document.querySelector("#register .warning-user");
  const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/; //kiểm tra định dạng của gmail

  // 1. Kiểm tra xem email& tài khoản đã tồn tại chưa
  const emailExists = users.some(user => user.email === email);
  const userNameExists = users.some(user => user.userName === userName);

  if(userNameExists){
    complete = false;
    CheckUser.textContent = "Tài khoản đã tồn tại."; // Cập nhật nội dung lỗi
    CheckUser.style.display = "block";
    form.username.style.border = "1px solid red";
    //restart trình duyệt
    CheckUser.classList.remove("Ierror");
    void CheckUser.offsetWidth;
    CheckUser.classList.add("Ierror");
  }
    else {
    CheckUser.classList.remove("Ierror");
    CheckUser.style.display = "none";
    form.username.style.border = "none";
  }

  if (emailExists) {
    complete = false;
    CheckEmail.textContent = "Email này đã được sử dụng."; // Cập nhật nội dung lỗi
    CheckEmail.style.display = "block";
    form.email.style.border = "1px solid red";
    //restart trình duyệt
    CheckEmail.classList.remove("Ierror");
    void CheckEmail.offsetWidth;
    CheckEmail.classList.add("Ierror");
  }
  // 2. Kiểm tra định dạng email (nếu nó chưa tồn tại)
  else if (!emailRegex.test(email) && email !== "" && CheckEmail) {
    complete = false;
    CheckEmail.textContent = "Định dạng email không hợp lệ."; // Cập nhật nội dung lỗi
    CheckEmail.style.display = "block";
    form.email.style.border = "1px solid red";
    //restart trình duyệt
    CheckEmail.classList.remove("Ierror");
    void CheckEmail.offsetWidth;
    CheckEmail.classList.add("Ierror");
  }
  // 3. Nếu mọi thứ OK
  else {
    CheckEmail.classList.remove("Ierror");
    CheckEmail.style.display = "none";
    form.email.style.border = "none";
  }
  //Kiểm tra password
  const comfirmPw = form.confirmPw.value;
  const cfPassword = document.querySelector("#register .warning-pw");
  if (password != comfirmPw && cfPassword) {
    complete = false;
    cfPassword.style.display = "block";
    form.confirmPw.style.border = "1px solid red";
    //restart trình duyệt
    cfPassword.classList.remove("Ierror");
    void cfPassword.offsetWidth;
    cfPassword.classList.add("Ierror");
  } else {
    cfPassword.classList.remove("Ierror");
    cfPassword.style.display = "none";
    form.confirmPw.style.border = "none";
  }

  // Hiện thông báo đăng ký thành công
  const message = document.querySelector("#register .thongbao");
  console.log(complete);
  console.log(isEmpty);
  if (complete && !isEmpty.includes(false)) {
    register(email, userName, password);
    // Ẩn form, hiển thị thông báo
    form.classList.add("fade-out");
    setTimeout(() => {
      form.classList.add("hidden");
      if (message) {
        message.classList.remove("hidden");

        // đảm bảo animation bắt đầu
        setTimeout(() => message.classList.add("fade-in"), 10);
      }
    }, 400);
    // Sau 3s -> ẩn thông báo -> hiện login
    setTimeout(() => {
      message.classList.remove("fade-in"); //xoá nếu trước đó đã có fade-in
      message.classList.add("fade-out");

      // Đợi hiệu ứng mờ hoàn tất rồi mới ẩn hẳn
      setTimeout(() => {
        message.classList.add("hidden");
        location.hash = "login";
        form.classList.remove("fade-out");
      }, 500); // thời gian này phải khớp với thời gian của animation của CSS
    }, 3000);
  }
});