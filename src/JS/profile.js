// ===================================
// --- (MỚI) IMPORT HÀM ĐỌC/GHI ---
// ===================================
import { docdulieuLocalStorage, ghidulieuLocalStorage } from './readandwrite.js';


export function initProfilePage() {
    
    // ===================================
    // --- (SỬA LỖI) HÀNG RÀO BẢO VỆ ---
    // ===================================
    // (SỬA) Sử dụng helper để đọc currentUser
    const currentUser = docdulieuLocalStorage("currentUser"); //
    
    // (SỬA) Kiểm tra nếu currentUser là mảng rỗng [] (tức là không tìm thấy)
    if (Array.isArray(currentUser) && currentUser.length === 0) {
        location.hash = "home";
        return; 
    }
    // ===================================
    // --- (KẾT THÚC SỬA LỖI) ---
    // ===================================


    // ===================================
    // --- KHAI BÁO BIẾN ---
    // (Giữ nguyên như file gốc)
    // ===================================

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

    let pendingAvatarUrl = null; 

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

    // ===================================
    // --- CÁC HÀM CHUNG ---
    // (Giữ nguyên như file gốc)
    // ===================================

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

    // ===================================
    // --- QUY TRÌNH HỒ SƠ (PROFILE) ---
    // ===================================

    // --- 1. Tải dữ liệu Hồ Sơ (ĐÃ SỬA) ---
    function loadProfileData() {
        try {
            // (currentUser đã được khai báo ở guard clause bên trên)
            const loginUsername = currentUser.userName;
            const loginEmail = currentUser.email;

            // Điền thông tin đăng nhập
            if (loginUsername) {
                const usernameInput = document.getElementById("profile-username");
                if (usernameInput) usernameInput.value = loginUsername;
                if (sidebarNameSpan) sidebarNameSpan.textContent = loginUsername;
            }
            if (loginEmail) {
                const emailInput = document.getElementById("profile-email");
                if (emailInput) emailInput.value = loginEmail;
            }

            // (SỬA) Lấy thông tin TỪ OBJECT CURRENTUSER
            // Dùng "|| ''" để tránh hiển thị "undefined" nếu user mới đăng ký
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

            // (SỬA) Hiển thị ảnh đại diện (đọc từ currentUser.avatarUrl)
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

    // --- 2. Xử lý Nút "Lưu" Hồ Sơ (ĐÃ SỬA) ---
    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault(); 
            
            // 1. Lấy dữ liệu text từ form
            const fullName = document.getElementById("fullname").value;
            const phone = document.getElementById("phone").value;
            const birthday = document.getElementById("birthday").value;
            const gender = document.querySelector('input[name="gender"]:checked').value;

            // 2. (SỬA) Lấy mảng 'users' bằng helper
            let users = docdulieuLocalStorage("users"); //

            // 3. Tìm index của user hiện tại
            const userIndex = users.findIndex(user => user.userName === currentUser.userName);

            // 4. Cập nhật object 'currentUser' (object tự động tạo key mới khi không có sẵn key)
            currentUser.fullName = fullName;
            currentUser.phone = phone;
            currentUser.birthday = birthday;
            currentUser.gender = gender;
            
            // 5. Cập nhật user trong mảng 'users'
            if (userIndex > -1) {
                users[userIndex].fullName = fullName;
                users[userIndex].phone = phone;
                users[userIndex].birthday = birthday;
                users[userIndex].gender = gender;
            }
            
            // 6. Kiểm tra và lưu ảnh đại diện (nếu có)
            if (pendingAvatarUrl) {
                currentUser.avatarUrl = pendingAvatarUrl; 
                if (userIndex > -1) {
                    users[userIndex].avatarUrl = pendingAvatarUrl;
                }
                
                if (sidebarAvatar) {
                    sidebarAvatar.src = pendingAvatarUrl;
                    sidebarAvatar.style.display = 'block'; 
                }
                if (sidebarAvatarIcon) {
                    sidebarAvatarIcon.style.display = 'none'; 
                }
                pendingAvatarUrl = null;
            }
            
            // 7. (SỬA) LƯU CẢ 2 KEY TRỞ LẠI LOCALSTORAGE BẰNG HELPER
            ghidulieuLocalStorage("currentUser", currentUser); //
            ghidulieuLocalStorage("users", users); //

            // Xóa các key localStorage cũ (nếu có)
            localStorage.removeItem("userFullName");
            localStorage.removeItem("userPhone");
            localStorage.removeItem("userBirthday");
            localStorage.removeItem("userGender");
            localStorage.removeItem("userAvatarUrl");
            
            alert("Đã lưu thông tin hồ sơ thành công!");
        });
    }

    // --- 3. Xử lý Nút "Chọn Ảnh" ---
    // (Giữ nguyên như file gốc)
    let hiddenFileInput;
    if (avatarContainer) {
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
    // (ĐÃ SỬA)
    // ===================================

    // --- 1. Hiển thị danh sách Ngân Hàng ---
    function renderBankingList() {
        // (SỬA) Dùng helper
        const bankListData = docdulieuLocalStorage("userBankingList"); //

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
            const maskedAccount = `**** **** **** ${bank.account.slice(-3)}`; // Sửa thành -3
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
            
            const bankNameSelect = addBankForm.querySelector("#bank-name");
            const bankName = bankNameSelect.options[bankNameSelect.selectedIndex].text;
            const bankAccount = addBankForm.querySelector("#bank-account").value;
            const bankHolderName = addBankForm.querySelector("#bank-holder-name").value;
            const isDefault = addBankForm.querySelector("#bank-default").checked;

            // (SỬA) Dùng helper
            const bankListData = docdulieuLocalStorage("userBankingList"); //

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

            // (SỬA) Dùng helper
            ghidulieuLocalStorage("userBankingList", bankListData); //
            
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
                    const card = e.target.closest(".bank-card");
                    const idToDelete = card.dataset.id;
                    
                    // (SỬA) Dùng helper
                    let bankListData = docdulieuLocalStorage("userBankingList"); //
                    const wasDefault = bankListData.find(bank => bank.account === idToDelete)?.isDefault;
                    bankListData = bankListData.filter(bank => bank.account !== idToDelete);

                    if (wasDefault && bankListData.length > 0) {
                        bankListData[0].isDefault = true;
                    }

                    // (SỬA) Dùng helper
                    ghidulieuLocalStorage("userBankingList", bankListData); //
                    renderBankingList();
                }
            }
        });
    }

    // ===================================
    // --- QUY TRÌNH ĐỊA CHỈ (ADDRESS) ---
    // (ĐÃ SỬA)
    // ===================================

    // --- 1. Hiển thị danh sách Địa Chỉ ---
    function renderAddressList() {
        // (SỬA) Dùng helper
        const addressListData = docdulieuLocalStorage("userAddressList"); //

        if (addressListData.length === 0) {
            if (addressEmpty) addressEmpty.style.display = "flex";
            if (addressList) addressList.style.display = "none"; 
            return;
        }

        if (addressEmpty) addressEmpty.style.display = "none";
        if (addressList) addressList.style.display = "flex";
        addressList.innerHTML = ""; 

        addressListData.forEach(addr => {
            const addressCard = document.createElement("div");
            addressCard.className = "address-card";
            addressCard.dataset.id = addr.specific;
            const defaultTag = addr.isDefault ? '<span class="address-card-default">Mặc định</span>' : '';

            // Bổ sung nội dung HTML đầy đủ vào đây
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

            // (SỬA) Lấy thông tin từ currentUser thay vì key lẻ
            const profileFullName = currentUser.fullName;
            const profilePhone = currentUser.phone;
            
            if (!profileFullName || !profilePhone) {
                alert("Vui lòng cập nhật Tên và Số điện thoại trong Hồ Sơ của bạn trước khi thêm địa chỉ.");
                return; 
            }

            const specific = addAddressForm.querySelector("#addr-specific").value;
            const isDefault = addAddressForm.querySelector("#addr-default").checked;
            
            // (SỬA) Dùng helper
            let addressListData = docdulieuLocalStorage("userAddressList"); //

            if (addressListData.some(addr => addr.specific === specific)) {
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

            // (SỬA) Dùng helper
            ghidulieuLocalStorage("userAddressList", addressListData); //
            
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
                    const card = e.target.closest(".address-card");
                    const idToDelete = card.dataset.id;
                    
                    // (SỬA) Dùng helper
                    let addressListData = docdulieuLocalStorage("userAddressList"); //
                    const wasDefault = addressListData.find(addr => addr.specific === idToDelete)?.isDefault;
                    addressListData = addressListData.filter(addr => addr.specific !== idToDelete);

                    if (wasDefault && addressListData.length > 0) {
                        addressListData[0].isDefault = true;
                    }

                    // (SỬA) Dùng helper
                    ghidulieuLocalStorage("userAddressList", addressListData); //
                    renderAddressList();
                }
            }
        });
    }

    // ===================================
    // --- KHỞI TẠO VÀ SỰ KIỆN KHÁC ---
    // (Giữ nguyên như file gốc)
    // ===================================

    // --- Gắn Sự Kiện Cho Sidebar ---
    if(navProfile) navProfile.addEventListener("click", (e) => { 
        e.preventDefault(); 
        showView(profileView, navProfile);
        history.replaceState(null, '', '#profile');
    });
    if(navBanking) navBanking.addEventListener("click", (e) => { 
        e.preventDefault(); 
        showView(bankingView, navBanking);
        history.replaceState(null, '', '#banking');
    });
    if(navAddress) navAddress.addEventListener("click", (e) => { 
        e.preventDefault(); 
        showView(addressView, navAddress);
        history.replaceState(null, '', '#address');
    });

    // --- Gắn Sự Kiện Mở Modal ---
    if (btnOpenCmndModal) btnOpenCmndModal.addEventListener("click", () => openModal(cmndModal));
    if (btnOpenAddressModal) btnOpenAddressModal.addEventListener("click", () => openModal(addAddressModal));
    
    // --- Gắn Sự Kiện Form CMND ---
    if (cmndForm) {
        cmndForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const cmndInput = document.getElementById("bank-cmnd");
            if (cmndInput.value.length === 10 && /^\d+$/.test(cmndInput.value)) {
                closeModal();
                openModal(addBankModal);
            } else {
                alert("Vui lòng nhập 10 số CMND.");
            }
        });
    }

    // --- Gắn Sự Kiện Nút "Trở Lại" & Overlay ---
    if (cmndModalBack) cmndModalBack.addEventListener("click", closeModal);
    if (addAddressModalBack) addAddressModalBack.addEventListener("click", closeModal);
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);
    if (addBankModalBack) {
        addBankModalBack.addEventListener("click", () => {
            closeModal();
            openModal(cmndModal); 
        });
    }

    // ===================================
    // --- CHẠY LẦN ĐẦU KHI TẢI TRANG ---
    // (Giữ nguyên như file gốc)
    // ===================================
    
    loadProfileData();   
    renderBankingList(); 
    renderAddressList(); 
    window.addEventListener("hashchange", () => {    const currentHash = location.hash.replace("#", "");
    if (currentHash === "banking") {
        showView(bankingView, navBanking);
    } else if (currentHash === "address") {
        showView(addressView, navAddress);
    } else {
        showView(profileView, navProfile); 
    }})

}