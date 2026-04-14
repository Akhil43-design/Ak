// Store Owner Dashboard — Smart Retail Shopping

let currentStoreId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkStoreRegistration();
    const form = document.getElementById('addProductForm');
    if (form) form.addEventListener('submit', handleAddProduct);
});

// ─── STORE CHECK ─────────────────────────────────────────────
async function checkStoreRegistration() {
    // 1. Fast path: localStorage cache
    const cachedId = localStorage.getItem('srs_store_id');
    if (cachedId) {
        currentStoreId = cachedId;
        loadProducts();
        loadAnalytics();
        loadRequests();
        return;
    }
    // 2. Ask server
    try {
        const res = await fetch('/api/my-store');
        if (!res.ok) throw new Error('Server error');
        const store = await res.json();
        if (store && store.id) {
            currentStoreId = store.id;
            localStorage.setItem('srs_store_id', store.id);
            loadProducts();
            loadAnalytics();
            loadRequests();
        } else {
            showRegisterModal();
        }
    } catch (e) {
        console.error('Store check error:', e);
        showRegisterModal();
    }
}

// ─── STORE REGISTRATION MODAL ────────────────────────────────
function showRegisterModal() {
    let modal = document.getElementById('registerStoreModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'registerStoreModal';
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                <div class="bg-gradient-to-r from-green-700 to-green-600 p-6 text-white">
                    <h3 class="text-xl font-bold">Register Your Store</h3>
                    <p class="text-green-100 text-sm mt-1">Set up your Smart Retail Shopping store.</p>
                </div>
                <form id="registerStoreForm" class="p-6 space-y-4">
                    <div id="reg-message" class="hidden p-3 rounded-lg text-sm text-center font-medium"></div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Store Name *</label>
                        <input id="reg-store-name" type="text" required placeholder="e.g. Ramu Kaka's Mart"
                            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-all"/>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold mb-1">Description</label>
                        <textarea id="reg-store-desc" rows="2" placeholder="What do you sell?"
                            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 transition-all resize-none"></textarea>
                    </div>
                    <button type="submit" id="reg-submit-btn" class="w-full py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl transition-colors">
                        Register Store
                    </button>
                </form>
            </div>`;
        document.body.appendChild(modal);
        document.getElementById('registerStoreForm').addEventListener('submit', handleStoreRegistration);
    } else {
        modal.classList.remove('hidden');
    }
}

async function handleStoreRegistration(e) {
    e.preventDefault();
    const name = document.getElementById('reg-store-name').value.trim();
    const description = document.getElementById('reg-store-desc').value.trim();
    const btn = document.getElementById('reg-submit-btn');
    const msgEl = document.getElementById('reg-message');
    if (!name) return;

    btn.textContent = 'Registering...';
    btn.disabled = true;

    try {
        const res = await fetch('/api/stores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description })
        });
        const data = await res.json();
        if (data.success) {
            currentStoreId = data.store_id;
            localStorage.setItem('srs_store_id', data.store_id);
            document.getElementById('registerStoreModal').remove();
            loadProducts();
            loadAnalytics();
        } else {
            msgEl.textContent = data.error || 'Failed to register store';
            msgEl.className = 'p-3 rounded-lg text-sm text-center font-medium bg-red-100 text-red-700 block';
            btn.textContent = 'Register Store';
            btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        msgEl.textContent = 'Network error. Please try again.';
        msgEl.className = 'p-3 rounded-lg text-sm text-center font-medium bg-red-100 text-red-700 block';
        btn.textContent = 'Register Store';
        btn.disabled = false;
    }
}

// ─── ADD PRODUCT ─────────────────────────────────────────────
async function handleAddProduct(e) {
    e.preventDefault();
    if (!currentStoreId) { alert('Store not ready. Please refresh.'); return; }

    const submitBtn = document.getElementById('submitProductBtn');
    const formMsg = document.getElementById('form-message');

    const productData = {
        name: document.getElementById('p-name').value.trim(),
        price: parseFloat(document.getElementById('p-price').value),
        stock: parseInt(document.getElementById('p-stock').value) || 0,
        category: document.getElementById('p-category').value,
        size: document.getElementById('p-size').value.trim(),
        description: document.getElementById('p-description').value.trim(),
        image: document.getElementById('p-image').value.trim(),
    };

    if (!productData.name || isNaN(productData.price)) {
        formMsg.textContent = 'Name and Price are required.';
        formMsg.className = 'p-3 rounded-lg text-sm text-center font-bold bg-red-100 text-red-700 block';
        return;
    }

    submitBtn.innerHTML = '<span>Saving...</span>';
    submitBtn.disabled = true;
    formMsg.className = 'hidden';

    try {
        const res = await fetch(`/api/stores/${currentStoreId}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        const data = await res.json();

        if (data.success) {
            document.getElementById('addProductForm').reset();
            document.getElementById('addProductModal').classList.add('hidden');
            showQrModal(data);
            // Reload after short delay so Firebase write propagates
            setTimeout(() => loadProducts(), 800);
        } else {
            formMsg.textContent = data.error || 'Failed to add product';
            formMsg.className = 'p-3 rounded-lg text-sm text-center font-bold bg-red-100 text-red-700 block';
        }
    } catch (err) {
        console.error('Error adding product:', err);
        formMsg.textContent = 'Network error. Please try again.';
        formMsg.className = 'p-3 rounded-lg text-sm text-center font-bold bg-red-100 text-red-700 block';
    } finally {
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-base">save</span> Save & Generate QR';
        submitBtn.disabled = false;
    }
}

