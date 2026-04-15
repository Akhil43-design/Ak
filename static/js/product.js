// Product Detail Page JavaScript

// Load product details on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});

// Load product details
async function loadProductDetails() {
    try {
        const response = await fetch(`/api/stores/${storeId}/products/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product details');
        const product = await response.json();

        const productDetail = document.getElementById('product-detail');
        const fallbackImg = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22400%22%20fill%3D%22%23eee%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22Arial%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%20fill%3D%22%23aaa%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E';
        const imageUrl = product.image || fallbackImg;

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
        // Fallback handled silently
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
