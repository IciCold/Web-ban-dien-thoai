// ds_khachHang.js
import {showalert} from "../../JS/alert.js";
import { docdulieuLocalStorage, ghidulieuLocalStorage } from "./readandwrite.js";
export function loadCustomerList() {
    const customerSection = document.getElementById('ds_khachHang');
    if (!customerSection) return;

    // Lấy dữ liệu users từ localStorage
    const users = docdulieuLocalStorage("users") || [];
    const tableBody = customerSection.querySelector('.kh-table tbody');
    
    if (!tableBody) return;

    // Xóa dữ liệu cũ
    tableBody.innerHTML = '';
    // Thêm dữ liệu mớis
    users.forEach((user, index) => {
        const locked = user.locked;
        //const lockIcon = locked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';
        const lockTitle = locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.fullName || 'Chưa cài đặt'}</td>
            <td>${user.userName || 'N/A'}</td>
            <td>******</td> <!-- Không hiển thị mật khẩu thật -->
            <td>${user.registrationDate || new Date().toLocaleDateString('vi-VN')}</td>
            <td class = "kh-methods">
                <button class="kh-details" data-index="${index}">Chi tiết</button>
                <button class="kh-reset" data-index="${index}">Reset mật khẩu</button>
                <button class="kh-lock" data-index="${index}" title="${lockTitle}">
                <i class="fa-solid fa-lock"></i>
                <i class="fa-solid fa-lock-open"></i>
                ${lockTitle}</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    ghidulieuLocalStorage("users",users);

    // Gắn sự kiện khóa/mở khóa
    attachLockEvents();
    // Gắn sự kiện sửa
    attachDetailsEvents();

    attachResetEvents();
}

function attachLockEvents() {
    const lockButtons = document.querySelectorAll('.kh-lock');
    lockButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'), 10);
            toggleLock(index);
        });
    });
}

function attachDetailsEvents() {
    const editButtons = document.querySelectorAll('.kh-details');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            detailsCustomer(index);
        });
    });
}

function attachResetEvents() {
    const resetButtons = document.querySelectorAll('.kh-reset');
    resetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            resetpassword(index);
        });
    });
}


function toggleLock(index) {
    const users = docdulieuLocalStorage("users") || [];
    const user = users[index];
    if (!user) return;

    const currentlyLocked = user.locked;
    const confirmMsg = currentlyLocked ? 'Bạn có chắc muốn mở khóa tài khoản này?' : 'Bạn có chắc muốn khóa tài khoản này? (Tài khoản sẽ bị vô hiệu hóa nhưng không bị xóa)';
    if (!confirm(confirmMsg)) return;

    user.locked = !currentlyLocked;
    ghidulieuLocalStorage("users",users);
    
    // Reload danh sách
    loadCustomerList();
    showalert(currentlyLocked ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.');
}

function detailsCustomer(index) {
    const users = docdulieuLocalStorage("users") || [];
    const user = users[index];
    if (!user) return;
    // Kiểm tra nếu popup cũ đã tồn tại thì xóa
    const oldPopup = document.querySelector('.details-popup');
    if (oldPopup) oldPopup.remove();

    // Tạo popup mới
    const popup = document.createElement('div');
    popup.classList.add('kh-details-popup');
    popup.innerHTML = `
        <div class="popup-header">Thông tin khách hàng</div>
        <div class="popup-body">
            <p><strong>Họ tên:</strong> ${user.fullName || 'Chưa cài đặt'}</p>
            <p><strong>Username:</strong> ${user.userName || 'N/A'}</p>
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Địa chỉ nhà:</strong><br> 
            ${user.addressList.map(a => a.specific).join('<br>')}
            </p>
            <p><strong>Tài khoản ngân hàng:</strong><br>
            ${user.bankingList.map(b => 
            `${b.account} ${b.holderName}<br>${b.name}`
            ).join('<br><br>')}
            </p> 
            <p><strong>Ngày đăng ký:</strong> ${user.registrationDate || 'N/A'}</p>
            <button class="close-popup">Đóng</button>
        </div>
    `;
    document.body.appendChild(popup);

    popup.querySelector('.close-popup').addEventListener('click', () => {
        popup.remove();
    });

    let isDragging = false;
    let offsetX, offsetY;

    const header = popup.querySelector('.popup-header');

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - popup.getBoundingClientRect().left;
        offsetY = e.clientY - popup.getBoundingClientRect().top;
        popup.style.cursor = 'grabbing';
    });


    // Khi di chuột
    document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    popup.style.left = e.clientX - offsetX + 'px';
    popup.style.top = e.clientY - offsetY + 'px';
    popup.style.transform = 'none'; // bỏ transform khi di chuyển
    });

    // Khi thả chuột
    document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        popup.style.cursor = 'grab';
    }
    });
    
    
    showalert('Hiển thị thông tin thành công!',"success");
}

