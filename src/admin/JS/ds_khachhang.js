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
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.userName || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>******</td> <!-- Không hiển thị mật khẩu thật -->
            <td>${user.registrationDate || new Date().toLocaleDateString('vi-VN')}</td>
            <td>
                <button class="kh-del" data-index="${index}">X</button>
                <button class="kh-edit" data-index="${index}">Sửa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Gắn sự kiện xóa
    attachDeleteEvents();
    // Gắn sự kiện sửa
    attachEditEvents();
}

function attachDeleteEvents() {
    const deleteButtons = document.querySelectorAll('.kh-del');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            deleteCustomer(index);
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

function deleteCustomer(index) {
    if (!confirm('Bạn có chắc muốn xóa khách hàng này?')) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.splice(index, 1);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Reload danh sách
    loadCustomerList();
    alert('Đã xóa khách hàng thành công!');
}

function editCustomer(index) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users[index];

    // Hiển thị form chỉnh sửa (có thể dùng modal)
    const newName = prompt('Tên mới:', user.userName);
    if (newName === null) return; // User cancel

    const newEmail = prompt('Email mới:', user.email);
    if (newEmail === null) return;

    // Cập nhật thông tin
    user.userName = newName;
    user.email = newEmail;

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
        const matchName = !name || user.userName.toLowerCase().includes(name.toLowerCase());
        const matchUsername = !username || user.userName.toLowerCase().includes(username.toLowerCase());
        return matchName && matchUsername;
    });

    // Hiển thị kết quả
    tableBody.innerHTML = '';
    filteredUsers.forEach((user, index) => {
        const originalIndex = users.findIndex(u => u.userName === user.userName);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.userName}</td>
            <td>${user.email}</td>
            <td>******</td>
            <td>${user.registrationDate || 'N/A'}</td>
            <td>
                <button class="kh-del" data-index="${originalIndex}">X</button>
                <button class="kh-edit" data-index="${originalIndex}">Sửa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Re-attach events
    attachDeleteEvents();
    attachEditEvents();
}