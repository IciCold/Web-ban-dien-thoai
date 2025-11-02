const paymentSection = document.getElementById('paymentSection');

const productPriceElement = document.querySelector('.product-price'); 
const totalAmountSpan = document.querySelector('.total-amount');     

const colorOptionsContainer = document.getElementById('colorButton');
const ramOptionsContainer = document.getElementById('ramButton');
const quantityControl = document.querySelector('.quantity-control');
const paymentMethodsContainer = document.querySelector('.payment-methods');

function formatToVND(number) {
    return number.toLocaleString('vi-VN') + ' VND';
}

function parseVNDPrice(priceText) {
    if (!priceText) return 0;
    const numericString = priceText.replace(' VND', '').replace(/\./g, '').trim();
    return parseInt(numericString) || 0;
}

const BASE_PRICE = parseVNDPrice(productPriceElement ? productPriceElement.textContent : '0 VND');

function updateTotalPrice() {
    if (quantityControl && totalAmountSpan) {
        const quantityInput = quantityControl.querySelector('.qty-input');
        const quantity = parseInt(quantityInput.value) || 1;
        const newTotal = BASE_PRICE * quantity;
        totalAmountSpan.textContent = formatToVND(newTotal);
    }
}

function handleOptionSelection(container, buttonClass) {
    return function(event) {
        const clickedButton = event.target;
        if (!clickedButton.classList.contains(buttonClass)) {
            return; 
        }
        
        const currentActive = container.querySelector(`.${buttonClass}.active`);
        if (currentActive) {
            currentActive.classList.remove('active');
        }
        
        clickedButton.classList.add('active');
    };
}

// Thêm sự kiện chỉ khi elements tồn tại
if (ramOptionsContainer) {
    ramOptionsContainer.addEventListener('click', handleOptionSelection(ramOptionsContainer, 'option-button'));
}
if (colorOptionsContainer) {
    colorOptionsContainer.addEventListener('click', handleOptionSelection(colorOptionsContainer, 'color-option'));
}
if (paymentMethodsContainer) {
    paymentMethodsContainer.addEventListener('click', handleOptionSelection(paymentMethodsContainer, 'payment-button'));
}

// Thêm kiểm tra tồn tại cho quantity control
if (quantityControl) {
    const decrementButton = quantityControl.querySelector('.qty-button:first-child'); 
    const incrementButton = quantityControl.querySelector('.qty-button:last-child');  
    const quantityInput = quantityControl.querySelector('.qty-input');                 
    const MIN_VALUE = parseInt(quantityInput?.getAttribute('min')) || 1;

    function incrementQuantity() {
        if (!quantityInput) return;
        let currentValue = parseInt(quantityInput.value) || 1;
        quantityInput.value = currentValue + 1;
        updateTotalPrice();
    }

    function decrementQuantity() {
        if (!quantityInput) return;
        let currentValue = parseInt(quantityInput.value) || 1;
        if (currentValue > MIN_VALUE) {
            quantityInput.value = currentValue - 1;
            updateTotalPrice(); 
        }
    }

    if (decrementButton) {
        decrementButton.addEventListener('click', decrementQuantity);
    }
    if (incrementButton) {
        incrementButton.addEventListener('click', incrementQuantity);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const setDefaults = (container, buttonClass) => {
        if (!container) return;
        const firstButton = container.querySelector(`.${buttonClass}:first-child`);
        if (firstButton && !container.querySelector(`.${buttonClass}.active`)) {
            firstButton.classList.add('active');
        }
    };

    if (ramOptionsContainer) setDefaults(ramOptionsContainer, 'option-button');
    if (colorOptionsContainer) setDefaults(colorOptionsContainer, 'color-option');
    if (paymentMethodsContainer) setDefaults(paymentMethodsContainer, 'payment-button');
    updateTotalPrice();
});

// ==================== CÁC HÀM QUAN TRỌNG CHO HỆ THỐNG ====================

// Hàm lấy username hiện tại
function getCurrentUsername() {
    try {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        return user ? user.userName : null;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin user:', error);
        return null;
    }
}

