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
        let totalItems = 0;

        checkoutItems.innerHTML = '';

        for (const [productId, item] of Object.entries(cart)) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center gap-4 py-3 border-b border-gray-50 last:border-0';
            const imageUrl = item.image || 'https://via.placeholder.com/80x80?text=No+Image';
            itemDiv.innerHTML = `
                <div class="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative border border-gray-100">
                    <img class="w-full h-full object-cover" src="${imageUrl}" alt="${item.product_name}" />
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-xs font-bold text-gray-800 truncate">${item.product_name}</h4>
                    <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Qty: ${item.quantity} · ₹${item.price}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs font-black text-gray-900">₹${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            `;
            if (checkoutItems) checkoutItems.appendChild(itemDiv);
            total += item.price * item.quantity;
            totalItems += item.quantity;
        }

        const checkoutTotal = document.getElementById('checkout-total');
        if (checkoutTotal) checkoutTotal.textContent = `₹${total.toFixed(2)}`;
    } catch (error) {
        console.error('Error loading checkout:', error);
    }
}

// Handle checkout submission
async function handleCheckout(event) {
    if (event) event.preventDefault();

    const btn = document.getElementById('confirm-order-btn');
    const originalText = btn.innerHTML;

    // Get payment method
    const paymentMethodEl = document.querySelector('input[name="payment-method"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'cod';

    // Simple validation (can be expanded)
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Processing...';
    btn.disabled = true;

    try {
        const cartResponse = await fetch('/api/cart');
        const cart = await cartResponse.json();

        let total = 0;
        const items = [];

        for (const [productId, item] of Object.entries(cart)) {
            total += item.price * item.quantity;
            items.push({
                product_id: productId,
                store_id: item.store_id,
                product_name: item.product_name,
                price: item.price,
                quantity: item.quantity
            });
        }

        const orderResponse = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: items,
                total: total,
                payment_method: paymentMethod,
                delivery_method: 'self_pickup' // or get from UI
            })
        });

        const orderResult = await orderResponse.json();

        if (orderResult.success) {
            window.location.href = `/receipt/${orderResult.order_id}`;
        } else {
            alert(orderResult.error || 'Failed to place order');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during checkout');
        btn.innerHTML = originalText;
        btn.disabled = false;
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
