// Customer Dashboard JavaScript

// Initialize dashboard features
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path === '/customer/dashboard') {
        loadStores();
    } else if (path === '/history') {
        loadHistory();
    }
});

async function loadStores() {
    try {
        const response = await fetch('/api/stores');
        const stores = await response.json();
        renderStores(stores);
    } catch (error) {
        console.error('Error loading stores:', error);
    }
}

function renderStores(stores) {
    const list = document.getElementById('stores-list');
    if (!list) return;

    list.innerHTML = '';

    if (!stores || Object.keys(stores).length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 40px; color: rgba(0,0,0,0.4); grid-column: 1/-1;">
                <p>No stores with active products found nearby.</p>
            </div>`;
        return;
    }

    Object.entries(stores).forEach(([id, store]) => {
        const card = document.createElement('div');
        card.className = 'group relative bg-surface-container-lowest rounded-[2.5rem] overflow-hidden ethereal-shadow ethereal-shadow-hover transition-all duration-300 cursor-pointer';
        card.onclick = () => window.location.href = `/store/${id}`;

        const firstLetter = store.name ? store.name.charAt(0).toUpperCase() : 'S';
        const storeImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh2qcWDieHtFTcaCX9BaROMMfeKS7lkvc3MtUlhCDusVGt4qHc30kteZSD5sVDGBLzX8XsnsBjBsK8w_3UhHG8o4shJMFxLmFVAt1y8mchb1Yv627sJl2FNmI6g8cFazy2ZgtZtNwxnbGnjKWckqRynmXnQTcOvtvbJbYvBAKzfZ46ezC7KRcs7hXYKJCkgDAZadcS94Xnja9Az4VUMt_Vc9Hwi6l6PuV0S7OU-pOJWR9PB2slDN4DPnr2l_1RbGHSU8mUsVRyzYaJ';
        
        card.innerHTML = `
            <div class="h-32 w-full overflow-hidden">
                <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="${storeImageUrl}" loading="lazy"/>
            </div>
            <div class="p-6 pt-0 mt-[-24px] relative">
                <div class="w-16 h-16 rounded-2xl bg-white p-1 ethereal-shadow mb-3 flex items-center justify-center text-primary font-bold text-2xl">
                    ${firstLetter}
                </div>
                <h4 class="text-lg font-bold">${store.name}</h4>
                <p class="text-sm text-on-surface-variant mb-4">${store.description || 'Premium Partner Store'}</p>
                <div class="flex gap-2">
                    <span class="px-3 py-1 bg-surface-container-low text-[10px] font-bold uppercase tracking-wider text-on-surface-variant rounded-full">Active Offers</span>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

// History Logic
async function loadHistory() {
    try {
        const res = await fetch('/api/my-orders');
        const raw = await res.json();
        const container = document.getElementById('history-container');
        if (!container) return;

        // Firebase returns an object keyed by IDs; normalize to array
        let orders = [];
        if (Array.isArray(raw)) {
            orders = raw;
        } else if (raw && typeof raw === 'object' && !raw.error) {
            orders = Object.entries(raw).map(([id, val]) => ({ id, ...val }));
        }

        container.innerHTML = '';
        if (orders.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-sm italic">No recent orders yet.</p>';
            return;
        }
        orders.forEach(order => {
            container.appendChild(createOrderCard(order));
        });
    } catch (e) {
        console.error('loadHistory error:', e);
    }
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'border border-gray-100 rounded-xl p-4 bg-white shadow-sm';
    const orderId = order.id || order.order_id || 'N/A';
    const shortId = typeof orderId === 'string' ? orderId.substring(0, 8) : orderId;
    const date = order.timestamp ? new Date(order.timestamp).toLocaleDateString('en-IN') : 'Unknown';
    const total = order.total != null ? parseFloat(order.total).toFixed(2) : '0.00';

    card.innerHTML = `
        <div class="flex justify-between items-start mb-1">
            <span class="font-bold text-sm text-gray-800">#ORD-${shortId}</span>
            <span class="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Confirmed</span>
        </div>
        <p class="text-sm text-gray-500 mb-3">₹${total} &bull; ${date}</p>
        <button class="text-primary text-xs font-bold hover:underline flex items-center gap-1" onclick="window.location.href='/receipt/${orderId}'">
            View Receipt
        </button>
    `;
    return card;
}

// ==========================================
// MODERN QR SCANNER LOGIC (V12)
// ==========================================

let html5QrCode;
let isScanning = false;
let currentProduct = null;
let soundEnabled = true;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Html5Qrcode === 'undefined' && document.getElementById('qr-reader')) {
        console.error("Html5Qrcode library not found. QR scanning will not work.");
    }
});