// ─── QR MODAL ────────────────────────────────────────────────
function showQrModal(data) {
    const modal = document.getElementById('qrModal');
    const img = document.getElementById('qr-img');
    const nameEl = document.getElementById('qr-product-name');
    const dlBtn = document.getElementById('qr-download-btn');

    const qrUrl = `/api/qr-code/${data.product_id}`;
    img.src = qrUrl;
    nameEl.textContent = data.product_name || 'Product';
    dlBtn.href = qrUrl;
    dlBtn.download = `qr_${data.product_id}.png`;
    modal.classList.remove('hidden');
}

// ─── LOAD PRODUCTS ────────────────────────────────────────────
async function loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) { console.warn('products-container not found'); return; }
    if (!currentStoreId) { console.warn('currentStoreId not set'); return; }

    container.innerHTML = '<div class="text-center py-8 text-gray-400"><span class="material-symbols-outlined text-3xl block mb-2">hourglass_top</span><p class="text-sm">Loading products...</p></div>';

    try {
        const res = await fetch(`/api/stores/${currentStoreId}/products`);
        const raw = await res.json();
        console.log('Products raw:', raw);

        let products = [];
        if (Array.isArray(raw)) {
            products = raw.map(p => ({ id: p.id || p.product_id, ...p }));
        } else if (raw && typeof raw === 'object' && !raw.error) {
            products = Object.entries(raw).map(([id, val]) => ({ id, product_id: id, ...val }));
        }

        // Update stat badges
        const statEl = document.getElementById('total-products-stat');
        const qrEl  = document.getElementById('total-qrs-stat');
        if (statEl) statEl.textContent = products.length;
        if (qrEl)   qrEl.textContent   = products.length;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <span class="material-symbols-outlined text-5xl block mb-3">inventory_2</span>
                    <p class="font-medium">No products yet</p>
                    <p class="text-sm mt-1">Click "Add Product" to get started.</p>
                </div>`;
            return;
        }

        container.innerHTML = `<div class="space-y-3">${products.map(p => `
            <div class="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group">
                ${p.image
                    ? `<img src="${p.image}" class="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0"/>`
                    : `<div class="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0"><span class="material-symbols-outlined">inventory_2</span></div>`
                }
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-gray-800 truncate">${p.name || 'Unknown'}</p>
                    <p class="text-xs text-gray-500">${p.category || ''} ${p.size ? '· ' + p.size : ''}</p>
                    <p class="text-sm font-bold text-green-700">₹${parseFloat(p.price || 0).toFixed(2)} · Stock: ${p.stock || 0}</p>
                </div>
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 sm:flex transition-opacity">
                    <a href="/api/qr-code/${p.id || p.product_id}" target="_blank" title="View QR"
                       class="w-9 h-9 rounded-full bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors">
                        <span class="material-symbols-outlined text-sm">qr_code</span>
                    </a>
                    <button onclick="deleteProduct('${p.id || p.product_id}')" title="Delete"
                       class="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </div>`).join('')}</div>`;
    } catch (err) {
        console.error('loadProducts error:', err);
        container.innerHTML = '<p class="text-center text-red-400 py-8 text-sm">Failed to load products.</p>';
    }
}

// ─── DELETE PRODUCT ───────────────────────────────────────────
async function deleteProduct(productId) {
    if (!confirm('Delete this product?')) return;
    try {
        const res = await fetch(`/api/stores/${currentStoreId}/products/${productId}`, { method: 'DELETE' });
        if (res.ok) {
            loadProducts();
        } else {
            alert('Failed to delete product');
        }
    } catch (e) {
        console.error(e);
    }
}

// ─── ANALYTICS ───────────────────────────────────────────────
async function loadAnalytics() {
    try {
        if (!currentStoreId) return;
        const res = await fetch(`/api/stores/${currentStoreId}/analytics`);
        if (!res.ok) return;
        const analytics = await res.json();
        const el = document.getElementById('total-orders');
        if (el) el.textContent = analytics.total_orders || 0;
    } catch (e) {
        console.error('Analytics error:', e);
    }
}

// ─── REQUESTS ────────────────────────────────────────────────
async function loadRequests() {
    const container = document.getElementById('requests-container');
    if (!container || !currentStoreId) return;

    try {
        const res = await fetch(`/api/stores/${currentStoreId}/requests`);
        const data = await res.json();
        
        let requests = [];
        if (Array.isArray(data)) {
            requests = data;
        } else if (data && typeof data === 'object' && !data.error) {
            // Data is { "item_name": { "count": X } }
            requests = Object.entries(data).map(([name, val]) => ({ name, count: val.count || 0 }));
            requests.sort((a,b) => b.count - a.count);
        }

        if (requests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-6 text-gray-300">
                    <span class="material-symbols-outlined text-3xl block mb-2">sentiment_satisfied</span>
                    <p class="text-xs italic font-medium">No requests yet.</p>
                </div>`;
            return;
        }

        container.innerHTML = requests.map(r => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 mb-2">
                <span class="font-bold text-xs text-gray-800">${r.name}</span>
                <span class="bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">${r.count}</span>
            </div>
        `).join('');
    } catch (e) {
        console.error('Requests error:', e);
    }
}
