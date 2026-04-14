// Product Detail Page JavaScript

// Load product details on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});

// Load product details
async function loadProductDetails() {
    try {
        const response = await fetch(`/api/stores/${storeId}/products/${productId}`);
        const product = await response.json();

        const productDetail = document.getElementById('product-detail');
        const imageUrl = product.image || 'https://via.placeholder.com/400x400?text=No+Image';

        const imgEl = document.getElementById('product-main-image');
        if (imgEl) imgEl.src = imageUrl;

        const nameNavEl = document.getElementById('product-name-nav');
        if (nameNavEl) nameNavEl.textContent = product.name;

        const titleEl = document.getElementById('product-title');
        if (titleEl) titleEl.innerHTML = `${product.name} <span class="block text-2xl font-medium text-outline mt-1 italic"></span>`;

        const priceEl = document.getElementById('product-price');
        if (priceEl) priceEl.textContent = `₹${parseFloat(product.price).toFixed(2)}`;

        const stockEl = document.getElementById('product-stock');
        if (stockEl) stockEl.textContent = `Stock Available: ${product.stock}`;

        const descEl = document.getElementById('product-description');
        if (descEl) descEl.textContent = product.description || 'No description available';

        const qrCodeSection = document.getElementById('qr-code-section');
        const qrCodeImg = document.getElementById('product-qr-code');
        if (qrCodeSection && qrCodeImg) {
            qrCodeImg.src = `/api/qr/${storeId}/${productId}`;
            qrCodeSection.classList.remove('hidden');
        }

    } catch (error) {
        console.error('Error loading product:', error);
        // Fallback or error state can be handled here without wiping the whole page
    }
}

// Add to cart
async function addToCart() {
    try {
        // Get product details first
        const response = await fetch(`/api/stores/${storeId}/products/${productId}`);
        const product = await response.json();

        const cartData = {
            product_id: productId,
            store_id: storeId,
            product_name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image
        };

        const cartResponse = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cartData)
        });

        if (cartResponse.ok) {
            alert('Product added to cart!');
        } else {
            alert('Failed to add to cart');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred');
    }
}
