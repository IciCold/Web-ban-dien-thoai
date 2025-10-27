
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
ramOptionsContainer.addEventListener('click', handleOptionSelection(ramOptionsContainer, 'option-button'));
colorOptionsContainer.addEventListener('click', handleOptionSelection(colorOptionsContainer, 'color-option'));
paymentMethodsContainer.addEventListener('click', handleOptionSelection(paymentMethodsContainer, 'payment-button'));


const decrementButton = quantityControl.querySelector('.qty-button:first-child'); 
const incrementButton = quantityControl.querySelector('.qty-button:last-child');  
const quantityInput = quantityControl.querySelector('.qty-input');                 
const MIN_VALUE = parseInt(quantityInput.getAttribute('min')) || 1;

function incrementQuantity() {
    let currentValue = parseInt(quantityInput.value);
    quantityInput.value = currentValue + 1;
    updateTotalPrice();
}

function decrementQuantity() {
    let currentValue = parseInt(quantityInput.value);
    if (currentValue > MIN_VALUE) {
        quantityInput.value = currentValue - 1;
        updateTotalPrice(); 
    }
}
decrementButton.addEventListener('click', decrementQuantity);
incrementButton.addEventListener('click', incrementQuantity);

document.addEventListener('DOMContentLoaded', () => {
    const setDefaults = (container, buttonClass) => {
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
const finalBuyButton = document.querySelector('.buy-now-button-large');
if (finalBuyButton) {
    finalBuyButton.addEventListener('click', () => {
        const finalPrice = totalAmountSpan ? totalAmountSpan.textContent : 'Tổng cộng';
        alert(`🛒 Thanh toán thành công!\nTổng cộng: ${finalPrice}\nĐơn hàng của bạn sẽ sớm được xử lý.`);
    });
}