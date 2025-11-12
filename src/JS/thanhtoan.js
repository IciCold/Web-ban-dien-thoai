// --- Import các hàm cần thiết ---
import { showalert } from "./alert.js";
import { clearUserCart, formatVND, getCurrentUserObject } from "./cart.js"; // Hàm xóa giỏ hàng
import {
  docdulieuLocalStorage,
  ghidulieuLocalStorage,
} from "./readandwrite.js";

// --- Biến toàn cục để lưu trữ dữ liệu thanh toán ---
let currentPaymentData = null;

// --- Khai báo biến DOM chính (sẽ gán giá trị sau) ---
let itemListContainer = null;
let totalAmountSpan = null;
let finalBuyButton = null;

// (CŨ) Biến cho khối hiển thị địa chỉ
let paymentAddressContainer = null;
let paymentAddressDetails = null;
let paymentChangeAddressBtn = null;

// (CŨ) Biến cho Modal chọn địa chỉ
let checkoutModalOverlay = null;
let checkoutModal = null;
let checkoutModalViewList = null;
let checkoutModalViewForm = null;
let checkoutAddressListContainer = null;
let checkoutModalConfirmBtn = null;
let checkoutModalCancelBtn = null;
let checkoutGotoAddNewBtn = null;
let checkoutModalBackBtn = null;
let checkoutAddAddressForm = null;
let checkoutModalCloseBtn = null;
let checkoutModalCloseBtnForm = null;

// (CŨ) Biến cho Phương thức thanh toán
let paymentMethodsContainer = null;
let cardInfoBox = null;
let cardNameInput = null;
let cardNumberInput = null;

// (MỚI) DOM cho Modal Xác nhận
let paymentConfirmModal = null;
let paymentConfirmOverlay = null;
let confirmCustomerName = null;
let confirmDeliveryAddress = null;
let confirmProductList = null;
let confirmPaymentMethod = null;
let confirmPaymentInfoGroup = null;
let confirmPaymentInfo = null;
let confirmTotalAmount = null;
let confirmCancelBtn = null;
let confirmSubmitBtn = null;

/*
 * Được gọi bởi main.js khi hash là #thanhtoan
 */
