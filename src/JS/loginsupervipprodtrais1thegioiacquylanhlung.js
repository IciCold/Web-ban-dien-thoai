//==========Chuyển page===============
const registerLink = document.querySelector(".register-link");
const loginDiv = document.getElementById("login");
const registerDiv = document.getElementById("register");

registerLink.addEventListener("click", (e) => {
  e.preventDefault();
  form.reset(); // reset lại các ô input
  loginDiv.style.display = "none";
  registerDiv.style.display = "block";
  form.classList.remove("hidden"); // Thêm dòng này xoá hidden khi đăng ký thành công ở phía dưới
  form.classList.remove("fade-out"); //  để tránh bị mờ khi quay lại
  history.replaceState({ page: "Register" }, "", "#Register");
});

// Khi tải lại trang hoặc mở link trực tiếp có hash MẶC ĐỊNH LÀ LOGIN
window.addEventListener("load", () => {
  if (location.hash === "#register") {
    loginDiv.style.display = "none";
    registerDiv.style.display = "block";
  } else {
    registerDiv.style.display = "none";
    loginDiv.style.display = "block";
    history.replaceState({ page: "login" }, "", "#login");
  }
});
//Sử lí back/forward
window.onpopstate = (e) => {
  if (location.hash === "#Register") {
    loginDiv.style.display = "none";
    registerDiv.style.display = "block";
  } else {
    registerDiv.style.display = "none";
    loginDiv.style.display = "block";
  }
};

// ================= Lưu thông tin User =================
function register(email, userName, password) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let newUser = {
    email: email,
    userName: userName,
    password: password,
  };
  users.push(newUser);
  //lưu lại vào localStorage
  localStorage.setItem("users", JSON.stringify(users)); //chuyển mảng thành chuỗi
  console.log(users);
}

// =======Sử lí dữ liệu form đăng ký==========
const form = document.getElementById("form-register");
let users = [];
form.addEventListener("submit", function (event) {
  event.preventDefault();
  let complete = true;
  const email = form.email.value;
  const userName = form.username.value;
  const password = form.password.value;
  const inputs = document.querySelectorAll(".Ip");
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

// / ================= Kiểm tra email =================
    const CheckEmail = document.querySelector('.warning-email');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|outlook\.com)$/; //kiểm tra định dạng của gmail

    if(!emailRegex.test(email) && email !=''){
      complete = false;
      CheckEmail.style.display = "block";
      form.email.style.border = "1px solid red";
      //restart trình duyệt
      CheckEmail.classList.remove("Ierror");
      void CheckEmail.offsetWidth;
      CheckEmail.classList.add("Ierror");
    } else {
      CheckEmail.classList.remove("Ierror");
      CheckEmail.style.display = "none";
      form.email.style.border = "none";
    }
  
    //Kiểm tra password
    const comfirmPw = form.confirmPw.value;
    const cfPassword = document.querySelector(".warning-pw");
    if (password != comfirmPw) {
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
  

  //Hiện thông báo đăng ký thành công
  if (complete && !isEmpty.includes(false)) {
    register(email, userName, password);
    const message = document.querySelector(".thongbao");
    form.classList.add("fade-out");
    setTimeout(() => {
      form.classList.add("hidden");
      message.classList.remove("hidden");
      setTimeout(() => {
        message.style.opacity = "1";
      }, 10);
    }, 400);
    setTimeout(() => {
      message.style.removeProperty(
        "opacity"
      ); /*xoá dòng inline style "message.style.opacity = "1" */
      message.classList.add("fade-out");
      loginDiv.classList.add("fade-out","fade-in");
      loginDiv.style.display = "block";
      history.replaceState({ page: "login" }, "", "#login");
    }, 3000);
  }
});

