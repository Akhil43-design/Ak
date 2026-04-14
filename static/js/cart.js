// Cart and Checkout JavaScript

// Load cart on page load
if (window.location.pathname === '/cart') {
    loadCart();
}

// Load checkout on page load
if (window.location.pathname === '/checkout') {
    loadCheckout();
}

// Load receipt on page load
if (window.location.pathname.includes('/receipt/')) {
    loadReceipt();
}

// Load cart
async function loadCart() {
    try {
        const response = await fetch('/api/cart');
        const cart = await response.json();

        const cartItems = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const cartSummary = document.getElementById('cart-summary');

        if (!cart || Object.keys(cart).length === 0) {
            cartItems.style.display = 'none';
            cartSummary.style.display = 'none';
            emptyCart.style.display = 'block';
            return;
        }

        cartItems.innerHTML = '';
        let totalItems = 0;
        let totalPrice = 0;

        for (const [productId, item] of Object.entries(cart)) {
            const cartItem = createCartItem(productId, item);
            cartItems.appendChild(cartItem);
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;
        }

        const itemsEl = document.getElementById('total-items');
        if (itemsEl) itemsEl.textContent = totalItems;
        
        const subLabel = document.getElementById('subtotal-label');
        if (subLabel) subLabel.textContent = `Subtotal (${totalItems} items)`;
        
        const priceSub = document.getElementById('total-price-sub');
        if (priceSub) priceSub.textContent = `₹${totalPrice.toFixed(2)}`;
        
        const totalPriceEl = document.getElementById('total-price');
        if (totalPriceEl) totalPriceEl.textContent = `₹${totalPrice.toFixed(2)}`;

        const headerCount = document.getElementById('header-cart-count');
        if (headerCount) headerCount.textContent = totalItems;

        if (cartSummary) cartSummary.style.display = 'block';
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function createCartItem(productId, item) {
    const div = document.createElement('div');
    div.className = 'bg-surface-container-lowest rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,55,81,0.06)] group cart-item';

    const imageUrl = item.image || 'https://via.placeholder.com/80x80?text=No+Image';

    div.innerHTML = `
        <div class="w-full md:w-32 h-32 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0 relative">
            <div class="absolute inset-0 bg-primary-container opacity-5"></div>
            <img alt="${item.product_name}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="${imageUrl}"/>
        </div>
        <div class="flex-grow space-y-1 w-full">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-bold text-on-surface">${item.product_name}</h3>
                    <p class="text-sm text-on-surface-variant">Store ID: ${item.store_id || 'N/A'}</p>
                </div>
                <span class="text-lg font-bold text-primary">₹${parseFloat(item.price).toFixed(2)}</span>
            </div>
            <div class="flex items-center justify-between pt-4">
                <div class="flex items-center bg-surface-container-low rounded-full px-2 py-1">
                    <span class="px-4 font-semibold text-sm">Qty: ${item.quantity}</span>
                </div>
                <button class="flex items-center gap-2 text-error text-sm font-medium hover:opacity-70 transition-opacity" onclick="removeFromCart('${productId}')">
                    <span class="material-symbols-outlined text-lg">delete</span> Remove
                </button>
            </div>
        </div>
    `;

    return div;
}

// Remove from cart
async function removeFromCart(productId) {
    try {
        const response = await fetch(`/api/cart/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadCart();
        } else {
            alert('Failed to remove item');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
}

// Proceed to checkout
function proceedToCheckout() {
    window.location.href = '/checkout';
}

// Load checkout
async function loadCheckout() {
    try {
        const response = await fetch('/api/cart');
        const cart = await response.json();

        if (!cart || Object.keys(cart).length === 0) {
            window.location.href = '/cart';
            return;
        }

        const checkoutItems = document.getElementById('checkout-items');
        let total = 0;

        checkoutItems.innerHTML = '';

        for (const [productId, item] of Object.entries(cart)) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex gap-4 mb-4';
            const imageUrl = item.image || 'https://via.placeholder.com/80x80?text=No+Image';
            itemDiv.innerHTML = `
                <div class="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 relative">
                    <div class="absolute inset-0 bg-primary-container opacity-5"></div>
                    <img class="w-full h-full object-cover" src="${imageUrl}" alt="${item.product_name}" />
                </div>
                <div class="flex-1">
                    <h4 class="text-sm font-semibold text-on-surface">${item.product_name}</h4>
                    <p class="text-xs text-on-surface-variant">Qty: ${item.quantity}</p>
                    <p class="text-sm font-bold mt-1 text-primary">₹${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            `;
            if (checkoutItems) checkoutItems.appendChild(itemDiv);
            total += item.price * item.quantity;
        }

        const checkoutTotal = document.getElementById('checkout-total');
        if (checkoutTotal) checkoutTotal.textContent = `₹${total.toFixed(2)}`;
        
        const checkoutTotalSub = document.getElementById('checkout-total-sub');
        if (checkoutTotalSub) checkoutTotalSub.textContent = `₹${total.toFixed(2)}`;
    } catch (error) {
        console.error('Error loading checkout:', error);
    }
}

// Toggle address field
function toggleAddress() {
    const deliveryMethod = document.getElementById('delivery-method').value;
    const addressSection = document.getElementById('address-section');

    if (deliveryMethod === 'home_delivery') {
        addressSection.style.display = 'block';
        document.getElementById('delivery-address').required = true;
    } else {
        addressSection.style.display = 'none';
        document.getElementById('delivery-address').required = false;
    }
}

// Handle checkout
async function handleCheckout(event) {
    if (event) event.preventDefault();

    let deliveryMethod = 'home_delivery'; // Default
    const deliveryMethodEl = document.querySelector('input[name="payment"]:checked');
    if (deliveryMethodEl && deliveryMethodEl.value === 'cod') {
        deliveryMethod = 'cod';
    }

    const addressEl = document.getElementById('delivery-address');
    const address = addressEl ? addressEl.value : '';

    try {
        // Get cart
        const cartResponse = await fetch('/api/cart');
        const cart = await cartResponse.json();

        // Calculate total
        let total = 0;
        const items = [];

        for (const [productId, item] of Object.entries(cart)) {
            total += item.price * item.quantity;
            items.push({
                product_id: productId,
                store_id: item.store_id, // Include store_id
                product_name: item.product_name,
                price: item.price,
                quantity: item.quantity
            });
        }

        // Create order
        const orderData = {
            items: items,
            total: total,
            delivery_method: deliveryMethod,
            address: address
        };

        const orderResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const orderResult = await orderResponse.json();

        if (orderResult.success) {
            window.location.href = `/receipt/${orderResult.order_id}`;
        } else {
            alert('Failed to place order');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
}

// Load receipt
async function loadReceipt() {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        const order = await response.json();

        const receiptDetails = document.getElementById('receipt-details');

        let itemsHtml = '';
        for (const item of order.items) {
            itemsHtml += `
                <div class="summary-row">
                    <span>${item.product_name} x${item.quantity}</span>
                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
        }

        receiptDetails.innerHTML = `
            <div class="receipt-info">
                <p><strong>Order ID:</strong> ${order.order_id}</p>
                <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Delivery Method:</strong> ${order.delivery_method === 'home_delivery' ? 'Home Delivery' : 'Self Pickup'}</p>
                ${order.address ? `<p><strong>Address:</strong> ${order.address}</p>` : ''}
            </div>
            <div class="receipt-items">
                <h3>Items</h3>
                ${itemsHtml}
                <div class="summary-row total">
                    <span>Total</span>
                    <span>₹${parseFloat(order.total).toFixed(2)}</span>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading receipt:', error);
    }
}