export function initThanhToanPage() {
  console.log("Khởi tạo trang thanh toán...");

  // Lấy DOM Elements
  itemListContainer = document.getElementById("payment-item-list");
  totalAmountSpan = document.querySelector(".payment-form .total-amount");
  finalBuyButton = document.querySelector(".buy-now-button-large");

  // (CŨ) Lấy DOM cho địa chỉ
  paymentAddressContainer = document.querySelector(".payment-address-section");
  paymentAddressDetails = document.getElementById("payment-address-details");
  paymentChangeAddressBtn = document.getElementById(
    "payment-change-address-btn"
  );

  // (CŨ) Lấy DOM cho Modal chọn địa chỉ
  checkoutModalOverlay = document.getElementById(
    "checkout-address-modal-overlay"
  );
  checkoutModal = document.getElementById("checkout-address-modal");
  checkoutModalViewList = document.getElementById("checkout-address-list-view");
  checkoutModalViewForm = document.getElementById("checkout-address-form-view");
  checkoutAddressListContainer = document.getElementById(
    "checkout-address-list-container"
  );
  checkoutModalConfirmBtn = document.getElementById(
    "checkout-modal-confirm-btn"
  );
  checkoutModalCancelBtn = document.getElementById("checkout-modal-cancel-btn");
  checkoutGotoAddNewBtn = document.getElementById("checkout-goto-add-new-btn");
  checkoutModalBackBtn = document.getElementById("checkout-modal-back-btn");
  checkoutAddAddressForm = document.getElementById("checkout-add-address-form");
  checkoutModalCloseBtn = document.getElementById("checkout-modal-close-btn");
  checkoutModalCloseBtnForm = document.getElementById(
    "checkout-modal-close-btn-form"
  );

  // (MỚI) Lấy DOM cho Modal Xác nhận
  paymentConfirmModal = document.getElementById("payment-confirm-modal");
  paymentConfirmOverlay = document.getElementById("payment-confirm-overlay");
  confirmCustomerName = document.getElementById("confirm-customer-name");
  confirmDeliveryAddress = document.getElementById("confirm-delivery-address");
  confirmProductList = document.getElementById("confirm-product-list");
  confirmPaymentMethod = document.getElementById("confirm-payment-method");
  confirmPaymentInfoGroup = document.getElementById(
    "confirm-payment-info-group"
  );
  confirmPaymentInfo = document.getElementById("confirm-payment-info");
  confirmTotalAmount = document.getElementById("confirm-total-amount");
  confirmCancelBtn = document.getElementById("confirm-cancel-btn");
  confirmSubmitBtn = document.getElementById("confirm-submit-btn");

  // Lấy các DOM còn lại
  paymentMethodsContainer = document.querySelector(".payment-methods");
  cardInfoBox = document.querySelector(".info");
  cardNameInput = document.getElementById("card-name");
  cardNumberInput = document.getElementById("card-number");

  // 1. Lấy dữ liệu "cầu nối" từ localStorage
  const data = docdulieuLocalStorage("paymentData");

  // 2. Kiểm tra dữ liệu
  if (!data || Array.isArray(data) || !data.items || data.items.length === 0) {
    showalert(
      "Lỗi: Không tìm thấy dữ liệu thanh toán. Quay về trang chủ.",
      "error"
    );
    location.hash = "home"; // Đẩy về trang chủ
    return;
  }
  // *** KIỂM TRA SẢN PHẨM ẨN TRƯỚC KHI TIẾP TỤC ***
  const validation = validateCartItems(data.items);
  if (!validation.valid) {
    showalert(validation.message, "warning");

    // Xóa dữ liệu thanh toán và quay về trang trước đó
    ghidulieuLocalStorage("paymentData", []);

    if (data.type === "cart") {
      location.hash = "cartDetailPage"; // Quay về giỏ hàng
    } else {
      location.hash = "home"; // Quay về trang chủ
    }
    return;
  }
  // 3. *** Logic quan trọng: Xóa ngay lập tức ***
  ghidulieuLocalStorage("paymentData", []); // Ghi mảng rỗng

  // 4. Lưu data vào biến toàn cục
  currentPaymentData = data;

  // 5. "Vẽ" lại giao diện (Render)
  if (!itemListContainer || !totalAmountSpan) {
    console.error("Không tìm thấy phần tử DOM của trang thanh toán.");
    return;
  }

  itemListContainer.innerHTML = "";

  currentPaymentData.items.forEach((item) => {
    const itemHTML = `
      <p class="order-item">
        ${item.quantity} x ${item.name} 
        </p>
    `;
    itemListContainer.innerHTML += itemHTML;
  });

  totalAmountSpan.textContent = formatVND(currentPaymentData.total);

  // 6. Gọi các hàm helper
  autoFillUserInfo(); // Tự điền địa chỉ, tên thẻ
  setupPaymentMethodToggle();
  setupBuyNowButton();
  setupCheckoutAddressModalListeners(); // (CŨ) Gọi hàm setup listener cho modal
}

/**
 * Gắn sự kiện cho nút Mua Ngay (dùng "trick" clone-replace)
 */
function setupBuyNowButton() {
  if (finalBuyButton) {
    const newButton = finalBuyButton.cloneNode(true);
    finalBuyButton.parentNode.replaceChild(newButton, finalBuyButton);
    finalBuyButton = newButton;

    finalBuyButton.addEventListener("click", (e) => {
      e.preventDefault();
      saveOrderAndCheckout();
    });
  }
}

/**
 * HÀM LƯU ĐƠN HÀNG (ĐÃ SỬA LẠI LOGIC)
 * Bước 1: Validate thông tin
 * Bước 2: Hiển thị popup xác nhận
 * (Logic lưu đơn hàng thật sự đã được chuyển sang hàm completeOrderProcessing)
 */
