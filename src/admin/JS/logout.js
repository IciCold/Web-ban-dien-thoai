// Lấy reference đến các elements
const adminLoginButton = document.querySelector(
  ".container-admin .main .login"
);

const adminSpan = document.querySelector(".textUser");
// Tạo các elements cho popup
function createLogoutPopup() {
  // Tạo overlay
  const overlay = document.createElement("div");
  overlay.className = "logout-overlay";

  // Tạo popup
  const popup = document.createElement("div");
  popup.className = "logout-popup";

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
     // Đăng xuất
    localStorage.removeItem("adminLogged"); //xoá trạng thái admin
    location.hash = "login";
}

// Hiển thị popup đăng xuất
function showLogoutPopup() {
  const { overlay, popup } = createLogoutPopup();

  // Hiển thị overlay và popup
  overlay.style.display = "block";
  popup.style.display = "block";

  // Xử lý các nút
  const confirmBtn = popup.querySelector(".confirm-logout");
  const cancelBtn = popup.querySelector(".cancel-logout");

  // Hàm đóng popup
  const closePopup = () => {
    overlay.remove();
    popup.remove();
  };

  // Xử lý sự kiện cho các nút
  confirmBtn.addEventListener("click", () => {
    handleLogout();
    closePopup();
  });

  cancelBtn.addEventListener("click", closePopup);
  overlay.addEventListener("click", closePopup);
}
//click vào nút admin ở trên sẽ đăng xuất
if (adminLoginButton) {
  adminLoginButton.addEventListener("click", () => {
    showLogoutPopup();
  });
}
