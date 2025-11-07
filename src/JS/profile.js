// ===================================
// --- IMPORT HÀM ĐỌC/GHI ---
// ===================================
import {
  docdulieuLocalStorage,
  ghidulieuLocalStorage,
} from "./readandwrite.js";
import { showalert } from "./alert.js";
// ===================================
// --- KHAI BÁO BIẾN DOM (Global) ---
// (Tất cả các biến được đưa ra ngoài để chỉ được khai báo 1 lần)
// ===================================

// --- Sidebar & Views ---
const navProfile = document.getElementById("nav-profile-link");
const navBanking = document.getElementById("nav-banking-link");
const navAddress = document.getElementById("nav-address-link");
const navHistory = document.getElementById("nav-history-link");
const navChangePw = document.getElementById("nav-changePw-link");
const profileView = document.getElementById("profile-view");
const bankingView = document.getElementById("banking-view");
const addressView = document.getElementById("address-view");
const histotyView = document.getElementById("history-view");
const ChangePwView = document.getElementById("changepw-view");
const allViews = [
  profileView,
  bankingView,
  addressView,
  histotyView,
  ChangePwView,
];
const allNavLinks = [
  navProfile,
  navBanking,
  navAddress,
  navHistory,
  navChangePw,
];

// --- Trang Hồ Sơ ---
const profileForm = document.querySelector(".input-user");
const btnSelectImage = document.querySelector(".btn-select-image");
const avatarContainer = document.querySelector(".avatar-upload-container");
const avatarPlaceholder = document.querySelector(".avatar-placeholder");
const sidebarAvatar = document.querySelector(".sidebar-avatar-img");
const sidebarAvatarIcon = document.getElementById(
  "sidebar-avatar-icon-default"
);
const sidebarNameSpan = document.querySelector(
  ".profile-sidebar-user .user-Name"
);

// --- Trang Ngân Hàng ---
const bankingEmpty = document.getElementById("banking-empty");
const bankingList = document.getElementById("banking-list");
const btnOpenCmndModal = document.getElementById("btn-open-cmnd-modal");

// --- Trang Địa Chỉ ---
const addressEmpty = document.getElementById("address-empty");
const addressList = document.getElementById("address-list");
const btnOpenAddressModal = document.getElementById("btn-open-address-modal");

// --- Modals (Chung) ---
const modalOverlay = document.getElementById("bank-modal-overlay");
const cmndModal = document.getElementById("cmnd-modal");
const addBankModal = document.getElementById("add-bank-modal");
const addAddressModal = document.getElementById("add-address-modal");

// --- Forms trong Modal ---
const cmndForm = document.getElementById("cmnd-form");
const addBankForm = document.getElementById("add-bank-form");
const addAddressForm = document.getElementById("add-address-form");

// --- Nút bấm trong Modal ---
const cmndModalBack = document.getElementById("cmnd-modal-back");
const addBankModalBack = document.getElementById("add-bank-modal-back");
const addAddressModalBack = document.getElementById("add-address-modal-back");

// --- Biến tạm ---
let pendingAvatarUrl = null;
let hiddenFileInput;

// ===================================
// --- CÁC HÀM CHUNG (Global) ---
// ===================================

function showView(viewToShow, activeLink = null) {
  allViews.forEach((view) => {
    if (view) view.classList.add("hidden-view");
  });
  if (viewToShow) {
    viewToShow.classList.remove("hidden-view");
  }
  allNavLinks.forEach((link) => {
    if (link) link.parentElement.classList.remove("active");
  });
  if (activeLink) {
    activeLink.parentElement.classList.add("active");
  }
}

function openModal(modal) {
  if (modalOverlay) modalOverlay.classList.remove("hidden-view");
  if (modal) modal.classList.remove("hidden-view");
}