function saveOrderAndCheckout() {
  const currentUser = getCurrentUserObject();
  if (!currentUser) {
    showalert("Vui lòng đăng nhập để mua hàng", "warning");
    location.hash = "login";
    return;
  }

  // 1. Kiểm tra lại dữ liệu thanh toán
  if (
    !currentPaymentData ||
    !currentPaymentData.items ||
    currentPaymentData.items.length === 0
  ) {
    showalert("Lỗi: Không có sản phẩm nào để thanh toán.", "error");
    return;
  }
  // KIỂM TRA LẠI SẢN PHẨM ẨN (phòng trường hợp có thay đổi sau khi vào trang)
  const validation = validateCartItems(currentPaymentData.items);
  if (!validation.valid) {
    showalert(validation.message, "warning");
    return;
  }
  // 2. Lấy thông tin từ Form
  const selectedPaymentBtn = document.querySelector(".payment-button.active");
  if (!selectedPaymentBtn) {
    showalert("Vui lòng chọn phương thức thanh toán!", "warning");
    return;
  }
  const selectedPayment = selectedPaymentBtn.textContent.trim();

  // Lấy địa chỉ từ data-attribute
  let selectedAddrObj = null;
  let deliveryAddressString = "";

  if (
    paymentAddressContainer &&
    paymentAddressContainer.dataset.selectedAddress
  ) {
    try {
      selectedAddrObj = JSON.parse(
        paymentAddressContainer.dataset.selectedAddress
      );
      deliveryAddressString = selectedAddrObj.specific;
    } catch (e) {
      selectedAddrObj = null;
    }
  }

  // Validate địa chỉ
  if (!selectedAddrObj || !deliveryAddressString) {
    showalert("Vui lòng chọn địa chỉ giao hàng!", "warning");
    openCheckoutAddressModal();
    return;
  }

  // (MỚI) Lấy thông tin thanh toán (thẻ/momo)
  const paymentInfoString =
    selectedPayment === "Visa" || selectedPayment === "Momo"
      ? cardNumberInput.value.trim()
      : null;

  // 3. Tạo đối tượng đơn hàng (newOrder)
  const newOrder = {
    id: "ORD_" + Date.now(),
    customer: selectedAddrObj.fullName,
    customerEmail: currentUser.email,
    customerPhone: selectedAddrObj.phone,
    products: currentPaymentData.items.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || "",
    })),
    total: currentPaymentData.total,
    status: "mới đặt",
    date: new Date().toISOString(),
    paymentMethod: selectedPayment,
    deliveryAddress: deliveryAddressString,
    paymentInfo: paymentInfoString, // (MỚI) Thêm thông tin thẻ
  };

  // 4. (ĐÃ SỬA) Chỉ gọi Popup. KHÔNG làm gì khác.
  populateAndShowConfirmModal(newOrder);
}

// ===============================================
// (MỚI) CÁC HÀM QUẢN LÝ POPUP XÁC NHẬN
// ===============================================

/**
 * (MỚI) Hiển thị Modal xác nhận với thông tin đơn hàng
 */
function populateAndShowConfirmModal(newOrder) {
  if (!paymentConfirmModal) return;

  // Điền thông tin vào modal
  confirmCustomerName.textContent = newOrder.customer;
  confirmDeliveryAddress.textContent = newOrder.deliveryAddress;
  confirmPaymentMethod.textContent = newOrder.paymentMethod;
  confirmTotalAmount.textContent = formatVND(newOrder.total);

  // Điền danh sách sản phẩm
  confirmProductList.innerHTML = "";
  newOrder.products.forEach((p) => {
    confirmProductList.innerHTML += `<p>${p.quantity} x ${p.name}</p>`;
  });

  // Xử lý thông tin thanh toán (Visa/Momo)
  if (newOrder.paymentInfo) {
    confirmPaymentInfo.textContent = newOrder.paymentInfo;
    confirmPaymentInfoGroup.style.display = "block";
  } else {
    confirmPaymentInfo.textContent = "";
    confirmPaymentInfoGroup.style.display = "none";
  }

  // Hiển thị modal
  paymentConfirmOverlay.classList.remove("hidden-view");
  paymentConfirmModal.classList.remove("hidden-view");

  // Gắn sự kiện cho các nút modal (xóa listener cũ nếu có)
  confirmCancelBtn.onclick = hideConfirmModal;
  paymentConfirmOverlay.onclick = hideConfirmModal;

  // Khi nhấn "Xác nhận", gọi hàm xử lý cuối cùng
  confirmSubmitBtn.onclick = () => {
    completeOrderProcessing(newOrder);
  };
}

