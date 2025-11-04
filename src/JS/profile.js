// ===================================
// --- IMPORT HÀM ĐỌC/GHI ---
// ===================================
import { docdulieuLocalStorage, ghidulieuLocalStorage } from './readandwrite.js';

// --- Sidebar & Views ---
const navProfile = document.getElementById("nav-profile-link");
const navBanking = document.getElementById("nav-banking-link");
const navAddress = document.getElementById("nav-address-link");
const profileView = document.getElementById("profile-view");
const bankingView = document.getElementById("banking-view");
const addressView = document.getElementById("address-view");
const allViews = [profileView, bankingView, addressView];
const allNavLinks = [navProfile, navBanking, navAddress];

// --- Trang Hồ Sơ ---
const profileForm = document.querySelector(".input-user");
const btnSelectImage = document.querySelector(".btn-select-image");
const avatarContainer = document.querySelector(".avatar-upload-container");
const avatarPlaceholder = document.querySelector(".avatar-placeholder");
const sidebarAvatar = document.querySelector(".sidebar-avatar-img"); 
const sidebarAvatarIcon = document.getElementById("sidebar-avatar-icon-default");
const sidebarNameSpan = document.querySelector(".profile-sidebar-user .user-Name");

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

let pendingAvatarUrl = null; 
let hiddenFileInput;

