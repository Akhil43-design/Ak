// ============================================================
// SkyCommerce — Global Button Functionality
// Handles all interactive button actions site-wide
// ============================================================

// ---- Toast Notification System ----
function showToast(message, type = 'success') {
    const existing = document.getElementById('sc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'sc-toast';
    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        info: 'bg-sky-500',
        warn: 'bg-amber-500'
    };
    toast.className = `fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl text-white font-semibold shadow-2xl transition-all duration-300 ${colors[type] || colors.success}`;
    toast.innerHTML = `<span class="material-symbols-outlined">${type === 'error' ? 'error' : type === 'info' ? 'info' : 'check_circle'}</span> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ---- Add to Cart (generic, by price/name) ----
async function addToCartGeneric(productName, price, imageUrl) {
    const fakeId = 'static_' + productName.replace(/\s+/g, '_').toLowerCase();
    try {
        const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: fakeId,
                store_id: 'featured',
                product_name: productName,
                price: price,
                quantity: 1,
                image: imageUrl || ''
            })
        });
        if (res.ok || res.status === 200) {
            showToast(`"${productName}" added to cart!`);
        } else if (res.status === 401 || res.status === 403) {
            showToast('Please log in to add items to cart', 'info');
            setTimeout(() => window.location.href = '/login', 1500);
        } else {
            showToast('Could not add to cart. Try again.', 'error');
        }
    } catch (e) {
        showToast('Please log in to add items to cart', 'info');
        setTimeout(() => window.location.href = '/login', 1500);
    }
}

// ---- Landing Page Buttons ----
function initLandingButtons() {
    // "Start Shopping" → scroll to stores section
    document.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.trim();

        if (text === 'Start Shopping') {
            btn.onclick = () => {
                const section = document.querySelector('section:nth-of-type(2)') || document.querySelector('#stores-section');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
                else window.location.href = '/customer/dashboard';
            };
        }

        if (text === 'Explore Stores') {
            btn.onclick = () => {
                const section = document.querySelector('section');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
            };
        }

        if (text === 'All Stores' || btn.textContent.includes('All Stores')) {
            btn.onclick = () => window.location.href = '/customer/dashboard';
        }

        if (text === 'View All') {
            btn.onclick = () => window.location.href = '/customer/dashboard';
        }

        if (text === 'Apply Now') {
            btn.onclick = () => window.location.href = '/register';
        }

        // Featured store "Open Store" buttons
        if (text === 'Open Store') {
            btn.onclick = () => window.location.href = '/customer/dashboard';
        }
    });

    // "Add to Cart" buttons on landing (static deal cards)
    const dealCards = document.querySelectorAll('.card-lift');
    dealCards.forEach(card => {
        const addBtn = card.querySelector('button');
        if (addBtn && addBtn.textContent.includes('Add to Cart')) {
            const nameEl = card.querySelector('h3');
            const priceEl = card.querySelector('.text-2xl');
            const imgEl = card.querySelector('img');
            const name = nameEl ? nameEl.textContent.trim() : 'Product';
            const priceText = priceEl ? priceEl.textContent.replace(/[₹,]/g, '').trim() : '999';
            const price = parseFloat(priceText) || 999;
            const imgSrc = imgEl ? imgEl.src : '';
            addBtn.onclick = () => addToCartGeneric(name, price, imgSrc);
        }
    });

    // Search box
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                window.location.href = `/customer/dashboard?search=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    }
}

// ---- Customer Dashboard Buttons ----
function initCustomerDashboardButtons() {
    document.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.trim();

        if (text === 'View All' || text.includes('View All')) {
            btn.onclick = () => {
                const historySection = document.getElementById('history-container');
                if (historySection) historySection.scrollIntoView({ behavior: 'smooth' });
                else window.location.href = '/history';
            };
        }

        if (text.includes('Explore') || text.includes('Browse')) {
            btn.onclick = () => window.location.href = '/customer/dashboard';
        }

        // Notification bell
        if (btn.querySelector('.material-symbols-outlined')?.textContent === 'notifications') {
            btn.onclick = () => showToast('No new notifications', 'info');
        }

        // View All Stores on dashboard
        if (text.includes('All Stores')) {
            btn.onclick = () => window.location.href = '/customer/dashboard';
        }
    });

    // Search filtering on dashboard
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const storeCards = document.querySelectorAll('#stores-list > div');
            storeCards.forEach(card => {
                const name = card.querySelector('h4')?.textContent.toLowerCase() || '';
                card.style.display = name.includes(query) ? '' : 'none';
            });
        });
    }
}