/**
 * (MỚI) Ẩn Modal xác nhận
 */
function hideConfirmModal() {
  if (!paymentConfirmModal) return;
  paymentConfirmOverlay.classList.add("hidden-view");
  paymentConfirmModal.classList.add("hidden-view");
  // Xóa listener để tránh gọi nhầm
  confirmSubmitBtn.onclick = null;
}

/**
 * (MỚI) HÀM LƯU ĐƠN HÀNG (Phần logic cuối cùng)
 * Được gọi khi nhấn "Xác nhận" trên popup
 */
function completeOrderProcessing(newOrder) {
  // 1. Ẩn modal
  hideConfirmModal();
   //KIỂM TRA LẦN CUỐI SẢN PHẨM ẨN (trước khi lưu đơn hàng)
  const products = docdulieuLocalStorage("dataProducts");
  const hiddenProductsInOrder = [];
  for (let item of newOrder.products) {
    const productInDB = products.find(p => 
      p.ten === item.name || (p.id === item.id && p.hidden)
    );
    if (productInDB && productInDB.hidden) {
      hiddenProductsInOrder.push(item.name);
    }
  }
  
  if (hiddenProductsInOrder.length > 0) {
    showalert(
      `Không thể hoàn tất đơn hàng. Các sản phẩm sau hiện không khả dụng: ${hiddenProductsInOrder.join(", ")}.`,
      "error"
    );
    return;
  }

  // 2. Lưu đơn hàng vào localStorage
  const orders = docdulieuLocalStorage("orders");
  orders.push(newOrder);
  ghidulieuLocalStorage("orders", orders);

  // 3. Xóa giỏ hàng (nếu cần)
  if (currentPaymentData.type === "cart") {
    clearUserCart();
    window.dispatchEvent(new Event("cartUpdated"));
  }

  // 4. Thông báo và chuyển trang
  showalert(
    `🎉 THANH TOÁN THÀNH CÔNG!\n
📦 Mã đơn hàng: ${newOrder.id}
💰 Tổng tiền: ${formatVND(newOrder.total)}
🏠 Địa chỉ giao: ${newOrder.deliveryAddress}\n
Cảm ơn bạn đã mua hàng!`,
    "success"
  );

  currentPaymentData = null; // Xóa dữ liệu thanh toán tạm thời
  location.hash = "home"; // Chuyển về trang chủ
}

// ===============================================
// (CŨ) CÁC HÀM TIỆN ÍCH (riêng của trang này)
// ===============================================

/**
 * (CŨ) Hàm helper để cập nhật khối hiển thị địa chỉ trên trang
 */
function updatePaymentAddressDisplay(addressObject) {
  if (!paymentAddressDetails || !paymentAddressContainer) return;

  if (!addressObject) {
    paymentAddressDetails.innerHTML = `<span class="no-address-warning">Vui lòng chọn hoặc thêm địa chỉ giao hàng.</span>`;
    paymentAddressContainer.dataset.selectedAddress = "";
    return;
  }

  // Chỉ tạo HTML cho địa chỉ
  paymentAddressDetails.innerHTML = `
        <div class="address-display-line2">
            ${addressObject.specific}
        </div>
    `;

  // Lưu trữ TOÀN BỘ địa chỉ (gồm cả Tên, SĐT) vào data-attribute
  paymentAddressContainer.dataset.selectedAddress =
    JSON.stringify(addressObject);
}

// (CŨ) Hàm gộp lại logic tự động điền thông tin
function autoFillUserInfo() {
  const currentUser = getCurrentUserObject();
  if (!currentUser) return;

  try {
    const userAddressList = currentUser.addressList || [];

    // 1. Điền địa chỉ
    if (paymentAddressContainer && userAddressList.length > 0) {
      const defaultAddr =
        userAddressList.find((addr) => addr.isDefault) || userAddressList[0];
      updatePaymentAddressDisplay(defaultAddr);
    } else {
      updatePaymentAddressDisplay(null);
    }

    // 2. Điền thông tin thẻ (Giữ nguyên logic cũ)
    if (cardNameInput) {
      cardNameInput.value = currentUser.fullName || currentUser.userName || "";
    }
  } catch (e) {
    console.error("Lỗi khi tự động điền thông tin thanh toán:", e);
  }
}

