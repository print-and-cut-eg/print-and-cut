// cart.js — Thin re-export so cart.html can use these functions independently
// All cart functions are defined in main.js and shared globally
// This file exists as a placeholder for future cart-specific logic

// Cart page specific rendering
function renderCartPage() {
    const container = document.getElementById('cart-page-items-list');
    const summaryContainer = document.getElementById('cart-page-summary');
    
    if (!container) return;

    const cart = getCart();
    const { subtotal, shipping, total } = getCartTotals();

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="padding:80px 30px;text-align:center;">
                <div style="font-size:56px;margin-bottom:20px;">🛒</div>
                <h3 style="font-size:22px;font-weight:800;color:var(--text-dark);margin-bottom:10px;">السلة فاضية</h3>
                <p style="color:var(--text-muted);margin-bottom:28px;">اضف منتجات من صفحة المنتجات</p>
                <a href="products.html" class="btn btn-primary">تصفح المنتجات ←</a>
            </div>
        `;
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-page-item">
                <div class="cart-page-img">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-page-info">
                    <div class="cart-page-name">${item.name}</div>
                    ${item.option ? `<div class="cart-page-option">${item.option}</div>` : ''}
                    <div class="cart-item-controls" style="margin-top:10px;">
                        <button class="qty-btn" onclick="changePageQty('${item.key}', -1)">−</button>
                        <span class="qty-display">${item.qty}</span>
                        <button class="qty-btn" onclick="changePageQty('${item.key}', 1)">+</button>
                        <button class="cart-remove-btn" onclick="removePageItem('${item.key}')">حذف</button>
                    </div>
                </div>
                <div class="cart-page-price">${(item.price * item.qty).toLocaleString()} EGP</div>
            </div>
        `).join('');
    }

    // Update summary
    const subEl = document.getElementById('page-subtotal');
    const shipEl = document.getElementById('page-shipping');
    const totalEl = document.getElementById('page-total');

    if (subEl) subEl.textContent = `${subtotal.toLocaleString()} EGP`;
    if (shipEl) shipEl.textContent = shipping > 0 ? `${shipping} EGP` : 'مجاني';
    if (totalEl) totalEl.textContent = `${total.toLocaleString()} EGP`;
}

function changePageQty(key, delta) {
    updateCartQty(key, delta);
    renderCartPage();
}

function removePageItem(key) {
    removeFromCart(key);
    renderCartPage();
    showToast('تم حذف المنتج من السلة');
}
