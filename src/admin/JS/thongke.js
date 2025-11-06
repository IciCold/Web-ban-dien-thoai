// thongKe.js

export function loadStatistics() {
    const statsSection = document.getElementById('thongKe');
    if (!statsSection) return;

    // Lấy dữ liệu từ localStorage với error handling
    let orders, products, users;
    try {
        orders = JSON.parse(localStorage.getItem('orders')) || [];
        products = JSON.parse(localStorage.getItem('products')) || [];
        users = JSON.parse(localStorage.getItem('users')) || [];
    } catch (error) {
        console.error('Lỗi khi đọc dữ liệu từ localStorage:', error);
        orders = [];
        products = [];
        users = [];
    }

    // Tính toán thống kê
    const stats = calculateStatistics(orders, products, users);
    
    // Hiển thị thống kê
    displayStatistics(stats);
    
    // Gắn sự kiện cho form lọc
    setupFilterForm(stats, orders);
}

function calculateStatistics(orders, products, users) {
    try {
        // Lọc orders thực (bỏ qua dữ liệu mẫu)
        const realOrders = orders.filter(order => !order.isSample);
        
        // Tổng doanh thu từ orders thực
        const totalRevenue = realOrders.reduce((sum, order) => {
            // Đảm bảo order.total là số
            const orderTotal = typeof order.total === 'number' ? order.total : 0;
            return sum + orderTotal;
        }, 0);
        
        // Tổng số đơn hàng thực
        const totalOrders = realOrders.length;
        
        // Tổng số khách hàng đã mua hàng (từ orders thực)
        const uniqueCustomers = [...new Set(realOrders.map(order => order.customer))];
        const totalCustomers = uniqueCustomers.length;
        
        // Tổng số sản phẩm trong hệ thống
        const totalProducts = Array.isArray(products) ? products.length : 0;
        
        // Đơn hàng theo trạng thái
        const ordersByStatus = realOrders.reduce((acc, order) => {
            const status = order.status || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        
        // Sản phẩm bán chạy
        const popularProducts = calculatePopularProducts(realOrders);
        
        // Doanh thu theo tháng
        const revenueByMonth = calculateRevenueByMonth(realOrders);
        
        // Thêm số liệu về user đăng ký
        const registeredUsers = Array.isArray(users) ? users.filter(user => user.role !== 'admin').length : 0;
        
        return {
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalProducts,
            registeredUsers,
            ordersByStatus,
            popularProducts,
            revenueByMonth,
            realOrders // Thêm realOrders để filter
        };
    } catch (error) {
        console.error('Lỗi khi tính toán thống kê:', error);
        return getDefaultStats();
    }
}

function calculatePopularProducts(orders) {
    const productSales = {};
    
    orders.forEach(order => {
        if (!order.products || !Array.isArray(order.products)) return;
        
        order.products.forEach(item => {
            if (!item.name) return;
            
            if (!productSales[item.name]) {
                productSales[item.name] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            
            const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
            const price = typeof item.price === 'number' ? item.price : 0;
            
            productSales[item.name].quantity += quantity;
            productSales[item.name].revenue += price * quantity;
        });
    });
    
    return Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
}

function calculateRevenueByMonth(orders) {
    const monthlyRevenue = {};
    
    orders.forEach(order => {
        if (!order.date) return;
        
        try {
            const date = new Date(order.date);
            if (isNaN(date.getTime())) return;
            
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            const orderTotal = typeof order.total === 'number' ? order.total : 0;
            
            if (!monthlyRevenue[monthYear]) {
                monthlyRevenue[monthYear] = 0;
            }
            monthlyRevenue[monthYear] += orderTotal;
        } catch (error) {
            console.error('Lỗi xử lý ngày tháng:', error);
        }
    });
    
    return monthlyRevenue;
}

function displayStatistics(stats) {
    const tableBody = document.querySelector('.stats-table tbody');
    const statsResult = document.querySelector('.stats-result');
    
    if (!tableBody || !statsResult) return;
    
    // Hiển thị bảng thống kê
    tableBody.innerHTML = '';
    
    if (stats.popularProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                    Chưa có dữ liệu thống kê. Hãy thực hiện một vài giao dịch!
                </td>
            </tr>
        `;
    } else {
        stats.popularProducts.forEach((product, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>${formatVND(product.revenue)}</td>
                <td><button class="view-details-btn" data-product="${product.name}">Chi tiết</button></td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Hiển thị kết quả tổng quan
    statsResult.innerHTML = `
        <h3 class="stats-subtitle">📊 Tổng quan hệ thống</h3>
        <p><strong>💰 Tổng doanh thu:</strong> ${formatVND(stats.totalRevenue)}</p>
        <p><strong>📦 Tổng đơn hàng:</strong> ${stats.totalOrders}</p>
        <p><strong>👥 Khách hàng đã mua:</strong> ${stats.totalCustomers}</p>
        <p><strong>👤 Tổng user đăng ký:</strong> ${stats.registeredUsers}</p>
        <p><strong>📱 Tổng sản phẩm:</strong> ${stats.totalProducts}</p>
        <p><strong>✅ Đơn hàng thành công:</strong> ${stats.ordersByStatus.completed || 0}</p>
        <p><strong>⏳ Đang xử lý:</strong> ${stats.ordersByStatus.pending || 0}</p>
        <p><strong>❌ Đơn hủy:</strong> ${stats.ordersByStatus.cancelled || 0}</p>
    `;
    
    // Gắn sự kiện cho nút chi tiết
    attachDetailsEvents();
}

function setupFilterForm(originalStats, allOrders) {
    const filterForm = document.querySelector('.stats-filter-form');
    if (!filterForm) return;
    
    // Reset form
    filterForm.reset();
    
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productFilter = document.getElementById('filter-product').value;
        const timeFilter = document.getElementById('filter-time').value;
        const minRevenue = document.getElementById('revenue').value;
        
        let filteredStats = filterStatistics(originalStats, allOrders, productFilter, timeFilter, minRevenue);
        displayStatistics(filteredStats);
    });
}

function filterStatistics(originalStats, allOrders, productFilter, timeFilter, minRevenue) {
    try {
        // Lọc orders thực
        let filteredOrders = allOrders.filter(order => !order.isSample);
        
        // Filter theo thời gian
        if (timeFilter !== 'all') {
            const now = new Date();
            filteredOrders = filteredOrders.filter(order => {
                if (!order.date) return false;
                
                const orderDate = new Date(order.date);
                switch (timeFilter) {
                    case 'week':
                        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return orderDate >= oneWeekAgo;
                    case 'month':
                        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                        return orderDate >= oneMonthAgo;
                    case 'quarter':
                        const oneQuarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                        return orderDate >= oneQuarterAgo;
                    default:
                        return true;
                }
            });
        }
        
        // Filter theo doanh thu tối thiểu
        if (minRevenue) {
            const minAmount = parseInt(minRevenue);
            if (!isNaN(minAmount)) {
                filteredOrders = filteredOrders.filter(order => order.total >= minAmount);
            }
        }
        
        // Tính lại thống kê với orders đã lọc
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const users = JSON.parse(localStorage.getItem('users')) || [];
        let filteredStats = calculateStatistics(filteredOrders, products, users);
        
        // Filter theo loại sản phẩm (best/worst)
        if (productFilter === 'best') {
            filteredStats.popularProducts = filteredStats.popularProducts.slice(0, 5);
        } else if (productFilter === 'worst') {
            // Lọc sản phẩm có doanh thu thấp nhất nhưng vẫn có bán
            filteredStats.popularProducts = filteredStats.popularProducts
                .filter(p => p.quantity > 0)
                .slice(-5)
                .reverse();
        }
        
        return filteredStats;
    } catch (error) {
        console.error('Lỗi khi lọc thống kê:', error);
        return originalStats;
    }
}

function attachDetailsEvents() {
    const detailButtons = document.querySelectorAll('.view-details-btn');
    detailButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            showProductDetails(productName);
        });
    });
}

function showProductDetails(productName) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const productOrders = orders.filter(order => 
        order.products && order.products.some(p => p.name === productName)
    );
    
    const totalSold = productOrders.reduce((sum, order) => {
        const product = order.products.find(p => p.name === productName);
        return sum + (product?.quantity || 0);
    }, 0);
    
    const totalRevenue = productOrders.reduce((sum, order) => {
        const product = order.products.find(p => p.name === productName);
        return sum + ((product?.price || 0) * (product?.quantity || 0));
    }, 0);
    
    alert(`📊 Chi tiết sản phẩm: ${productName}
📦 Số đơn hàng: ${productOrders.length}
🛒 Số lượng bán: ${totalSold}
💰 Doanh thu: ${formatVND(totalRevenue)}
👥 Khách hàng: ${[...new Set(productOrders.map(order => order.customer))].length}`);
}

function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function getDefaultStats() {
    return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        registeredUsers: 0,
        ordersByStatus: {},
        popularProducts: [],
        revenueByMonth: {},
        realOrders: []
    };
}

export function seedOrderData() {
    if (localStorage.getItem('orders')) return;
    localStorage.setItem('orders', JSON.stringify(sampleOrders));
    console.log('Đã tạo dữ liệu đơn hàng mẫu!');
}

// Hàm để xóa dữ liệu mẫu (dùng cho testing)
export function clearSampleData() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const realOrders = orders.filter(order => !order.isSample);
    localStorage.setItem('orders', JSON.stringify(realOrders));
    console.log('Đã xóa dữ liệu mẫu!');
}