// (CŨ) Hàm gộp logic xử lý Phương Thức Thanh Toán (PTTT)
function setupPaymentMethodToggle() {
  if (!paymentMethodsContainer || !cardInfoBox) return;

  const currentUser = getCurrentUserObject();
  const userBankingList =
    currentUser && currentUser.bankingList ? currentUser.bankingList : [];

  paymentMethodsContainer.querySelectorAll(".payment-button").forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", function () {
      paymentMethodsContainer
        .querySelectorAll(".payment-button")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      if (this.classList.contains("visa")) {
        cardInfoBox.style.display = "block";
        if (cardNameInput && currentUser)
          cardNameInput.value = currentUser.fullName || "";
        if (cardNumberInput && userBankingList.length > 0) {
          const defaultBank =
            userBankingList.find((b) => b.isDefault) || userBankingList[0];
          if (defaultBank) cardNumberInput.value = defaultBank.account;
        }
      } else if (this.classList.contains("momo")) {
        cardInfoBox.style.display = "block";
        if (cardNameInput && currentUser)
          cardNameInput.value = currentUser.fullName || "";
        if (cardNumberInput && currentUser)
          cardNumberInput.value = currentUser.phone || "";
      } else {
        cardInfoBox.style.display = "none";
      }
    });
  });

  const cashButton = paymentMethodsContainer.querySelector(
    ".payment-button.cash"
  );
  if (cashButton) {
    if (!paymentMethodsContainer.querySelector(".payment-button.active")) {
      cashButton.click();
    }
  }
}

// ===============================================
// (CŨ) CÁC HÀM QUẢN LÝ MODAL ĐỊA CHỈ
// ===============================================

/**
 * (CŨ) Hiển thị một view cụ thể trong modal (list hoặc form)
 */
function showCheckoutModalView(viewToShow) {
  if (viewToShow === "list") {
    if (checkoutModalViewList)
      checkoutModalViewList.classList.remove("hidden-view");
    if (checkoutModalViewForm)
      checkoutModalViewForm.classList.add("hidden-view");
  } else if (viewToShow === "form") {
    if (checkoutModalViewList)
      checkoutModalViewList.classList.add("hidden-view");
    if (checkoutModalViewForm)
      checkoutModalViewForm.classList.remove("hidden-view");
  }
}

/**
 * (CŨ) Mở Modal chọn địa chỉ
 */
function openCheckoutAddressModal() {
  renderCheckoutAddressList(); // Render lại danh sách mỗi khi mở
  showCheckoutModalView("list"); // Luôn bắt đầu ở view list
  if (checkoutModalOverlay)
    checkoutModalOverlay.classList.remove("hidden-view");
  if (checkoutModal) checkoutModal.classList.remove("hidden-view");
}

/**
 * (CŨ) Đóng Modal chọn địa chỉ
 */
function closeCheckoutAddressModal() {
  if (checkoutModalOverlay) checkoutModalOverlay.classList.add("hidden-view");
  if (checkoutModal) checkoutModal.classList.add("hidden-view");
}

/**
 * (CŨ) Render danh sách địa chỉ vào trong Modal
 */