function startScanner() {
    const readerElement = document.getElementById("qr-reader");
    if (!readerElement) return;

    // HIDE placeholder, show animation
    const placeholder = document.getElementById('scanner-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    const scanLine = document.getElementById('scan-line');
    const overlay = document.getElementById('scan-overlay');
    if (scanLine) scanLine.style.display = 'block';
    if (overlay) overlay.style.display = 'block';

    // Clear any previous errors
    const errorDiv = document.getElementById('scanner-error');
    if (errorDiv) errorDiv.style.display = 'none';

    html5QrCode = new Html5Qrcode("qr-reader");

    const config = {
        fps: 30,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
        }
    };

    scanned = false; // Reset scan state
    html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
    ).catch(err => {
        console.error("Camera start failed", err);
        showCameraError(err);
    });
}

function showCameraError(err) {
    const errorDiv = document.getElementById('scanner-error');
    const errorMsg = document.getElementById('error-message');
    const placeholder = document.getElementById('scanner-placeholder');

    // Hide scanning visuals
    document.getElementById('scan-line').style.display = 'none';
    if (placeholder) placeholder.style.display = 'none';

    // Determine friendly message
    let msg = "Unable to access camera.";
    if (err.name === 'NotAllowedError') msg = "Access denied. Please enable camera permissions.";
    else if (err.name === 'NotFoundError') msg = "No camera found on this device.";
    else if (err.name === 'NotReadableError') msg = "Camera is being used by another app.";
    else if (err.name === 'OverconstrainedError') msg = "Camera constraints failed. Try a different device.";
    else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') msg = "HTTPS is required for camera security.";

    if (errorDiv && errorMsg) {
        errorDiv.style.display = 'flex';
        errorMsg.innerHTML = `<strong>${msg}</strong><br><br><small style='opacity:0.7; font-size: 0.8em'>${err.name || err}</small>`;
    } else {
        alert(msg + "\n" + err);
    }
}

function onScanSuccess(decodedText, decodedResult) {
    if (!isScanning) {
        // Play Sound
        if (soundEnabled) {
            const audio = document.getElementById("scan-sound");
            if (audio) {
                audio.play().catch(e => console.log("Audio play failed", e));
            }
        }

        isScanning = true;

        // Stop scanning animation
        const scanLine = document.getElementById('scan-line');
        if (scanLine) scanLine.style.display = 'none';

        // Pause scanner (don't stop, just pause processing)
        html5QrCode.pause();

        // Process Data
        handleScannedData(decodedText);
    }
}

function onScanFailure(error) {
    // console.warn(`Code scan error = ${error}`);
}

function handleScannedData(data) {

    let storeId, productId;

    // 1. Try JSON parsing (New QRs)
    try {
        const productData = JSON.parse(data);
        if (productData.store_id && productData.id) {
            storeId = productData.store_id;
            productId = productData.id;
        } else {
            throw new Error("Missing IDs in JSON");
        }
    } catch (e) {
        // 2. Try URL parsing (Legacy/Fallback)
        if (data.includes('/store/') && data.includes('/product/')) {
            // Extract IDs from URL string
            const parts = data.split('/');
            const sIdx = parts.indexOf('store');
            const pIdx = parts.indexOf('product');

            if (sIdx !== -1 && pIdx !== -1) {
                storeId = parts[sIdx + 1];
                productId = parts[pIdx + 1];
            }
        }
    }

    if (storeId && productId) {
        // FETCH FROM BACKEND
        fetchProductDetails(storeId, productId);
    } else {
        // 3. Assume Plain ID (Static QR Mode or Legacy Barcode)
        fetchProductByGlobalId(data);
    }
}

