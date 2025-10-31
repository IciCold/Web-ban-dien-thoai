/**
 * Hàm chung để hiển thị một trang cụ thể và cập nhật nút active
 * @param {string} pageId - ID của trang (ví dụ: '#home', '#ds_sanPham')
 */
function showPage(pageId) {
    // 1. Ẩn tất cả các trang
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });

    // 2. Hiển thị trang được yêu cầu
    const activePage = document.querySelector(pageId);

    if (activePage) {
        activePage.classList.add('active');
    } else {
        // Nếu hash không hợp lệ, luôn mặc định về trang chủ
        document.querySelector('#home').classList.add('active');
        pageId = '#home'; // Cập nhật pageId để nút 'home' được active
    }

    // 3. Cập nhật class 'active' cho nút sidebar
    document.querySelectorAll('.sidebar .icon-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('href') === pageId) {
            btn.classList.add('active');
        }
    });
}

/**
 * Xử lý khi người dùng click link (thay đổi hash)
 */
function handleHashChange() {
    let hash = window.location.hash;

    // Nếu hash rỗng (người dùng xóa thủ công), về trang chủ
    if (!hash || hash === "#") {
        hash = '#home';
    }
    
    showPage(hash);
}

/**
 * Xử lý khi tải trang lần đầu
 * (Theo yêu cầu: Luôn luôn hiển thị trang chủ)
 */
function handleInitialLoad() {
    // 1. Luôn hiển thị trang chủ
    showPage('#home');

    // 2. (Quan trọng) Đặt lại hash của URL về #home.
    // Dùng 'replaceState' để không tạo thêm lịch sử trình duyệt,
    // người dùng không thể nhấn "Back" để quay lại hash cũ.
    history.replaceState(null, null, ' ' + '#home');
}

// 1. Chạy khi tải trang lần đầu (chỉ hiển thị trang chủ)
document.addEventListener('DOMContentLoaded', handleInitialLoad);

// 2. Chạy mỗi khi hash thay đổi (sau khi tải trang xong)
window.addEventListener('hashchange', handleHashChange);