function renderCheckoutAddressList() {
  if (!checkoutAddressListContainer) return;

  const currentUser = getCurrentUserObject();
  const addressList = currentUser.addressList || [];

  let currentSelectedAddress = null;
  try {
    currentSelectedAddress = JSON.parse(
      paymentAddressContainer.dataset.selectedAddress || "null"
    );
  } catch (e) {
    currentSelectedAddress = null;
  }

  if (addressList.length === 0) {
    checkoutAddressListContainer.innerHTML =
      '<p class="address-empty-state">Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.</p>';
    setTimeout(() => showCheckoutModalView("form"), 300);
    return;
  }

  let html = "";
  addressList.forEach((addr, index) => {
    const isChecked =
      currentSelectedAddress &&
      currentSelectedAddress.specific === addr.specific;
    const addrStringValue = JSON.stringify(addr);

    html += `
      <label class="address-radio-item">
        <input type="radio" name="checkout-address" value='${addrStringValue}' ${
      isChecked ? "checked" : ""
    }>
        <div class="address-radio-details">
          <div class="address-radio-header">
            <strong>${addr.fullName}</strong>
            <span>(+84) ${addr.phone.replace(/^0+/, "")}</span>
            ${
              addr.isDefault
                ? '<span class="address-card-default">Mặc định</span>'
                : ""
            }
          </div>
          <p>${addr.specific}</p>
        </div>
      </label>
    `;
  });
  checkoutAddressListContainer.innerHTML = html;
}

/**
 * (CŨ) Gắn tất cả sự kiện cho Modal chọn/thêm địa chỉ
 */
function setupCheckoutAddressModalListeners() {
  if (!paymentChangeAddressBtn) return;

  // 1. Mở Modal
  const newChangeAddressBtn = paymentChangeAddressBtn.cloneNode(true);
  paymentChangeAddressBtn.parentNode.replaceChild(
    newChangeAddressBtn,
    paymentChangeAddressBtn
  );
  paymentChangeAddressBtn = newChangeAddressBtn;
  paymentChangeAddressBtn.addEventListener("click", openCheckoutAddressModal);

  // 2. Đóng Modal
  const newOverlay = checkoutModalOverlay.cloneNode(true);
  checkoutModalOverlay.parentNode.replaceChild(
    newOverlay,
    checkoutModalOverlay
  );
  checkoutModalOverlay = newOverlay;
  checkoutModalOverlay.addEventListener("click", closeCheckoutAddressModal);

  const newCancelBtn = checkoutModalCancelBtn.cloneNode(true);
  checkoutModalCancelBtn.parentNode.replaceChild(
    newCancelBtn,
    checkoutModalCancelBtn
  );
  checkoutModalCancelBtn = newCancelBtn;
  checkoutModalCancelBtn.addEventListener("click", closeCheckoutAddressModal);

  const newCloseBtn = checkoutModalCloseBtn.cloneNode(true);
  checkoutModalCloseBtn.parentNode.replaceChild(
    newCloseBtn,
    checkoutModalCloseBtn
  );
  checkoutModalCloseBtn = newCloseBtn;
  checkoutModalCloseBtn.addEventListener("click", closeCheckoutAddressModal);

  const newCloseBtnForm = checkoutModalCloseBtnForm.cloneNode(true);
  checkoutModalCloseBtnForm.parentNode.replaceChild(
    newCloseBtnForm,
    checkoutModalCloseBtnForm
  );
  checkoutModalCloseBtnForm = newCloseBtnForm;
  checkoutModalCloseBtnForm.addEventListener(
    "click",
    closeCheckoutAddressModal
  );

  // 3. Chuyển sang View "Thêm Mới"
  const newGotoAddNewBtn = checkoutGotoAddNewBtn.cloneNode(true);
  checkoutGotoAddNewBtn.parentNode.replaceChild(
    newGotoAddNewBtn,
    checkoutGotoAddNewBtn
  );
  checkoutGotoAddNewBtn = newGotoAddNewBtn;
  newGotoAddNewBtn.addEventListener("click", () => {
    if (checkoutAddAddressForm) checkoutAddAddressForm.reset();
    showCheckoutModalView("form");
  });

  // 4. Quay lại View "Danh Sách"
  const newBackBtn = checkoutModalBackBtn.cloneNode(true);
  checkoutModalBackBtn.parentNode.replaceChild(
    newBackBtn,
    checkoutModalBackBtn
  );
  checkoutModalBackBtn = newBackBtn;
  newBackBtn.addEventListener("click", () => {
    showCheckoutModalView("list");
  });

  // 5. Nút "Xác nhận" (Chọn địa chỉ từ danh sách)
  const newConfirmBtn = checkoutModalConfirmBtn.cloneNode(true);
  checkoutModalConfirmBtn.parentNode.replaceChild(
    newConfirmBtn,
    checkoutModalConfirmBtn
  );
  checkoutModalConfirmBtn = newConfirmBtn;
  newConfirmBtn.addEventListener("click", () => {
    const selectedRadio = document.querySelector(
      'input[name="checkout-address"]:checked'
    );
    if (!selectedRadio) {
      showalert("Vui lòng chọn một địa chỉ.", "warning");
      return;
    }
    try {
      const selectedAddrObj = JSON.parse(selectedRadio.value);
      updatePaymentAddressDisplay(selectedAddrObj); // Cập nhật trang thanh toán
      closeCheckoutAddressModal(); // Đóng modal
    } catch (e) {
      showalert("Lỗi: Không thể chọn địa chỉ này.", "error");
    }
  });

  // 6. Submit Form "Thêm Mới"
  const newAddAddressForm = checkoutAddAddressForm.cloneNode(true);
  checkoutAddAddressForm.parentNode.replaceChild(
    newAddAddressForm,
    checkoutAddAddressForm
  );
  checkoutAddAddressForm = newAddAddressForm;
  checkoutAddAddressForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleAddNewAddressSubmit();
  });
}