function showView(viewToShow, activeLink = null) {
    allViews.forEach(view => {
        if(view) view.classList.add("hidden-view");
    });
    if (viewToShow) {
        viewToShow.classList.remove("hidden-view");
    }
    allNavLinks.forEach(link => {
        if(link) link.parentElement.classList.remove("active");
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

// Đặt trình nghe sự kiện hashchange ở ngoài để nó chỉ chạy MỘT LẦN
window.addEventListener("hashchange", () => {
    // Chỉ điều hướng nếu các phần tử profile tồn tại
    if (!profileView) return; 

    const currentHash = location.hash.replace("#", "");
    if (currentHash === "banking") {
        showView(bankingView, navBanking);
    } else if (currentHash === "address") {
        showView(addressView, navAddress);
    } else if (currentHash === "profile") {
        showView(profileView, navProfile); 
    }
});


// ===================================
// --- HÀM KHỞI TẠO CHÍNH ---
// ===================================

export function initProfilePage() {    
    // 1. Kiểm tra người dùng
    const checkUser = docdulieuLocalStorage("currentUser");
    if (Array.isArray(checkUser) && checkUser.length === 0) {
        location.hash = "home";
        return; 
    }

    // ===================================
    // --- QUY TRÌNH HỒ SƠ (PROFILE) ---
    // ===================================

    // --- 1. Tải dữ liệu Hồ Sơ ---
    function loadProfileData() {
        // Luôn đọc currentUser mới nhất
        const currentUser = docdulieuLocalStorage("currentUser");
        try {
            const loginUsername = currentUser.userName;
            const loginEmail = currentUser.email;

            // Điền thông tin đăng nhập
            if (loginUsername) {
                const usernameInput = document.getElementById("profile-username");
                if (usernameInput) usernameInput.value = loginUsername;
                // (SỬA) Ưu tiên fullName cho sidebar
                if (sidebarNameSpan) sidebarNameSpan.textContent = currentUser.fullName || loginUsername;
            }
            if (loginEmail) {
                const emailInput = document.getElementById("profile-email");
                if (emailInput) emailInput.value = loginEmail;
            }

            // Lấy thông tin TỪ OBJECT CURRENTUSER
            if (document.getElementById("fullname")) {
              document.getElementById("fullname").value = currentUser.fullName || '';
            }
            if (document.getElementById("phone")) {
              document.getElementById("phone").value = currentUser.phone || '';
            }
            if (document.getElementById("birthday")) {
              document.getElementById("birthday").value = currentUser.birthday || '';
            }
            
            if (currentUser.gender) {
                const genderInput = document.querySelector(`input[name="gender"][value="${currentUser.gender}"]`);
                if (genderInput) genderInput.checked = true;
            }

            // Hiển thị ảnh đại diện
            if (currentUser.avatarUrl) { 
                if (avatarPlaceholder) {
                    avatarPlaceholder.innerHTML = `<img src="${currentUser.avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                }
                if (sidebarAvatar) {
                    sidebarAvatar.src = currentUser.avatarUrl;
                    sidebarAvatar.style.display = 'block'; 
                }
                if (sidebarAvatarIcon) {
                    sidebarAvatarIcon.style.display = 'none'; 
                }
            } else {
                // Reset về mặc định nếu không có avatar
                if (avatarPlaceholder) {
                    avatarPlaceholder.innerHTML = `<i class="fa-solid fa-user"></i>`;
                }
                if (sidebarAvatar) {
                    sidebarAvatar.style.display = 'none'; 
                }
                if (sidebarAvatarIcon) {
                    sidebarAvatarIcon.style.display = 'block'; 
                }
            }
        } catch (error) {
            console.error("Không thể tải dữ liệu hồ sơ từ localStorage:", error);
        }
    }

    // --- 2. Xử lý Nút "Lưu" Hồ Sơ ---
    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault(); 
            // Luôn đọc currentUser và users mới nhất khi submit
            const currentUser = docdulieuLocalStorage("currentUser");
            let users = docdulieuLocalStorage("users");

            // 1. Lấy dữ liệu text từ form
            const fullName = document.getElementById("fullname").value;
            const phone = document.getElementById("phone").value;
            const birthday = document.getElementById("birthday").value;
            const gender = document.querySelector('input[name="gender"]:checked').value;

            // 2. Tìm index của user hiện tại
            const userIndex = users.findIndex(user => user.userName === currentUser.userName);

            // 3. Cập nhật object 'currentUser'
            currentUser.fullName = fullName;
            currentUser.phone = phone;
            currentUser.birthday = birthday;
            currentUser.gender = gender;
            
            // 4. Kiểm tra và lưu ảnh đại diện (nếu có)
            if (pendingAvatarUrl) {
                currentUser.avatarUrl = pendingAvatarUrl; 
                pendingAvatarUrl = null; // Reset
            }

            // 5. Đồng bộ user trong mảng 'users'
            if (userIndex > -1) {
                // Cập nhật toàn bộ object user trong mảng
                users[userIndex] = { ...users[userIndex], ...currentUser };
            }
            
            // 6. LƯU CẢ 2 KEY TRỞ LẠI LOCALSTORAGE
            ghidulieuLocalStorage("currentUser", currentUser);
            ghidulieuLocalStorage("users", users);
            
            alert("Đã lưu thông tin hồ sơ thành công!");
            // (SỬA) Tải lại tên trên sidebar
            if (sidebarNameSpan) sidebarNameSpan.textContent = currentUser.fullName || currentUser.userName;
        });
    }

    // --- 3. Xử lý Nút "Chọn Ảnh" ---
    if (avatarContainer && !hiddenFileInput) { // Chỉ tạo 1 lần
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
                    alert("Dung lượng file quá lớn! Vui lòng chọn file dưới 1 MB.");
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

    // ===================================
    // --- QUY TRÌNH NGÂN HÀNG (BANKING) ---
    // ===================================

    // --- 1. Hiển thị danh sách Ngân Hàng ---
    function renderBankingList() {
        const currentUser = docdulieuLocalStorage("currentUser");
        const bankListData = currentUser.bankingList || [];

        if (bankListData.length === 0) {
            if (bankingEmpty) bankingEmpty.style.display = "flex";
            if (bankingList) bankingList.style.display = "none";
            return;
        }

        if (bankingEmpty) bankingEmpty.style.display = "none";
        if (bankingList) bankingList.style.display = "flex";
        bankingList.innerHTML = ""; 
        
        bankListData.forEach(bank => {
            const bankCard = document.createElement("div");
            bankCard.className = "bank-card";
            bankCard.dataset.id = bank.account; 
            const maskedAccount = `**** **** **** ${bank.account.slice(-4)}`;
            const defaultTag = bank.isDefault ? '<span class="bank-card-default">Mặc định</span>' : '';

            bankCard.innerHTML = `
                <div class="bank-card-info">
                    <span class="bank-name">${bank.name} ${defaultTag}</span>
                    <span class="bank-holder">${bank.holderName}</span>
                    <span class="bank-number">${maskedAccount}</span>
                </div>
                <div class="bank-card-actions">
                    <button type="button" class="btn-link btn-delete-bank">Xóa</button>
                </div>
            `;
            bankingList.appendChild(bankCard);
        });
    }

    // --- 2. Xử lý Thêm Ngân Hàng ---
    if (addBankForm) {
        addBankForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            let currentUser = docdulieuLocalStorage("currentUser");
            let users = docdulieuLocalStorage("users");
            const userIndex = users.findIndex(u => u.userName === currentUser.userName);

            const bankNameSelect = addBankForm.querySelector("#bank-name");
            const bankName = bankNameSelect.options[bankNameSelect.selectedIndex].text;
            const bankAccount = addBankForm.querySelector("#bank-account").value;
            const bankHolderName = addBankForm.querySelector("#bank-holder-name").value;
            const isDefault = addBankForm.querySelector("#bank-default").checked;

            if (!currentUser.bankingList) {
                currentUser.bankingList = [];
            }
            const bankListData = currentUser.bankingList;

            if (bankListData.some(bank => bank.account === bankAccount)) {
                alert("Số tài khoản này đã tồn tại!");
                return;
            }
            if (isDefault) {
                bankListData.forEach(bank => bank.isDefault = false);
            }
            bankListData.push({
                name: bankName,
                account: bankAccount,
                holderName: bankHolderName,
                isDefault: isDefault
            });

            if (userIndex > -1) {
                users[userIndex] = currentUser; 
            }
            ghidulieuLocalStorage("currentUser", currentUser);
            ghidulieuLocalStorage("users", users);
            
            addBankForm.reset();
            cmndForm.reset(); 
            alert("Đã thêm tài khoản ngân hàng thành công!");
            closeModal();
            renderBankingList(); 
        });
    }

    // --- 3. Xử lý Xóa Ngân Hàng ---
    if (bankingList) {
        bankingList.addEventListener("click", function (e) {
            if (e.target.classList.contains("btn-delete-bank")) {
                if (confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
                    
                    let currentUser = docdulieuLocalStorage("currentUser");
                    let users = docdulieuLocalStorage("users");
                    const userIndex = users.findIndex(u => u.userName === currentUser.userName);
                    
                    const card = e.target.closest(".bank-card");
                    const idToDelete = card.dataset.id;
                    
                    let bankListData = currentUser.bankingList || [];
                    const wasDefault = bankListData.find(bank => bank.account === idToDelete)?.isDefault;
                    
                    currentUser.bankingList = bankListData.filter(bank => bank.account !== idToDelete);

                    if (wasDefault && currentUser.bankingList.length > 0) {
                        currentUser.bankingList[0].isDefault = true;
                    }

                    if (userIndex > -1) {
                        users[userIndex] = currentUser;
                    }
                    ghidulieuLocalStorage("currentUser", currentUser);
                    ghidulieuLocalStorage("users", users);
                    
                    renderBankingList();
                }
            }
        });
    }

    // ===================================
    // --- QUY TRÌNH ĐỊA CHỈ (ADDRESS) ---
    // ===================================

    // --- 1. Hiển thị danh sách Địa Chỉ ---
    function renderAddressList() {
        const currentUser = docdulieuLocalStorage("currentUser");
        const addressListData = currentUser.addressList || [];

        if (addressListData.length === 0) {
            if (addressEmpty) addressEmpty.style.display = "flex";
            if (addressList) addressList.style.display = "none"; 
            return;
        }

        if (addressEmpty) addressEmpty.style.display = "none";
        if (addressList) addressList.style.display = "flex";
        addressList.innerHTML = ""; 

        // (SỬA) Dùng chính nội dung địa chỉ làm ID để xóa an toàn hơn
        addressListData.forEach((addr) => {
            const addressCard = document.createElement("div");
            addressCard.className = "address-card";
            addressCard.dataset.id = addr.specific; // Dùng địa chỉ làm ID
            const defaultTag = addr.isDefault ? '<span class="address-card-default">Mặc định</span>' : '';

            addressCard.innerHTML = `
                <div class="address-card-info">
                    <span class="user-name">${addr.fullName} ${defaultTag}</span>
                    <span class="user-phone">SĐT: ${addr.phone}</span>
                    <span class="user-address">Địa chỉ: ${addr.specific}</span>
                </div>
                <div class="address-card-actions">
                    <button type="button" class="btn-link btn-delete-address">Xóa</button>
                </div>
            `;
            addressList.appendChild(addressCard);
        });
    }

    // --- 2. Xử lý Thêm Địa Chỉ ---
    if (addAddressForm) {
        addAddressForm.addEventListener("submit", (e) => {
            e.preventDefault();

            let currentUser = docdulieuLocalStorage("currentUser");
            let users = docdulieuLocalStorage("users");
            const userIndex = users.findIndex(u => u.userName === currentUser.userName);

            const profileFullName = currentUser.fullName;
            const profilePhone = currentUser.phone;
            
            if (!profileFullName || !profilePhone) {
                alert("Vui lòng cập nhật Tên và Số điện thoại trong Hồ Sơ của bạn trước khi thêm địa chỉ.");
                showView(profileView, navProfile); 
                return; 
            }
            
            const specific = addAddressForm.querySelector("#addr-specific").value;
            const isDefault = addAddressForm.querySelector("#addr-default").checked;
            
            if (!currentUser.addressList) {
                currentUser.addressList = [];
            }
            let addressListData = currentUser.addressList;

            if (addressListData.some(addr => addr.specific.toLowerCase() === specific.toLowerCase())) {
                alert("Địa chỉ này đã tồn tại!");
                return;
            }
            if (isDefault) {
                addressListData.forEach(addr => addr.isDefault = false);
            }
            addressListData.push({
                fullName: profileFullName,
                phone: profilePhone,
                specific: specific,
                isDefault: isDefault
            });

            if (userIndex > -1) {
                users[userIndex] = currentUser;
            }
            ghidulieuLocalStorage("currentUser", currentUser);
            ghidulieuLocalStorage("users", users);
            
            addAddressForm.reset();
            alert("Đã thêm địa chỉ mới thành công!");
            closeModal();
            renderAddressList(); 
        });
    }

    // --- 3. Xử lý Xóa Địa Chỉ ---
    if (addressList) {
        addressList.addEventListener("click", function (e) {
            if (e.target.classList.contains("btn-delete-address")) {
                if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
                    
                    let currentUser = docdulieuLocalStorage("currentUser");
                    let users = docdulieuLocalStorage("users");
                    const userIndex = users.findIndex(u => u.userName === currentUser.userName);

                    const card = e.target.closest(".address-card");
                    const idToDelete = card.dataset.id; // Lấy ID là nội dung địa chỉ
                    
                    let addressListData = currentUser.addressList || [];
                    const wasDefault = addressListData.find(addr => addr.specific === idToDelete)?.isDefault;
                    
                    // (SỬA) Lọc theo ID (nội dung địa chỉ)
                    currentUser.addressList = addressListData.filter(addr => addr.specific !== idToDelete);

                    if (wasDefault && currentUser.addressList.length > 0) {
                        currentUser.addressList[0].isDefault = true;
                    }

                    if (userIndex > -1) {
                        users[userIndex] = currentUser;
                    }
                    ghidulieuLocalStorage("currentUser", currentUser);
                    ghidulieuLocalStorage("users", users);
                    
                    renderAddressList();
                }
            }
        });
    }

    // ===================================
    // --- SỰ KIỆN MỞ/ĐÓNG MODAL ---
    // ===================================
    
    // --- Xử lý Nút mở Modal ---
    if (btnOpenCmndModal) {
        btnOpenCmndModal.addEventListener("click", () => {
            openModal(cmndModal);
        });
    }

    if (btnOpenAddressModal) {
        btnOpenAddressModal.addEventListener("click", () => {
            openModal(addAddressModal);
        });
    }

    // --- Xử lý Nút "Trở Lại" & Overlay ---
    if (modalOverlay) {
        modalOverlay.addEventListener("click", () => closeModal());
    }
    if (cmndModalBack) {
        cmndModalBack.addEventListener("click", () => closeModal());
    }
    if (addBankModalBack) {
        addBankModalBack.addEventListener("click", () => {
            closeModal();
            openModal(cmndModal); // Quay lại modal CMND
        });
    }
    if (addAddressModalBack) {
        addAddressModalBack.addEventListener("click", () => closeModal());
    }

    // --- Xử lý Submit Form CMND (để chuyển qua Form Bank) ---
    if (cmndForm) {
        cmndForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // Đóng modal CMND và mở modal Thêm Ngân Hàng
            closeModal();
            openModal(addBankModal);
        });
    }

    // ===================================
    // --- CHẠY LẦN ĐẦU KHI TẢI TRANG ---
    // ===================================
    
    loadProfileData();   
    renderBankingList(); 
    renderAddressList(); 

    // (MỚI) Kiểm tra hash ngay khi tải để hiển thị đúng tab
    const initialHash = location.hash.replace("#", "");
    if (initialHash === "banking") {
        showView(bankingView, navBanking);
    } else if (initialHash === "address") {
        showView(addressView, navAddress);
    } else {
        // Mặc định là profile (hoặc nếu hash là #profile)
        showView(profileView, navProfile); 
    }
}