function resetpassword(index) {
    const users = docdulieuLocalStorage("users") || [];
    const user = users[index];
    if (!user) return;

    // Xóa popup cũ nếu có
    document.querySelectorAll('.popup-overlay, .reset-popup').forEach(el => el.remove());

    // Tạo overlay
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    document.body.appendChild(overlay);

    // Tạo popup
    const popup = document.createElement('div');
    popup.classList.add('kh-reset-popup');
    popup.innerHTML = `
        <p>Bạn có chắc muốn reset mật khẩu không?</p>
        <div class="button-group">
            <button class="yes">Có</button>
            <button class="no">Không</button>
        </div>
    `;
    document.body.appendChild(popup);

    // Nút “Có”
    popup.querySelector('.yes').addEventListener('click', () => {
        user.password = '123'; // reset
        ghidulieuLocalStorage("users", users);
        overlay.remove();
        popup.remove();
        showalert('Reset password thành công!', "success");
    });

    // Nút “Không”
    popup.querySelector('.no').addEventListener('click', () => {
        overlay.remove();
        popup.remove();
    });
}


// Tìm kiếm khách hàng
export function setupCustomerSearch() {
    const searchForm = document.querySelector('.kh-search-form');
    if (!searchForm) return;

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nameInput = this.querySelector('input[type="text"]');
        const usernameInput = this.querySelectorAll('input[type="text"]')[1];
        
        searchCustomers(nameInput.value, usernameInput.value);
    });
}

function searchCustomers(name, username) {
    const users = docdulieuLocalStorage("users");
    const tableBody = document.querySelector('.kh-table tbody');
    
    if (!tableBody) return;

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchName = !name || (user.fullName && user.fullName.toLowerCase().includes(name.toLowerCase()));
        const matchUsername = !username || (user.userName && user.userName.toLowerCase().includes(username.toLowerCase()));
        return matchName && matchUsername;
    });

    /*// Hiển thị kết quả
    tableBody.innerHTML = '';
    filteredUsers.forEach((user) => {
        const originalIndex = users.findIndex(u => u.userName === user.userName);
        const locked = user.locked === true;
        const lockIcon = locked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';
        const lockTitle = locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.userName}</td>
            <td>${user.email}</td>
            <td>******</td>
            <td>${user.registrationDate || 'N/A'}</td>
            <td>
                <button class="kh-lock" data-index="${originalIndex}" title="${lockTitle}">${lockIcon}</button>
                <button class="kh-edit" data-index="${originalIndex}">Sửa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });*/

    // Xóa dữ liệu cũ
    tableBody.innerHTML = '';
    // Thêm dữ liệu mớis
    filteredUsers.forEach((user, index) => {
        const locked = user.locked;
        //const lockIcon = locked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';
        const lockTitle = locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.fullName || 'Chưa cài đặt'}</td>
            <td>${user.userName || 'N/A'}</td>
            <td>******</td> <!-- Không hiển thị mật khẩu thật -->
            <td>${user.registrationDate || new Date().toLocaleDateString('vi-VN')}</td>
            <td class = "kh-methods">
                <button class="kh-details" data-index="${index}">Chi tiết</button>
                <button class="kh-reset" data-index="${index}">Reset mật khẩu</button>
                <button class="kh-lock" data-index="${index}" title="${lockTitle}">
                <i class="fa-solid fa-lock"></i>
                <i class="fa-solid fa-lock-open"></i>
                ${lockTitle}</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Re-attach events
    attachLockEvents();
    attachDetailsEvents();
    attachResetEvents();
}
const resettimkiem = document.querySelector('.kh-search-form #resettimkh');
resettimkiem.addEventListener('click',e=>{
    const tableBody = document.querySelector('.kh-table tbody');
    tableBody.innerHTML='';
    loadCustomerList();
});

//innerHTML = '' vs .reset()