// Hàm lấy thông tin user hiện tại
function getCurrentUser() {
    try {
        const user = localStorage.getItem("currentUser");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin user:', error);
        return null;
    }
}

// Hàm lưu đơn hàng - ĐÃ SỬA QUAN TRỌNG
function saveOrder() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Vui lòng đăng nhập để mua hàng');
        location.hash = 'login';
        return null;
    }

    try {
        // Lấy thông tin sản phẩm từ trang thanh toán
        const productName = document.querySelector('.product-title')?.textContent?.trim() || 'Sản phẩm không xác định';
        const productPrice = parseVNDPrice(document.querySelector('.product-price')?.textContent || '0 VND');
        const quantity = parseInt(document.querySelector('.qty-input')?.value || 1);
        
        // Lấy thông tin tùy chọn
        const selectedColor = document.querySelector('.color-option.active')?.style?.backgroundColor || 'Mặc định';
        const selectedRAM = document.querySelector('.option-button.active')?.textContent || '128GB';
        const selectedPayment = document.querySelector('.payment-button.active')?.textContent || 'Cash';
        const deliveryAddress = document.getElementById('delivery-address')?.value || 'Chưa có địa chỉ';
        
        // Tạo đơn hàng mới
        const newOrder = {
            id: 'ORD_' + Date.now(),
            customer: currentUser.userName,
            customerEmail: currentUser.email,
            products: [
                {
                    name: productName,
                    price: productPrice,
                    quantity: quantity,
                    color: selectedColor,
                    ram: selectedRAM
                }
            ],
            total: productPrice * quantity,
            status: 'completed',
            date: new Date().toISOString(),
            paymentMethod: selectedPayment,
            deliveryAddress: deliveryAddress
        };

        // Lấy danh sách đơn hàng cũ và thêm đơn hàng mới
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));

        console.log('Đã lưu đơn hàng:', newOrder);
        return newOrder;
        
    } catch (error) {
        console.error('Lỗi khi lưu đơn hàng:', error);
        alert('Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại.');
        return null;
    }
}

// Hàm xóa giỏ hàng sau khi thanh toán
function clearUserCart() {
    try {
        const username = getCurrentUsername();
        if (username) {
            const cartKey = 'cart_' + username;
            localStorage.removeItem(cartKey);
            console.log('Đã xóa giỏ hàng của user:', username);
            
            // Cập nhật UI giỏ hàng nếu có
            const cartEmptyMsg = document.getElementById('cart-empty-msg');
            const cartItemsList = document.getElementById('cart-items-list');
            if (cartEmptyMsg && cartItemsList) {
                cartItemsList.innerHTML = '';
                cartEmptyMsg.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Lỗi khi xóa giỏ hàng:', error);
    }
}

// Hàm kiểm tra và tạo dữ liệu mẫu nếu cần
function initializeOrderData() {
    try {
        if (!localStorage.getItem('orders')) {
            const sampleOrders = [
                {
                    id: 'ORD_SAMPLE_001',
                    customer: 'Nguyễn Văn A',
                    customerEmail: 'nguyenvana@example.com',
                    products: [
                        { 
                            name: 'iPhone 15', 
                            price: 25000000, 
                            quantity: 1, 
                            color: 'rgb(255, 0, 0)', 
                            ram: '128GB' 
                        }
                    ],
                    total: 25000000,
                    status: 'completed',
                    date: new Date('2024-01-15').toISOString(),
                    paymentMethod: 'Cash',
                    deliveryAddress: 'Hà Nội',
                    isSample: true
                }
            ];
            localStorage.setItem('orders', JSON.stringify(sampleOrders));
            console.log('Đã tạo dữ liệu đơn hàng mẫu!');
        }
    } catch (error) {
        console.error('Lỗi khi khởi tạo dữ liệu đơn hàng:', error);
    }
}

// Khởi tạo dữ liệu khi trang thanh toán được load
if (paymentSection) {
    initializeOrderData();
}

// ==================== SỰ KIỆN NÚT MUA NGAY - ĐÃ CẢI THIỆN ====================

const finalBuyButton = document.querySelector('.buy-now-button-large');
if (finalBuyButton) {
    finalBuyButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Kiểm tra đăng nhập
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('Vui lòng đăng nhập để mua hàng');
            location.hash = 'login';
            return;
        }

        // Kiểm tra phương thức thanh toán
        const selectedPayment = document.querySelector('.payment-button.active');
        if (!selectedPayment) {
            alert('Vui lòng chọn phương thức thanh toán!');
            return;
        }

        // Kiểm tra địa chỉ giao hàng
        const deliveryAddress = document.getElementById('delivery-address');
        if (!deliveryAddress || !deliveryAddress.value.trim()) {
            alert('Vui lòng nhập địa chỉ giao hàng!');
            if (deliveryAddress) deliveryAddress.focus();
            return;
        }

        // Kiểm tra số lượng
        const quantityInput = document.querySelector('.qty-input');
        const quantity = parseInt(quantityInput?.value || 1);
        if (quantity < 1) {
            alert('Số lượng sản phẩm không hợp lệ!');
            return;
        }

        // Lưu đơn hàng
        const order = saveOrder();
        
        if (order) {
            const finalPrice = totalAmountSpan ? totalAmountSpan.textContent : 'Tổng cộng';
            
            // Thông báo chi tiết hơn
            alert(`✅ THANH TOÁN THÀNH CÔNG!\n
📦 Mã đơn hàng: ${order.id}
💰 Tổng tiền: ${finalPrice}
💳 Phương thức: ${order.paymentMethod}
🏠 Địa chỉ giao: ${order.deliveryAddress}
📧 Email xác nhận: ${order.customerEmail}\n
Cảm ơn bạn đã mua hàng! Đơn hàng sẽ được xử lý trong 24h.`);
            
            // Xóa giỏ hàng sau khi thanh toán
            clearUserCart();
            
            // Chuyển về trang chủ sau 2 giây
            setTimeout(() => {
                location.hash = 'home';
            }, 2000);
        }
    });
}

