document.addEventListener("DOMContentLoaded", () => {
    // --- Navigational Links (Sidebar) ---
    const navProfile = document.getElementById("nav-profile-link");
    const navBanking = document.getElementById("nav-banking-link");
    const navAddress = document.getElementById("nav-address-link");

    // --- Views (Pages) ---
    const profileView = document.getElementById("profile-view");
    const bankingView = document.getElementById("banking-view");
    const addressView = document.getElementById("address-view");
    
    const allViews = [profileView, bankingView, addressView];
    const allNavLinks = [navProfile, navBanking, navAddress];
    
    // --- Bank List Containers ---
    const bankingEmpty = document.getElementById("banking-empty");
    const bankingList = document.getElementById("banking-list");

    // --- Modal Elements ---
    const modalOverlay = document.getElementById("bank-modal-overlay");
    const cmndModal = document.getElementById("cmnd-modal");
    const addBankModal = document.getElementById("add-bank-modal");

    // --- Modal Forms ---
    const cmndForm = document.getElementById("cmnd-form");
    const addBankForm = document.getElementById("add-bank-form");
    
    // --- Modal Buttons ---
    const btnOpenCmndModal = document.getElementById("btn-open-cmnd-modal");
    const cmndModalBack = document.getElementById("cmnd-modal-back");
    const addBankModalBack = document.getElementById("add-bank-modal-back");
    // (Đã xóa các biến cho nút "close")


    // --- Helper Function: Ẩn/hiện PAGE ---
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
    
    // --- Helper Functions: Mở/Đóng MODAL ---
    function openModal(modal) {
        if (modalOverlay) modalOverlay.classList.remove("hidden-view");
        if (modal) modal.classList.remove("hidden-view");
    }
    
    function closeModal() {
        if (modalOverlay) modalOverlay.classList.add("hidden-view");
        if (cmndModal) cmndModal.classList.add("hidden-view");
        if (addBankModal) addBankModal.classList.add("hidden-view");
    }

    // --- Gắn Sự Kiện Cho Sidebar ---
    if(navProfile) {
        navProfile.addEventListener("click", (e) => {
            e.preventDefault();
            showView(profileView, navProfile);
        });
    }
    
    if(navBanking) {
        navBanking.addEventListener("click", (e) => {
            e.preventDefault();
            showView(bankingView, navBanking);
        });
    }
    
    if(navAddress) {
        navAddress.addEventListener("click", (e) => {
            e.preventDefault();
            showView(addressView, navAddress);
        });
    }

    // --- Gắn Sự Kiện Cho Quy Trình Thêm Bank (MODAL) ---

    // 1. Click "+ Thêm Ngân Hàng" -> Mở Modal CMND
    if (btnOpenCmndModal) {
        btnOpenCmndModal.addEventListener("click", () => {
            openModal(cmndModal);
        });
    }

    // 2. Click "Hoàn Thành" trên form CMND
    if (cmndForm) {
        cmndForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const cmndInput = document.getElementById("bank-cmnd");
            if (cmndInput.value.length === 10 && /^\d+$/.test(cmndInput.value)) {
                // Hợp lệ: Đóng modal CMND, Mở modal Thêm Bank
                closeModal();
                openModal(addBankModal);
            } else {
                alert("Vui lòng nhập 10 số CMND.");
            }
        });
    }
    
    // 3. Click "Hoàn Thành" trên form Thêm Bank
    if (addBankForm) {
        addBankForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Lấy dữ liệu từ form
            const bankNameSelect = addBankForm.querySelector("#bank-name");
            const bankName = bankNameSelect.options[bankNameSelect.selectedIndex].text;
            const bankAccount = addBankForm.querySelector("#bank-account").value;
            const bankHolderName = addBankForm.querySelector("#bank-holder-name").value;
            const isDefault = addBankForm.querySelector("#bank-default").checked;

            const bankCard = document.createElement("div");
            bankCard.className = "bank-card";

            if (isDefault) {
                const currentDefault = bankingList.querySelector(".bank-card-default");
                if (currentDefault) {
                    currentDefault.remove();
                }
            }
            
            const maskedAccount = `**** **** **** ${bankAccount.slice(-4)}`;

            bankCard.innerHTML = `
                <div class="bank-card-info">
                    <span class="bank-name">${bankName} ${isDefault ? '<span class="bank-card-default">Mặc định</span>' : ''}</span>
                    <span class="bank-holder">${bankHolderName}</span>
                    <span class="bank-number">${maskedAccount}</span>
                </div>
                <div class="bank-card-actions">
                    <button type="button" class="btn-link btn-delete-bank">Xóa</button>
                </div>
            `;
            
            bankingList.appendChild(bankCard);

            // Ẩn text "Bạn chưa có..." và Hiện danh sách bank
            if (bankingEmpty) bankingEmpty.style.display = "none";
            if (bankingList) bankingList.style.display = "flex";
            
            // Reset cả 2 form
            addBankForm.reset();
            cmndForm.reset();

            alert("Đã thêm tài khoản ngân hàng thành công!");
            
            // Đóng tất cả modal
            closeModal();
        });
    }

    // --- Gắn Sự Kiện Xóa Bank ---
    if (bankingList) {
        bankingList.addEventListener("click", function (e) {
            if (e.target.classList.contains("btn-delete-bank")) {
                if (confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
                    const card = e.target.closest(".bank-card");
                    if (card) {
                        card.remove();
                    }

                    if (bankingList.children.length === 0) {
                        if (bankingEmpty) bankingEmpty.style.display = "flex";
                        if (bankingList) bankingList.style.display = "none";
                    }
                }
            }
        });
    }

    // --- Gắn Sự Kiện Đóng/Trở Lại cho Modals ---
    if (modalOverlay) modalOverlay.addEventListener("click", closeModal);
    // (Đã xóa listener cho cmndModalClose)
    if (cmndModalBack) cmndModalBack.addEventListener("click", closeModal);
    // (Đã xóa listener cho addBankModalClose)
    
    // Nút "Trở Lại" của Modal 2 sẽ quay về Modal 1
    if (addBankModalBack) {
        addBankModalBack.addEventListener("click", () => {
            closeModal();
            openModal(cmndModal);
        });
    }


    // --- Thiết lập trạng thái ban đầu ---
    showView(profileView, navProfile);

    // Kiểm tra ban đầu xem có bank nào không
    if (bankingList && bankingList.children.length > 0) {
        if (bankingEmpty) bankingEmpty.style.display = "none";
        if (bankingList) bankingList.style.display = "flex";
    } else {
        if (bankingEmpty) bankingEmpty.style.display = "flex";
        if (bankingList) bankingList.style.display = "none";
    }
});