// thongKe.js

import { showalert } from "../../JS/alert.js";
// Thêm import cho các hàm đọc/ghi
import { docdulieuLocalStorage, ghidulieuLocalStorage } from "./readandwrite.js";

export function loadStatistics() {
    const statsSection = document.getElementById('thongKe');
    if (!statsSection) return;

    // Lấy dữ liệu từ localStorage với error handling
    let orders, products, users;
    try {
        // Đã thay thế bằng docdulieuLocalStorage
        orders = docdulieuLocalStorage('orders');
        products = docdulieuLocalStorage('dataProducts');
        users = docdulieuLocalStorage('users');
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
        // Lọc orders thực (bỏ qua dữ liệu mẫu) - Dùng cho thống kê chung
        const realOrders = orders.filter(order => !order.isSample);
        
        // Lọc orders ĐÃ GIAO để tính doanh thu
        const deliveredOrders = realOrders.filter(order => order.status === "đã giao");

        // Tổng doanh thu TỪ ĐƠN ĐÃ GIAO
        const totalRevenue = deliveredOrders.reduce((sum, order) => {
            const orderTotal = typeof order.total === 'number' ? order.total : 0;
            return sum + orderTotal;
        }, 0);
        
        // Tổng số đơn hàng thực (TẤT CẢ TRẠNG THÁI)
        const totalOrders = realOrders.length;
        
        // Tổng số khách hàng đã mua hàng (TẤT CẢ TRẠNG THÁI)
        const uniqueCustomers = [...new Set(realOrders.map(order => order.customer))];
        const totalCustomers = uniqueCustomers.length;
        
        // Tổng số sản phẩm trong hệ thống
        const totalProducts = Array.isArray(products) ? products.length : 0;
        
        // Đơn hàng theo trạng thái (TỪ TẤT CẢ ĐƠN)
        const ordersByStatus = realOrders.reduce((acc, order) => {
            const status = order.status || 'mới đặt'; 
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        
        // Sản phẩm bán chạy (TỪ ĐƠN ĐÃ GIAO)
        const popularProducts = calculatePopularProducts(deliveredOrders);
        
        // Doanh thu theo tháng (TỪ ĐƠN ĐÃ GIAO)
        const revenueByMonth = calculateRevenueByMonth(deliveredOrders);
        
        // Thêm số liệu về user đăng ký
        const registeredUsers = Array.isArray(users) ? users.filter(user => user.role !== 'admin').length : 0;
        
        return {
            totalRevenue,      // (Chỉ từ đơn đã giao)
            totalOrders,       // (Tổng)
            totalCustomers,    // (Tổng)
            totalProducts,
            registeredUsers,
            ordersByStatus,    // (Tổng)
            popularProducts,   // (Chỉ từ đơn đã giao)
            revenueByMonth,    // (Chỉ từ đơn đã giao)
            realOrders         // (Tổng, dùng cho filter)
        };
    } catch (error) {
        console.error('Lỗi khi tính toán thống kê:', error);
        return getDefaultStats();
    }
}

// Hàm này nhận vào danh sách orders (đã được lọc, vd: chỉ đơn đã giao)
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

// Hàm này nhận vào danh sách orders (đã được lọc, vd: chỉ đơn đã giao)
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
    
    // Hiển thị bảng thống kê (sản phẩm bán chạy từ đơn đã giao)
    tableBody.innerHTML = '';
    
    if (stats.popularProducts.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                    Chưa có đơn hàng nào được giao thành công.
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
    
    // Cập nhật nhãn trạng thái và làm rõ các số liệu
    statsResult.innerHTML = `
        <h3 class="stats-subtitle">📊 Tổng quan hệ thống</h3>
        <p><strong>💰 Tổng doanh thu (từ đơn đã giao):</strong> ${formatVND(stats.totalRevenue)}</p>
        <p><strong>📦 Tổng đơn hàng (mọi trạng thái):</strong> ${stats.totalOrders}</p>
        <p><strong>👥 Khách hàng (đã đặt hàng):</strong> ${stats.totalCustomers}</p>
        <p><strong>👤 Tổng user đăng ký:</strong> ${stats.registeredUsers}</p>
        <p><strong>📱 Tổng sản phẩm:</strong> ${stats.totalProducts}</p>
        <br>
        <p><strong>Trạng thái đơn hàng:</strong></p>
        <p><strong>✅ Đã giao:</strong> ${stats.ordersByStatus["đã giao"] || 0}</p>
        <p><strong>⏳ Mới đặt:</strong> ${stats.ordersByStatus["mới đặt"] || 0}</p>
        <p><strong>🚚 Đã xử lý (đang giao):</strong> ${stats.ordersByStatus["đã xử lý"] || 0}</p>
        <p><strong>❌ Đã hủy:</strong> ${stats.ordersByStatus["đã hủy"] || 0}</p>
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
        // Lọc orders thực (không phải mẫu)
        let filteredOrders = allOrders.filter(order => !order.isSample);
        
        // Bước 1: Lọc đơn hàng theo thời gian (giữ nguyên)
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
        
        // (Chúng ta đã XÓA bộ lọc doanh thu đơn hàng ở đây)
        
        // Bước 2: Tính lại thống kê (bao gồm popularProducts)
        // dựa trên các đơn hàng đã lọc theo thời gian
        const products = docdulieuLocalStorage('dataProducts');
        const users = docdulieuLocalStorage('users');
        
        let filteredStats = calculateStatistics(filteredOrders, products, users);
        
        // Bước 3: (THAY ĐỔI QUAN TRỌNG)
        // Lọc doanh thu TỐI THIỂU trên danh sách SẢN PHẨM (popularProducts)
        if (minRevenue) {
            const minAmount = parseInt(minRevenue);
            if (!isNaN(minAmount)) {
                // Lọc trên 'product.revenue' thay vì 'order.total'
                filteredStats.popularProducts = filteredStats.popularProducts.filter(
                    product => product.revenue >= minAmount
                );
            }
        }

        // Bước 4: Lọc theo loại sản phẩm (best/worst)
        // (Áp dụng sau khi đã lọc theo doanh thu)
        if (productFilter === 'best') {
            filteredStats.popularProducts = filteredStats.popularProducts.slice(0, 5);
        } else if (productFilter === 'worst') {
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
    // Đã thay thế bằng docdulieuLocalStorage
    const orders = docdulieuLocalStorage('orders');
    
    // Chi tiết cũng chỉ nên tính trên các đơn ĐÃ GIAO
    const productOrders = orders.filter(order => 
        order.status === "đã giao" &&
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
    
    showalert(`📊 Chi tiết sản phẩm (Đã giao): ${productName}
📦 Số đơn hàng (đã giao): ${productOrders.length}
🛒 Số lượng bán (đã giao): ${totalSold}
💰 Doanh thu (đã giao): ${formatVND(totalRevenue)}
👥 Khách hàng: ${[...new Set(productOrders.map(order => order.customer))].length}`);
}

function formatVND(amount) {
    if (typeof amount !== 'number') {
        amount = 0;
    }
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
