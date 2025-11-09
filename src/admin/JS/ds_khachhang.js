// ds_khachHang.js

export function loadCustomerList() {
    const customerSection = document.getElementById('ds_khachHang');
    if (!customerSection) return;

    // Lấy dữ liệu users từ localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tableBody = customerSection.querySelector('.kh-table tbody');
    
    if (!tableBody) return;

    // Xóa dữ liệu cũ
    tableBody.innerHTML = '';

    // Thêm dữ liệu mới
    users.forEach((user, index) => {
        const locked = user.locked === true;
        const lockIcon = locked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>';
        const lockTitle = locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.fullName || 'Chưa cài đặt'}</td>
            <td>${user.userName || 'N/A'}</td>
            <td>******</td> <!-- Không hiển thị mật khẩu thật -->
            <td>${user.registrationDate || new Date().toLocaleDateString('vi-VN')}</td>
            <td>
                <button class="kh-lock" data-index="${index}" title="${lockTitle}">${lockIcon}</button>
                <button class="kh-edit" data-index="${index}">Sửa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Gắn sự kiện khóa/mở khóa
    attachLockEvents();
    // Gắn sự kiện sửa
    attachEditEvents();
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

function attachEditEvents() {
    const editButtons = document.querySelectorAll('.kh-edit');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            editCustomer(index);
        });
    });
}

function toggleLock(index) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[index];
    if (!user) return;

    const currentlyLocked = user.locked === true;
    const confirmMsg = currentlyLocked ? 'Bạn có chắc muốn mở khóa tài khoản này?' : 'Bạn có chắc muốn khóa tài khoản này? (Tài khoản sẽ bị vô hiệu hóa nhưng không bị xóa)';
    if (!confirm(confirmMsg)) return;

    user.locked = !currentlyLocked;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Reload danh sách
    loadCustomerList();
    alert(currentlyLocked ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.');
}

function editCustomer(index) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[index];
    if (!user) return;

    let newName = prompt('Tên mới: (để trống nếu giữ nguyên)', user.userName);
    if (newName === null) return; // User cancel

    let newEmail = prompt('Email mới: (để trống nếu giữ nguyên)', user.email);
    if (newEmail === null) return;

    let newPass = prompt('Password mới: (để trống nếu giữ nguyên)', user.password);
    if (newPass === null) return;

    // Cập nhật chỉ khi có thay đổi
    if (newName.trim() !== '') user.userName = newName;
    if (newEmail.trim() !== '') user.email = newEmail;
    if (newPass.trim() !== '') user.password = newPass;

    localStorage.setItem('users', JSON.stringify(users));
    loadCustomerList();
    alert('Cập nhật thông tin thành công!');
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
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tableBody = document.querySelector('.kh-table tbody');
    
    if (!tableBody) return;

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchName = !name || (user.userName && user.userName.toLowerCase().includes(name.toLowerCase()));
        const matchUsername = !username || (user.userName && user.userName.toLowerCase().includes(username.toLowerCase()));
        return matchName && matchUsername;
    });

    // Hiển thị kết quả
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
    });

    // Re-attach events
    attachLockEvents();
    attachEditEvents();
}