// Cart and Checkout JavaScript

// Initialize cart features
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path === '/cart') {
        loadCart();
    } else if (path === '/checkout') {
        loadCheckout();
    } else if (path.includes('/receipt/')) {
        loadReceipt();
    }
});

// Load cart
async function loadCart() {
    try {
        const response = await fetch('/api/cart');
        const cart = await response.json();

        const cartItems = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const cartSummary = document.getElementById('cart-summary');

        if (!cart || typeof cart !== 'object' || Object.keys(cart).length === 0) {
            cartItems.style.display = 'none';
            cartSummary.style.display = 'none';
            emptyCart.style.display = 'block';
            return;
        }

        let totalItems = 0;
        let totalPrice = 0;
        cartItems.innerHTML = '';
        for (const [productId, item] of Object.entries(cart)) {
            const cartItem = createCartItem(productId, item);
            cartItems.appendChild(cartItem);
            
            // Defensive parsing
            const qty = parseInt(item.quantity) || 0;
            const price = typeof item.price === 'string' 
                ? parseFloat(item.price.replace(/[^\d.-]/g, '')) 
                : parseFloat(item.price || 0);
                
            totalItems += qty;
            totalPrice += price * qty;
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
        // Log critical errors only
    }
}

function createCartItem(productId, item) {
    const div = document.createElement('div');
    div.className = 'bg-surface-container-lowest rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,55,81,0.06)] group cart-item';

    const imageUrl = item.image || '/static/images/products/default.png';

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
                <div class="flex items-center bg-surface-container-low rounded-full px-1 py-1 border border-primary/10">
                    <button onclick="updateQuantity('${productId}', -1)" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary/10 text-primary transition-colors">
                        <span class="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span id="qty-${productId}" class="px-4 font-black text-sm text-gray-800 min-w-[3rem] text-center">${item.quantity}</span>
                    <button onclick="updateQuantity('${productId}', 1)" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary/10 text-primary transition-colors">
                        <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>
                <button class="flex items-center gap-2 text-red-500 text-xs font-bold hover:opacity-70 transition-opacity" onclick="removeFromCart('${productId}')">
                    <span class="material-symbols-outlined text-base">delete</span> Remove
                </button>
            </div>
        </div>
    `;

    return div;
}

// Update quantity
async function updateQuantity(productId, delta) {
    try {
        const qtyEl = document.getElementById(`qty-${productId}`);
        if (!qtyEl) return;
        
        let currentQty = parseInt(qtyEl.textContent);
        let newQty = currentQty + delta;
        
        if (newQty < 1) return; // Minimum 1

        // 1. Update individual item quantity in UI
        qtyEl.textContent = newQty;

        // 2. Recalculate and update totals LOCALLY for instant feedback
        recalculateTotals();

        // 3. Sync with server
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: productId,
                quantity: newQty
            })
        });

        if (!response.ok) {
            // Revert on failure
            qtyEl.textContent = currentQty;
            recalculateTotals();
            alert('Failed to update quantity on server');
        }
    } catch (error) {
        // Log critical errors only
    }
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
    } catch (e) {
    }
}

/**
 * Recalculate totals from the current DOM state for instant feedback
 */
function recalculateTotals() {
    let totalItems = 0;
    let totalPrice = 0;

    const items = document.querySelectorAll('.cart-item');
    items.forEach(item => {
        const qtyEl = item.querySelector('[id^="qty-"]');
        const priceEl = item.querySelector('.text-primary'); // The price span
        
        if (qtyEl && priceEl) {
            const qty = parseInt(qtyEl.textContent) || 0;
            const priceText = priceEl.textContent.replace(/[^\d.-]/g, '');
            const price = parseFloat(priceText) || 0;
            
            totalItems += qty;
            totalPrice += price * qty;
        }
    });

    // Update UI elements
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
}

// Proceed to checkout
function proceedToCheckout() {
    window.location.href = '/checkout';
}

// Load checkout
async function loadCheckout() {
    try {
        const response = await fetch('/api/cart');
        if (!response.ok) throw new Error('Failed to fetch cart');
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
            const imageUrl = item.image || '/static/images/products/default.png';
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
        if (!receiptDetails) return;

        let itemsHtml = order.items.map(item => `
            <div class="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div class="min-w-0">
                    <p class="text-sm font-bold text-gray-800 truncate">${item.product_name}</p>
                    <p class="text-[10px] text-gray-500 font-medium uppercase">Qty: ${item.quantity} · ₹${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <p class="text-sm font-black text-gray-900 ml-4">₹${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        `).join('');

        const dateStr = new Date(order.created_at).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        receiptDetails.innerHTML = `
            <div class="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 space-y-3">
                <div class="flex justify-between">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</span>
                    <span class="text-[10px] font-black text-gray-800">#${order.order_id.substring(0,18)}...</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</span>
                    <span class="text-[10px] font-black text-gray-800">${dateStr}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment</span>
                    <span class="text-[10px] font-black text-secondary uppercase px-2 py-0.5 bg-orange-50 rounded-full">${order.payment_method || 'COD'}</span>
                </div>
            </div>

            <div class="py-2">
                <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Order Items</h3>
                <div class="space-y-1">
                    ${itemsHtml}
                </div>
            </div>

            <div class="pt-6 border-t border-gray-100 flex justify-between items-center">
                <span class="text-sm font-bold text-gray-500 uppercase tracking-widest">Amount Paid</span>
                <span class="text-3xl font-black text-primary">₹${parseFloat(order.total).toFixed(2)}</span>
            </div>
        `;
    } catch (error) {
        console.error('Error loading receipt:', error);
        document.getElementById('receipt-details').innerHTML = '<p class="text-center text-red-500 py-10 font-bold">Failed to load receipt details.</p>';
    }
}