// ---- Store Dashboard Buttons ----
function initStoreDashboardButtons() {
    document.querySelectorAll('button').forEach(btn => {
        const text = btn.textContent.trim();
        const icon = btn.querySelector('.material-symbols-outlined')?.textContent?.trim();

        if (icon === 'share') {
            btn.onclick = () => {
                if (navigator.share) {
                    navigator.share({ title: 'My Store on SkyCommerce', url: window.location.origin });
                } else {
                    navigator.clipboard.writeText(window.location.origin);
                    showToast('Store link copied to clipboard!', 'info');
                }
            };
        }

        if (icon === 'contact_support') {
            btn.onclick = () => showToast('Support: support@skycommerce.in', 'info');
        }

        if (text.includes('View All') && !btn.onclick) {
            btn.onclick = () => {
                const list = document.getElementById('products-list');
                if (list) list.scrollIntoView({ behavior: 'smooth' });
            };
        }
    });
}

// ---- Product Detail Buttons ----
function initProductDetailButtons() {
    // Color swatch buttons — toggle selection
    document.querySelectorAll('button.w-12.h-12.rounded-full').forEach((btn, i) => {
        btn.onclick = () => {
            document.querySelectorAll('button.w-12.h-12.rounded-full').forEach(b => b.classList.remove('ring-2', 'ring-primary'));
            btn.classList.add('ring-2', 'ring-primary');
            showToast(`Color selected`, 'info');
        };
    });

    // Storage option buttons
    document.querySelectorAll('button.py-4.rounded-2xl').forEach(btn => {
        if (['256 GB', '512 GB', '1 TB'].includes(btn.textContent.trim())) {
            btn.onclick = () => {
                document.querySelectorAll('button.py-4.rounded-2xl').forEach(b => {
                    b.classList.remove('border-primary', 'text-primary');
                    b.classList.add('border-transparent', 'text-on-surface');
                });
                btn.classList.add('border-primary', 'text-primary');
                btn.classList.remove('border-transparent', 'text-on-surface');
                showToast(`${btn.textContent.trim()} selected`, 'info');
            };
        }
    });

    // Buy Now
    window.buyNow = function() {
        const addToCartBtn = document.querySelector('button[onclick="addToCart()"]');
        if (addToCartBtn) addToCartBtn.click();
        setTimeout(() => window.location.href = '/checkout', 800);
    };
}

// ---- Cart Page Buttons ----
function initCartButtons() {
    // Proceed to checkout button
    document.querySelectorAll('button').forEach(btn => {
        if (btn.textContent.includes('Checkout') || btn.textContent.includes('Proceed')) {
            btn.onclick = () => window.location.href = '/checkout';
        }
        if (btn.textContent.includes('Continue Shopping')) {
            btn.onclick = () => window.location.href = '/customer/dashboard';
        }
    });
}

// ---- Checkout Page Buttons ----
function initCheckoutButtons() {
    // Payment method toggle
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (typeof toggleAddress === 'function') toggleAddress();
        });
    });
}

// ---- Store View Buttons ----
function initStoreViewButtons() {
    // Category filter links (Electronics, Fashion etc.)
    document.querySelectorAll('.amz-link').forEach(link => {
        if (link.href === '#' || link.href.endsWith('#')) {
            const category = link.textContent.trim();
            link.href = 'javascript:void(0)';
            link.onclick = () => {
                const productCards = document.querySelectorAll('.amz-result-item, .product-card');
                productCards.forEach(card => {
                    const cat = card.dataset.category || '';
                    card.style.display = (cat.toLowerCase().includes(category.toLowerCase()) || category.includes('$')) ? '' : 'none';
                });
                showToast(`Filtered by: ${category}`, 'info');
            };
        }
    });
}

// ---- Register Buttons ----
function initRegisterButtons() {
    // Already handled by inline handleRegistrationSubmit
}

// ---- Auto-initialize based on current page ----
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path === '/' || path === '/home') initLandingButtons();
    if (path.includes('/customer/dashboard')) initCustomerDashboardButtons();
    if (path.includes('/store/dashboard')) initStoreDashboardButtons();
    if (path.includes('/product')) initProductDetailButtons();
    if (path === '/cart') initCartButtons();
    if (path === '/checkout') initCheckoutButtons();
    if (path.includes('/store/') && !path.includes('/dashboard')) initStoreViewButtons();
    if (path === '/register') initRegisterButtons();

    // Global: escape key closes any modals/overlays
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal, .overlay, [role="dialog"]').forEach(el => el.remove());
        }
    });
});