/**
 * (CŨ) Xử lý lưu địa chỉ mới từ modal
 */
function handleAddNewAddressSubmit() {
  let currentUser = getCurrentUserObject();
  let users = docdulieuLocalStorage("users");
  const userIndex = users.findIndex((u) => u.email === currentUser.email);

  if (userIndex === -1) {
    showalert("Lỗi: Không tìm thấy người dùng.", "error");
    return;
  }

  const profileFullName = currentUser.fullName;
  const profilePhone = currentUser.phone;

  if (!profileFullName || !profilePhone) {
    showalert(
      "Vui lòng cập nhật Tên và Số điện thoại trong Hồ Sơ của bạn trước khi thêm địa chỉ.",
      "warning"
    );
    closeCheckoutAddressModal();
    location.hash = "profile";
    return;
  }

  const fullSpecificAddress = checkoutAddAddressForm
    .querySelector("#checkout-addr-specific")
    .value.trim();
  const isDefault = checkoutAddAddressForm.querySelector(
    "#checkout-addr-default"
  ).checked;

  if (!fullSpecificAddress) {
    showalert("Vui lòng điền địa chỉ cụ thể.", "warning");
    checkoutAddAddressForm.querySelector("#checkout-addr-specific").focus();
    return;
  }

  if (!currentUser.addressList) {
    currentUser.addressList = [];
  }
  let addressList = currentUser.addressList;

  if (
    addressList.some(
      (addr) =>
        addr.specific.toLowerCase() === fullSpecificAddress.toLowerCase()
    )
  ) {
    showalert("Địa chỉ này đã tồn tại!", "warning");
    return;
  }

  if (isDefault) {
    addressList.forEach((addr) => (addr.isDefault = false));
  }

  const newAddress = {
    fullName: profileFullName,
    phone: profilePhone,
    specific: fullSpecificAddress,
    isDefault: isDefault,
  };

  addressList.push(newAddress);

  currentUser.addressList = addressList;
  users[userIndex] = currentUser;

  ghidulieuLocalStorage("currentUser", currentUser);
  ghidulieuLocalStorage("users", users);

  showalert("Đã thêm địa chỉ mới thành công!", "success");

  updatePaymentAddressDisplay(newAddress);

  closeCheckoutAddressModal();
}
function validateCartItems(items) {
  const products = docdulieuLocalStorage("dataProducts");
  const hiddenProducts = [];
  
  for (let item of items) {
    const productInDB = products.find(p => p.id === item.id);
    if (productInDB && productInDB.hidden) {
      hiddenProducts.push(item.name);
    }
  }
  
  if (hiddenProducts.length > 0) {
    return {
      valid: false,
      message: `Các sản phẩm sau hiện không khả dụng: ${hiddenProducts.join(", ")}. Vui lòng xóa khỏi giỏ hàng trước khi thanh toán.`
    };
  }
  
  return { valid: true };
}