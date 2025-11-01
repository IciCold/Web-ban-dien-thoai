document.addEventListener("DOMContentLoaded", () => {
    
    // ===================================
    // --- KHAI BÁO BIẾN ---
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
    
    // Lấy cả thẻ ảnh và icon
    const sidebarAvatar = document.querySelector(".sidebar-avatar-img"); 
    const sidebarAvatarIcon = document.getElementById("sidebar-avatar-icon-default");
    
    let pendingAvatarUrl = null; // Biến tạm để giữ ảnh chờ lưu

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

    // --- 1. Tải dữ liệu Hồ Sơ ---
    function loadProfileData() {
        try {
            const savedName = localStorage.getItem("userFullName");
            const savedPhone = localStorage.getItem("userPhone");
            const savedBirthday = localStorage.getItem("userBirthday");
            const savedGender = localStorage.getItem("userGender");
            const savedAvatarUrl = localStorage.getItem("userAvatarUrl"); 

            if (savedName) document.getElementById("fullname").value = savedName;
            if (savedPhone) document.getElementById("phone").value = savedPhone;
            if (savedBirthday) document.getElementById("birthday").value = savedBirthday;
            if (savedGender) {
                const genderInput = document.querySelector(`input[name="gender"][value="${savedGender}"]`);
                if (genderInput) genderInput.checked = true;
            }

            // Hiển thị ảnh đại diện đã lưu (nếu có)
            if (savedAvatarUrl) {
                if (avatarPlaceholder) {
                    avatarPlaceholder.innerHTML = `<img src="${savedAvatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                }
                if (sidebarAvatar) {
                    sidebarAvatar.src = savedAvatarUrl;
                    sidebarAvatar.style.display = 'block'; // Hiện ảnh
                }
                if (sidebarAvatarIcon) {
                    sidebarAvatarIcon.style.display = 'none'; // Ẩn icon
                }
            } else {
                // Không có ảnh, hiển thị icon
                if (sidebarAvatar) {
                    sidebarAvatar.style.display = 'none'; // Ẩn ảnh
                }
                if (sidebarAvatarIcon) {
                    sidebarAvatarIcon.style.display = 'block'; // Hiện icon
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
            
            // Lấy dữ liệu text
            const fullName = document.getElementById("fullname").value;
            const phone = document.getElementById("phone").value;
            const birthday = document.getElementById("birthday").value;
            const gender = document.querySelector('input[name="gender"]:checked').value;

            // Lưu dữ liệu text
            localStorage.setItem("userFullName", fullName);
            localStorage.setItem("userPhone", phone);
            localStorage.setItem("userBirthday", birthday);
            localStorage.setItem("userGender", gender);
            
            // Kiểm tra và lưu ảnh đại diện nếu có
            if (pendingAvatarUrl) {
                localStorage.setItem("userAvatarUrl", pendingAvatarUrl);
                
                if (sidebarAvatar) {
                    sidebarAvatar.src = pendingAvatarUrl;
                    sidebarAvatar.style.display = 'block'; // Hiện ảnh
                }
                if (sidebarAvatarIcon) {
                    sidebarAvatarIcon.style.display = 'none'; // Ẩn icon
                }
                
                pendingAvatarUrl = null;
            }
            
            alert("Đã lưu thông tin hồ sơ thành công!");
        });
    }

    // --- 3. Xử lý Nút "Chọn Ảnh" ---
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
    // ===================================

    // --- 1. Hiển thị danh sách Ngân Hàng ---
    function renderBankingList() {
        const bankListData = JSON.parse(localStorage.getItem("userBankingList") || "[]");

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
            
            const bankNameSelect = addBankForm.querySelector("#bank-name");
            const bankName = bankNameSelect.options[bankNameSelect.selectedIndex].text;
            const bankAccount = addBankForm.querySelector("#bank-account").value;
            const bankHolderName = addBankForm.querySelector("#bank-holder-name").value;
            const isDefault = addBankForm.querySelector("#bank-default").checked;

            const bankListData = JSON.parse(localStorage.getItem("userBankingList") || "[]");

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

            localStorage.setItem("userBankingList", JSON.stringify(bankListData));
            
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
                    
                    let bankListData = JSON.parse(localStorage.getItem("userBankingList") || "[]");
                    const wasDefault = bankListData.find(bank => bank.account === idToDelete)?.isDefault;

                    bankListData = bankListData.filter(bank => bank.account !== idToDelete);

                    if (wasDefault && bankListData.length > 0) {
                        bankListData[0].isDefault = true;
                    }

                    localStorage.setItem("userBankingList", JSON.stringify(bankListData));
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
        const addressListData = JSON.parse(localStorage.getItem("userAddressList") || "[]");

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

            const profileFullName = localStorage.getItem("userFullName");
            const profilePhone = localStorage.getItem("userPhone");
            
            if (!profileFullName || !profilePhone) {
                alert("Vui lòng cập nhật Tên và Số điện thoại trong Hồ Sơ của bạn trước khi thêm địa chỉ.");
                return; 
            }

            const specific = addAddressForm.querySelector("#addr-specific").value;
            const isDefault = addAddressForm.querySelector("#addr-default").checked;
            
            let addressListData = JSON.parse(localStorage.getItem("userAddressList") || "[]");

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

            localStorage.setItem("userAddressList", JSON.stringify(addressListData));
            
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
                    
                    let addressListData = JSON.parse(localStorage.getItem("userAddressList") || "[]");
                    const wasDefault = addressListData.find(addr => addr.specific === idToDelete)?.isDefault;
                    
                    addressListData = addressListData.filter(addr => addr.specific !== idToDelete);

                    if (wasDefault && addressListData.length > 0) {
                        addressListData[0].isDefault = true;
                    }

                    localStorage.setItem("userAddressList", JSON.stringify(addressListData));
                    renderAddressList();
                }
            }
        });
    }

    // ===================================
    // --- KHỞI TẠO VÀ SỰ KIỆN KHÁC ---
    // ===================================

    // --- Gắn Sự Kiện Cho Sidebar ---
    if(navProfile) navProfile.addEventListener("click", (e) => { 
        e.preventDefault(); 
        showView(profileView, navProfile);
        // ✅ THÊM: Cập nhật hash nhưng không reload page
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
    // ===================================
    
    loadProfileData();   // Tải thông tin Hồ Sơ và ảnh đại diện
    renderBankingList(); // Tải và vẽ danh sách Ngân Hàng
    renderAddressList(); // Tải và vẽ danh sách Địa Chỉ
    
    // ✅ THÊM: Kiểm tra hash để hiển thị đúng tab khi load
    const currentHash = location.hash.replace("#", "");
    if (currentHash === "banking") {
        showView(bankingView, navBanking);
    } else if (currentHash === "address") {
        showView(addressView, navAddress);
    } else {
        showView(profileView, navProfile); // Mặc định hiển thị Hồ Sơ
    }
});


const haveUser = JSON.parse(localStorage.getItem("currentUser"));
const headerUserName = document.querySelector(".top-bar .user-name");
console.log(haveUser);
if(haveUser && headerUserName   ){
    headerUserName.addEventListener('click', () => {
        location.hash = "profile";
    });
}   