async function fetchProductByGlobalId(productId) {
    try {
        const res = await fetch(`/api/products/${productId}`);
        const product = await res.json();

        if (product.error || !product.id) throw new Error("Product not found");

        // Normalize
        const displayData = {
            id: product.id,
            store_id: product.store_id,
            name: product.name,
            price: `₹${product.price}`,
            weight: product.size || 'N/A',
            store: product.store_name || 'Connect Store',
            image: product.image
        };

        currentProduct = displayData;
        showProductModal(displayData);

    } catch (e) {
        console.error(e);
        // Only alert if we really can't find it
        alert("Product not found in system.\nID: " + productId);
        resetScanner();
    }
}

async function fetchProductDetails(storeId, productId) {
    try {
        const res = await fetch(`/api/stores/${storeId}/products/${productId}`);
        const product = await res.json();

        if (product.error) throw new Error(product.error);

        const displayData = {
            id: productId,
            store_id: storeId,
            name: product.name,
            price: `₹${product.price}`,
            weight: product.size || 'N/A',
            store: 'Connect Store', // Placeholder, could be fetched
            image: product.image
        };

        currentProduct = displayData;
        showProductModal(displayData);

    } catch (err) {
        console.error(err);
        alert("Failed to load product. Please check connection.");
        resetScanner();
    }
}

function showProductModal(data) {
    currentProduct = data; // Save for cart action

    // Populate UI
    document.getElementById('p-name').textContent = data.name || 'Unknown Item';
    document.getElementById('p-price').textContent = data.price || '₹0';
    document.getElementById('p-weight').textContent = data.weight || '-';
    document.getElementById('p-store').textContent = data.store || '-';

    // Show Modal with Animation
    const modal = document.getElementById('result-modal');
    modal.style.display = 'flex';

    // Trigger CSS Transition
    setTimeout(() => {
        document.getElementById('modal-card').classList.add('show');
    }, 10);
}

function resetScanner() {
    isScanning = false;
    currentProduct = null;

    // Hide Modal
    const modal = document.getElementById('result-modal');
    const card = document.getElementById('modal-card');
    if (card) card.classList.remove('show');

    setTimeout(() => {
        if (modal) modal.style.display = 'none';

        // Resume Scanner
        try {
            html5QrCode.resume();
            const scanLine = document.getElementById('scan-line');
            if (scanLine) scanLine.style.display = 'block';
        } catch (e) {
            console.error(e);
            location.reload(); // Fallback if resume fails
        }
    }, 300);
}

async function addToCart() {
    if (!currentProduct) return;

    const btn = document.getElementById('btn-add-cart');
    const originalText = btn.textContent;
    btn.textContent = "ADDING...";
    btn.disabled = true;

    try {
        let payload = {};

        if (currentProduct.id && currentProduct.store_id) {
            payload = {
                product_id: currentProduct.id,
                store_id: currentProduct.store_id,
                product_name: currentProduct.name,
                price: parseFloat(currentProduct.price.replace('₹', '')),
                quantity: 1,
                image: currentProduct.image
            };
        } else {
            console.warn("No ID found in product data (JSON Mode)");
            await new Promise(r => setTimeout(r, 800)); // Fake network lag
            alert("Added to Cart (Demo Mode)");
            resetScanner();
            return;
        }

        const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            btn.textContent = "ADDED ✓";
            setTimeout(() => {
                resetScanner();
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1000);
        } else {
            throw new Error("Failed to add");
        }

    } catch (e) {
        alert("Error adding to cart");
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// File Scan Handler - Uses Python Backend (Hybrid Mode)
// File Scan and Sound Toggle removed as per user request
// function handleFileScan(input) { ... }
// function toggleMute() { ... }

function manualEntry() {
    const code = prompt("Enter product code/URL:");
    if (code) handleScannedData(code);
}