function closeModal() {
  if (modalOverlay) modalOverlay.classList.add("hidden-view");
  if (cmndModal) cmndModal.classList.add("hidden-view");
  if (addBankModal) addBankModal.classList.add("hidden-view");
  if (addAddressModal) addAddressModal.classList.add("hidden-view");
}

// ===================================
// --- CÁC HÀM TẢI DỮ LIỆU & RENDER (Global) ---
// ===================================

// --- 1. Tải dữ liệu Hồ Sơ ---
function loadProfileData() {
  const currentUser = docdulieuLocalStorage("currentUser");
  if (!currentUser || (Array.isArray(currentUser) && currentUser.length === 0))
    return;

  try {
    const loginUsername = currentUser.userName;
    const loginEmail = currentUser.email;

    if (loginUsername) {
      const usernameInput = document.getElementById("profile-username");
      if (usernameInput) usernameInput.value = loginUsername;
      if (sidebarNameSpan)
        sidebarNameSpan.textContent = currentUser.fullName || loginUsername;
    }
    if (loginEmail) {
      const emailInput = document.getElementById("profile-email");
      if (emailInput) emailInput.value = loginEmail;
      const changePwEmailInput = document.getElementById("changepw-email");
      if (changePwEmailInput) changePwEmailInput.value = loginEmail;
    }

    if (document.getElementById("fullname")) {
      document.getElementById("fullname").value = currentUser.fullName || "";
    }
    if (document.getElementById("phone")) {
      document.getElementById("phone").value = currentUser.phone || "";
    }
    if (document.getElementById("birthday")) {
      document.getElementById("birthday").value = currentUser.birthday || "";
    }

    if (currentUser.gender) {
      const genderInput = document.querySelector(
        `input[name="gender"][value="${currentUser.gender}"]`
      );
      if (genderInput) genderInput.checked = true;
    }

    if (currentUser.avatarUrl) {
      if (avatarPlaceholder) {
        avatarPlaceholder.innerHTML = `<img src="${currentUser.avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      }
      if (sidebarAvatar) {
        sidebarAvatar.src = currentUser.avatarUrl;
        sidebarAvatar.style.display = "block";
      }
      if (sidebarAvatarIcon) {
        sidebarAvatarIcon.style.display = "none";
      }
    } else {
      if (avatarPlaceholder) {
        avatarPlaceholder.innerHTML = `<i class="fa-solid fa-user"></i>`;
      }
      if (sidebarAvatar) {
        sidebarAvatar.style.display = "none";
      }
      if (sidebarAvatarIcon) {
        sidebarAvatarIcon.style.display = "block";
      }
    }
  } catch (error) {
    console.error("Không thể tải dữ liệu hồ sơ từ localStorage:", error);
  }
}

// --- 2. Hiển thị danh sách Ngân Hàng ---
function renderBankingList() {
  const currentUser = docdulieuLocalStorage("currentUser");
  if (!currentUser || (Array.isArray(currentUser) && currentUser.length === 0))
    return;

  const bankListData = currentUser.bankingList || [];

  if (bankListData.length === 0) {
    if (bankingEmpty) bankingEmpty.style.display = "flex";
    if (bankingList) bankingList.style.display = "none";
    return;
  }

  if (bankingEmpty) bankingEmpty.style.display = "none";
  if (bankingList) bankingList.style.display = "flex";
  bankingList.innerHTML = "";

  bankListData.forEach((bank) => {
    const bankCard = document.createElement("div");
    bankCard.className = "bank-card";
    bankCard.dataset.id = bank.account;
    const maskedAccount = `**** **** **** ${bank.account.slice(-4)}`;
    const defaultTag = bank.isDefault
      ? '<span class="bank-card-default">Mặc định</span>'
      : "";
    const setDefaultBtn = !bank.isDefault
      ? '<button type="button" class="btn-link btn-set-default-bank">Đặt làm mặc định</button>'
      : "";
    bankCard.innerHTML = `
            <div class="bank-card-info">
                <span class="bank-name">${bank.name} ${defaultTag}</span>
                <span class="bank-holder">${bank.holderName}</span>
                <span class="bank-number">${maskedAccount}</span>
            </div>
            <div class="bank-card-actions">
                ${setDefaultBtn}<button type="button" class="btn-link btn-delete-bank">Xóa</button>
            </div>
        `;
    bankingList.appendChild(bankCard);
  });
}

// --- 3. Hiển thị danh sách Địa Chỉ ---
function renderAddressList() {
  const currentUser = docdulieuLocalStorage("currentUser");
  if (!currentUser || (Array.isArray(currentUser) && currentUser.length === 0))
    return;

  const addressListData = currentUser.addressList || [];

  if (addressListData.length === 0) {
    if (addressEmpty) addressEmpty.style.display = "flex";
    if (addressList) addressList.style.display = "none";
    return;
  }

  if (addressEmpty) addressEmpty.style.display = "none";
  if (addressList) addressList.style.display = "flex";
  addressList.innerHTML = "";

  addressListData.forEach((addr) => {
    const addressCard = document.createElement("div");
    addressCard.className = "address-card";
    addressCard.dataset.id = addr.specific;
    const defaultTag = addr.isDefault
      ? '<span class="address-card-default">Mặc định</span>'
      : "";
    const setDefaultBtn = !addr.isDefault
      ? '<button type="button" class="btn-link btn-set-default-address">Đặt làm mặc định</button>'
      : "";
    addressCard.innerHTML = `
            <div class="address-card-info">
                <span class="address-name">${addr.fullName} ${defaultTag}</span>
                <span class="address-phone">SĐT: ${addr.phone}</span>
                <span class="address-details">Địa chỉ: ${addr.specific}</span>
            </div>
            <div class="address-card-actions">
                ${setDefaultBtn}<button type="button" class="btn-link btn-delete-address">Xóa</button>
            </div>
        `;
    addressList.appendChild(addressCard);
  });
}

// --- 4. Hiển thị Lịch Sử Mua Hàng ---
function renderHistoryList() {
  const currentUser = docdulieuLocalStorage("currentUser");
  if (!currentUser || (Array.isArray(currentUser) && currentUser.length === 0))
    return;

  const historyEmpty = document.getElementById("history-empty");
  const historyList = document.getElementById("history-list");
  const historyTableBody = document.getElementById("history-table-body");

  // Lấy tất cả đơn hàng từ localStorage
  let allOrders = docdulieuLocalStorage("orders") || [];

  // Lọc đơn hàng của user hiện tại
  const userOrders = allOrders.filter(
    (order) => order.customerEmail === currentUser.email
  );

  // Kiểm tra nếu không có đơn hàng
  if (userOrders.length === 0) {
    if (historyEmpty) historyEmpty.style.display = "flex";
    if (historyList) historyList.style.display = "none";
    return;
  }

  // Hiển thị danh sách
  if (historyEmpty) historyEmpty.style.display = "none";
  if (historyList) historyList.style.display = "block";
  if (historyTableBody) historyTableBody.innerHTML = "";

  // Sắp xếp theo ngày mới nhất
  userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Render từng đơn hàng
  userOrders.forEach((order, index) => {
    const row = document.createElement("tr");

    // STT
    const sttCell = document.createElement("td");
    sttCell.textContent = index + 1;
    row.appendChild(sttCell);

    // Mã đơn
    const codeCell = document.createElement("td");
    codeCell.textContent = order.id;
    codeCell.style.fontWeight = "600";
    codeCell.style.color = "#333";
    row.appendChild(codeCell);

    // Danh sách sản phẩm
    const productsCell = document.createElement("td");
    const productList = document.createElement("div");
    productList.className = "history-product-list";

    order.products.forEach((product, idx) => {
      if (idx < 2) {
        // Chỉ hiển thị 2 sản phẩm đầu
        const productItem = document.createElement("div");
        productItem.className = "history-product-item";

        // Hình ảnh sản phẩm
        if (product.image) {
          const img = document.createElement("img");
          img.src = product.image;
          img.alt = product.name;
          img.className = "history-product-img";
          productItem.appendChild(img);
        }

        // Tên sản phẩm
        const nameSpan = document.createElement("span");
        nameSpan.className = "history-product-name";
        nameSpan.textContent = product.name;
        productItem.appendChild(nameSpan);

        productList.appendChild(productItem);
      }
    });

    // Nếu có nhiều hơn 2 sản phẩm
    if (order.products.length > 2) {
      const moreSpan = document.createElement("span");
      moreSpan.style.fontSize = "12px";
      moreSpan.style.color = "#888";
      moreSpan.textContent = `+${order.products.length - 2} sản phẩm khác...`;
      productList.appendChild(moreSpan);
    }

    productsCell.appendChild(productList);
    row.appendChild(productsCell);

    // Tổng số lượng
    const quantityCell = document.createElement("td");
    quantityCell.className = "history-quantity";
    const totalQuantity = order.products.reduce(
      (sum, p) => sum + p.quantity,
      0
    );
    quantityCell.textContent = totalQuantity;
    row.appendChild(quantityCell);

    // Giá trị đơn hàng
    const totalCell = document.createElement("td");
    totalCell.className = "history-total";
    totalCell.textContent = formatToVND(order.total);
    row.appendChild(totalCell);

    // Ngày mua
    const dateCell = document.createElement("td");
    dateCell.className = "history-date";
    dateCell.textContent = formatDate(order.date);
    row.appendChild(dateCell);

    // Trạng thái
    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = `history-status-badge status-${order.status}`;
    statusBadge.textContent = getStatusText(order.status);
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);

    // Nút xem chi tiết
    const actionCell = document.createElement("td");
    const viewBtn = document.createElement("button");
    viewBtn.className = "btn-view-detail";
    viewBtn.textContent = "Xem chi tiết";
    viewBtn.onclick = () => showOrderDetail(order);
    actionCell.appendChild(viewBtn);
    row.appendChild(actionCell);

    historyTableBody.appendChild(row);
  });
}

// Hàm hiển thị chi tiết đơn hàng
function showOrderDetail(order) {
  const modalOverlay = document.getElementById("history-modal-overlay");
  const modal = document.getElementById("history-detail-modal");
  const modalBody = document.getElementById("history-modal-body");

  if (!modalOverlay || !modal || !modalBody) return;

  // Xây dựng nội dung modal
  modalBody.innerHTML = `
        <div class="order-detail-section">
            <h4>Thông Tin Đơn Hàng</h4>
            <div class="order-info-grid">
                <div class="order-info-item">
                    <span class="order-info-label">Mã đơn hàng:</span>
                    <span class="order-info-value">${order.id}</span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Ngày đặt:</span>
                    <span class="order-info-value">${formatDate(
                      order.date
                    )}</span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Trạng thái:</span>
                    <span class="order-info-value">
                        <span class="history-status-badge status-${
                          order.status
                        }">
                            ${getStatusText(order.status)}
                        </span>
                    </span>
                </div>
                <div class="order-info-item">
                    <span class="order-info-label">Phương thức thanh toán:</span>
                    <span class="order-info-value">${
                      order.paymentMethod || "N/A"
                    }</span>
                </div>
            </div>
            <div class="order-info-item" style="margin-top: 15px;">
                <span class="order-info-label">Địa chỉ giao hàng:</span>
                <span class="order-info-value">${
                  order.deliveryAddress || "N/A"
                }</span>
            </div>
        </div>

        <div class="order-detail-section">
            <h4>Sản Phẩm</h4>
            <div class="modal-product-list">
                ${order.products
                  .map(
                    (product) => `
                    <div class="modal-product-item">
                        ${
                          product.image
                            ? `<img src="${product.image}" alt="${product.name}" class="modal-product-img">`
                            : ""
                        }
                        <div class="modal-product-info">
                            <div class="modal-product-name">${
                              product.name
                            }</div>
                            <div class="modal-product-price">Đơn giá: ${formatToVND(
                              product.price
                            )}</div>
                            <div class="modal-product-quantity">Số lượng: ${
                              product.quantity
                            }</div>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
            <div class="order-total-box">
                <span class="order-total-label">Tổng cộng:</span>
                <span class="order-total-value">${formatToVND(
                  order.total
                )}</span>
            </div>
        </div>
    `;

  // Hiển thị modal
  modalOverlay.classList.remove("hidden-view");
  modal.classList.remove("hidden-view");
}

// Đóng modal chi tiết
function closeHistoryModal() {
  const modalOverlay = document.getElementById("history-modal-overlay");
  const modal = document.getElementById("history-detail-modal");

  if (modalOverlay) modalOverlay.classList.add("hidden-view");
  if (modal) modal.classList.add("hidden-view");
}

// Gắn sự kiện đóng modal
const historyModalClose = document.getElementById("history-modal-close");
const historyModalOverlay = document.getElementById("history-modal-overlay");

if (historyModalClose) {
  historyModalClose.addEventListener("click", closeHistoryModal);
}
if (historyModalOverlay) {
  historyModalOverlay.addEventListener("click", closeHistoryModal);
}

// Hàm format ngày tháng
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Hàm format giá tiền
function formatToVND(number) {
  if (typeof number !== "number") number = 0;
  return number.toLocaleString("vi-VN") + "₫";
}

// Hàm lấy text trạng thái
function getStatusText(status) {
  const statusMap = {
    pending: "Chờ xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || "Không xác định";
}
// ===================================
// --- (MỚI) TẤT CẢ EVENT LISTENERS (Global) ---
// (Các trình nghe sự kiện được gắn 1 LẦN DUY NHẤT khi script tải)
// ===================================

// --- Listener Điều Hướng ---
window.addEventListener("hashchange", () => {
  if (!profileView) return; // Chỉ chạy nếu đang ở trang profile

  const currentHash = location.hash.replace("#", "");
  if (currentHash === "banking") {
    showView(bankingView, navBanking);
  } else if (currentHash === "address") {
    showView(addressView, navAddress);
  } else if (currentHash === "profile") {
    showView(profileView, navProfile);
  } else if (currentHash === "history") {
    showView(histotyView, navHistory);
  } else if (currentHash === "changepw") {
    showView(ChangePwView, navChangePw);
  }
});

// --- Listener "Lưu" Hồ Sơ ---
if (profileForm) {
  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const currentUser = docdulieuLocalStorage("currentUser");
    let users = docdulieuLocalStorage("users");

    const fullName = document.getElementById("fullname").value;
    const phone = document.getElementById("phone").value;
    const birthday = document.getElementById("birthday").value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const userIndex = users.findIndex(
      (user) => user.userName === currentUser.userName
    );

    currentUser.fullName = fullName;
    currentUser.phone = phone;
    currentUser.birthday = birthday;
    currentUser.gender = gender;

    if (pendingAvatarUrl) {
      currentUser.avatarUrl = pendingAvatarUrl;
      pendingAvatarUrl = null;
    }

    if (userIndex > -1) {
      users[userIndex] = { ...users[userIndex], ...currentUser };
    }

    ghidulieuLocalStorage("currentUser", currentUser);
    ghidulieuLocalStorage("users", users);

    showalert("✅ Đã lưu thông tin hồ sơ thành công!", "success"); // Sẽ chỉ nhảy ra 1 LẦN
    if (sidebarNameSpan)
      sidebarNameSpan.textContent =
        currentUser.fullName || currentUser.userName;
  });
}

// --- Listener "Chọn Ảnh" ---
if (avatarContainer && !hiddenFileInput) {
  hiddenFileInput = document.createElement("input");
  hiddenFileInput.type = "file";
  hiddenFileInput.accept = "image/jpeg, image/png";
  hiddenFileInput.style.display = "none";
  avatarContainer.appendChild(hiddenFileInput);

  if (btnSelectImage) {
    btnSelectImage.addEventListener("click", () => {
      hiddenFileInput.click();
    });
  }

  hiddenFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        showalert(
          "Dung lượng file quá lớn! Vui lòng chọn file dưới 1 MB.",
          "warning"
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        pendingAvatarUrl = imageUrl;
        if (avatarPlaceholder) {
          avatarPlaceholder.innerHTML = `<img src="${imageUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

// --- Listeners Mở/Đóng Modal ---
if (btnOpenCmndModal) {
  btnOpenCmndModal.addEventListener("click", () => openModal(cmndModal));
}
if (btnOpenAddressModal) {
  btnOpenAddressModal.addEventListener("click", () =>
    openModal(addAddressModal)
  );
}
if (modalOverlay) {
  modalOverlay.addEventListener("click", () => closeModal());
}
if (cmndModalBack) {
  cmndModalBack.addEventListener("click", () => closeModal());
}
if (addBankModalBack) {
  addBankModalBack.addEventListener("click", () => {
    closeModal();
    openModal(cmndModal);
  });
}
if (addAddressModalBack) {
  addAddressModalBack.addEventListener("click", () => closeModal());
}
if (cmndForm) {
  cmndForm.addEventListener("submit", (e) => {
    e.preventDefault();
    closeModal();
    openModal(addBankModal);
  });
}

// --- Listener "Thêm Ngân Hàng" ---
if (addBankForm) {
  addBankForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let currentUser = docdulieuLocalStorage("currentUser");
    let users = docdulieuLocalStorage("users");
    const userIndex = users.findIndex(
      (u) => u.userName === currentUser.userName
    );

    const bankNameSelect = addBankForm.querySelector("#bank-name");
    const bankName = bankNameSelect.options[bankNameSelect.selectedIndex].text;
    const bankAccount = addBankForm.querySelector("#bank-account").value;
    const bankHolderName = addBankForm.querySelector("#bank-holder-name").value;
    const isDefault = addBankForm.querySelector("#bank-default").checked;

    if (!currentUser.bankingList) currentUser.bankingList = [];
    const bankListData = currentUser.bankingList;

    if (bankListData.some((bank) => bank.account === bankAccount)) {
      showalert("Số tài khoản này đã tồn tại!", "warning");
      return;
    }
    if (isDefault) {
      bankListData.forEach((bank) => (bank.isDefault = false));
    }
    bankListData.push({
      name: bankName,
      account: bankAccount,
      holderName: bankHolderName,
      isDefault: isDefault,
    });

    if (userIndex > -1) users[userIndex] = currentUser;
    ghidulieuLocalStorage("currentUser", currentUser);
    ghidulieuLocalStorage("users", users);

    addBankForm.reset();
    cmndForm.reset();
    showalert("✅ Đã thêm tài khoảng thành công!", "success");
    closeModal();
    renderBankingList();
  });
}

// --- Listener "Xóa Ngân Hàng" ---
if (bankingList) {
  bankingList.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-delete-bank")) {
      if (confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
        let currentUser = docdulieuLocalStorage("currentUser");
        let users = docdulieuLocalStorage("users");
        const userIndex = users.findIndex(
          (u) => u.userName === currentUser.userName
        );
        const card = e.target.closest(".bank-card");
        const idToDelete = card.dataset.id;

        let bankListData = currentUser.bankingList || [];
        const wasDefault = bankListData.find(
          (bank) => bank.account === idToDelete
        )?.isDefault;
        currentUser.bankingList = bankListData.filter(
          (bank) => bank.account !== idToDelete
        );

        if (wasDefault && currentUser.bankingList.length > 0) {
          currentUser.bankingList[0].isDefault = true;
        }

        if (userIndex > -1) users[userIndex] = currentUser;
        ghidulieuLocalStorage("currentUser", currentUser);
        ghidulieuLocalStorage("users", users);
        renderBankingList();
      }
    }
    if (e.target.classList.contains("btn-set-default-bank")) {
      let currentUser = docdulieuLocalStorage("currentUser");
      let users = docdulieuLocalStorage("users");
      const userIndex = users.findIndex(
        (u) => u.userName === currentUser.userName
      );
      const card = e.target.closest(".bank-card");
      const idToSetDefault = card.dataset.id;

      let bankListData = currentUser.bankingList || [];

      // 1. Bỏ tất cả mặc định
      bankListData.forEach((bank) => (bank.isDefault = false));

      // 2. Đặt mặc định cho cái được chọn
      const targetBank = bankListData.find(
        (bank) => bank.account === idToSetDefault
      );
      if (targetBank) {
        targetBank.isDefault = true;
      }

      // 3. Lưu lại
      if (userIndex > -1) users[userIndex] = currentUser;
      ghidulieuLocalStorage("currentUser", currentUser);
      ghidulieuLocalStorage("users", users);

      // 4. Vẽ lại
      renderBankingList();
    }
  });
}

// --- Listener "Thêm Địa Chỉ" ---
if (addAddressForm) {
  addAddressForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let currentUser = docdulieuLocalStorage("currentUser");
    let users = docdulieuLocalStorage("users");
    const userIndex = users.findIndex(
      (u) => u.userName === currentUser.userName
    );
    const profileFullName = currentUser.fullName;
    const profilePhone = currentUser.phone;

    if (!profileFullName || !profilePhone) {
      showalert(
        "Vui lòng cập nhật Tên và Số điện thoại trong Hồ Sơ của bạn trước khi thêm địa chỉ.",
        "warning"
      );
      showView(profileView, navProfile);
      return;
    }

    const specific = addAddressForm.querySelector("#addr-specific").value;
    const isDefault = addAddressForm.querySelector("#addr-default").checked;

    if (!currentUser.addressList) currentUser.addressList = [];
    let addressListData = currentUser.addressList;

    if (
      addressListData.some(
        (addr) => addr.specific.toLowerCase() === specific.toLowerCase()
      )
    ) {
      showalert("Địa chỉ này đã tồn tại!", "warning");
      return;
    }
    if (isDefault) {
      addressListData.forEach((addr) => (addr.isDefault = false));
    }
    addressListData.push({
      fullName: profileFullName,
      phone: profilePhone,
      specific: specific,
      isDefault: isDefault,
    });

    if (userIndex > -1) users[userIndex] = currentUser;
    ghidulieuLocalStorage("currentUser", currentUser);
    ghidulieuLocalStorage("users", users);

    addAddressForm.reset();
    showalert("Đã thêm địa chỉ mới thành công!", "success");
    closeModal();
    renderAddressList();
  });
}

// --- Listener "Xóa Địa Chỉ" ---
if (addressList) {
  addressList.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-delete-address")) {
      if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
        let currentUser = docdulieuLocalStorage("currentUser");
        let users = docdulieuLocalStorage("users");
        const userIndex = users.findIndex(
          (u) => u.userName === currentUser.userName
        );
        const card = e.target.closest(".address-card");
        const idToDelete = card.dataset.id;

        let addressListData = currentUser.addressList || [];
        const wasDefault = addressListData.find(
          (addr) => addr.specific === idToDelete
        )?.isDefault;
        currentUser.addressList = addressListData.filter(
          (addr) => addr.specific !== idToDelete
        );

        if (wasDefault && currentUser.addressList.length > 0) {
          currentUser.addressList[0].isDefault = true;
        }

        if (userIndex > -1) users[userIndex] = currentUser;
        ghidulieuLocalStorage("currentUser", currentUser);
        ghidulieuLocalStorage("users", users);
        renderAddressList();
      }
    }
    // --- (MỚI) Xử lý "Đặt làm Mặc định" ---
    if (e.target.classList.contains("btn-set-default-address")) {
      let currentUser = docdulieuLocalStorage("currentUser");
      let users = docdulieuLocalStorage("users");
      const userIndex = users.findIndex(
        (u) => u.userName === currentUser.userName
      );
      const card = e.target.closest(".address-card");
      const idToSetDefault = card.dataset.id; // dataset.id đang lưu "specific"

      let addressListData = currentUser.addressList || [];

      // 1. Bỏ tất cả mặc định
      addressListData.forEach((addr) => (addr.isDefault = false));

      // 2. Đặt mặc định cho cái được chọn
      const targetAddress = addressListData.find(
        (addr) => addr.specific === idToSetDefault
      );
      if (targetAddress) {
        targetAddress.isDefault = true;
      }

      // 3. Lưu lại
      if (userIndex > -1) users[userIndex] = currentUser;
      ghidulieuLocalStorage("currentUser", currentUser);
      ghidulieuLocalStorage("users", users);

      // 4. Vẽ lại
      renderAddressList();
    }
  });
}
// --- Listener Cập nhật mật khẩu" ---
function effect(element, status) {
  if (status) {
    element.style.border = "1px solid red";
    element.classList.remove("Ierror");
    void element.offsetWidth;
    element.classList.add("Ierror");
  } else {
    element.classList.remove("Ierror");
    element.style.border = "";
  }
}
let currentUser = docdulieuLocalStorage("currentUser");
let users = docdulieuLocalStorage("users");
const Npassword = document.getElementById("Npassword");
const Cpassword = document.getElementById("Cpassword");
const changepw = document.querySelector(".change-user");
const Opassword = document.querySelector("#Opassword");
let usersIndex = users.findIndex(u => u.email === currentUser.email);
changepw.addEventListener("submit", () => {
  //Kiểm tra mật khẩu cũ
  if (Opassword.value === "") {
    showalert("Không được bỏ trống mật khẩu", "warning");
    effect(Opassword, true);
  } else if (Opassword.value !== currentUser.password) {
    showalert("Mật khẩu không đúng", "warning");
    effect(Opassword, true);
  } else {
    effect(Opassword, false);
    //Kiểm tra mật khẩu mới và xác nhận mật khẩu mới
    if (Npassword.value !== Cpassword.value) {
      effect(Npassword, true);
      effect(Cpassword, true);
      showalert("Mật khẩu không khớp", "warning");
    } else {
      users[usersIndex].password = Npassword.value;
      ghidulieuLocalStorage("users", users);
      effect(Npassword, false);
      effect(Cpassword, false);
      Opassword.value = "";
      Npassword.value = "";
      Cpassword.value = "";
      showalert("✅ Đã thay đổi mật khẩu thành công!", "success");
    }
  }
})



// ===================================
// --- (MỚI) HÀM KHỞI TẠO CHÍNH ---
// (Hàm này giờ RẤT NHỎ, chỉ tải data và set view)
// ===================================
export function initProfilePage() {
  // 1. Kiểm tra người dùng
  const checkUser = docdulieuLocalStorage("currentUser");
  if (Array.isArray(checkUser) && checkUser.length === 0) {
    location.hash = "home";
    return;
  }

  // 2. Tải dữ liệu lần đầu
  loadProfileData();
  renderBankingList();
  renderAddressList();
  renderHistoryList();
  // 3. Hiển thị đúng tab
  const initialHash = location.hash.replace("#", "");
  if (initialHash === "banking") {
    showView(bankingView, navBanking);
  } else if (initialHash === "address") {
    showView(addressView, navAddress);
  } else if (initialHash === "history") {
    showView(histotyView, navHistory);
  } else if (initialHash === "changepw") {
    showView(ChangePwView, navChangePw);
  } else {
    showView(profileView, navProfile);
  }
}