// ==================== HÀM HỖ TRỢ CHO THỐNG KÊ ====================

// Hàm lấy tổng số đơn hàng (dùng cho thống kê)
function getTotalOrders() {
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        return orders.filter(order => !order.isSample).length;
    } catch (error) {
        console.error('Lỗi khi đếm đơn hàng:', error);
        return 0;
    }
}

// Hàm lấy tổng doanh thu (dùng cho thống kê)
function getTotalRevenue() {
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        return orders
            .filter(order => !order.isSample && order.status === 'completed')
            .reduce((total, order) => total + order.total, 0);
    } catch (error) {
        console.error('Lỗi khi tính doanh thu:', error);
        return 0;
    }
}

// Hàm lấy đơn hàng theo khách hàng
function getOrdersByCustomer(username) {
    try {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        return orders.filter(order => 
            order.customer === username && !order.isSample
        );
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng theo khách hàng:', error);
        return [];
    }
}

// Xuất các hàm để sử dụng trong file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveOrder,
        getCurrentUser,
        getTotalOrders,
        getTotalRevenue,
        getOrdersByCustomer
    };
}   

// Thêm code mới cho xử lý payment
document.addEventListener('DOMContentLoaded', function() {
    const paymentContainer = document.querySelector('.payment-methods');
    const cardDetailsGroup = document.querySelector('.info');
    
    if (paymentContainer && cardDetailsGroup) {
        // Handler cho việc click payment button
        paymentContainer.addEventListener('click', function(e) {
            const clickedButton = e.target.closest('.payment-button');
            if (!clickedButton) return;

            // Remove active class from all buttons
            const allButtons = paymentContainer.querySelectorAll('.payment-button');
            allButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            clickedButton.classList.add('active');

            // Show/hide card details based on payment method
            if (clickedButton.classList.contains('cash')) {
                cardDetailsGroup.style.display = 'none';
            } else {
                cardDetailsGroup.style.display = 'block';
            }
        });

        // Set default payment method (cash)
        const defaultButton = paymentContainer.querySelector('.payment-button.cash');
        if (defaultButton) {
            defaultButton.click();
        }
    }
});
