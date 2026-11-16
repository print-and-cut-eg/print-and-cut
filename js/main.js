// ===================================
// PRINT&CUT — MAIN JS
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initCart();
    initScrollReveal();
    initToast();
    updateCartCount();
    initHeroAnimations();
});

// === HEADER ===
function initHeader() {
    const header = document.querySelector('.site-header');
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (!header) return;

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // Hamburger
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            mobileNav.classList.toggle('open');
        });

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                mobileNav.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
                hamburger.classList.remove('open');
                mobileNav.classList.remove('open');
            }
        });
    }

    // Search btn
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const search = document.getElementById('search-input');
            if (search) search.focus();
            else window.location.href = 'products.html';
        });
    }
}

// === CART SIDEBAR ===
function initCart() {
    const cartBtn = document.getElementById('cart-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartClose = document.getElementById('cart-close');

    if (!cartBtn) return;

    const openCart = () => {
        cartOverlay && cartOverlay.classList.add('open');
        cartSidebar && cartSidebar.classList.add('open');
        document.body.style.overflow = 'hidden';
        renderCartSidebar();
    };

    const closeCart = () => {
        cartOverlay && cartOverlay.classList.remove('open');
        cartSidebar && cartSidebar.classList.remove('open');
        document.body.style.overflow = '';
    };

    cartBtn.addEventListener('click', openCart);
    cartClose && cartClose.addEventListener('click', closeCart);
    cartOverlay && cartOverlay.addEventListener('click', closeCart);
}

// === SCROLL REVEAL ===
function initScrollReveal() {
    const items = document.querySelectorAll('.reveal:not(.revealed)');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    items.forEach(item => observer.observe(item));
}

// === TOAST ===
let toastContainer;

function initToast() {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
}

function showToast(message, type = 'success') {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${message}`;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 350);
    }, 3000);
}

// === CART COUNT ===
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = count;
        if (count > 0) {
            el.classList.add('visible');
        } else {
            el.classList.remove('visible');
        }
    });
}

function bumpCartCount() {
    document.querySelectorAll('.cart-count').forEach(el => {
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
    });
}

// === CART STORAGE ===
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('pc_cart') || '[]');
    } catch { return []; }
}

function saveCart(cart) {
    localStorage.setItem('pc_cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(product, option = '', qty = 1) {
    if (!product) return false;
    const cart = getCart();
    const key = `${product.id}_${option}`;
    const existing = cart.find(item => item.key === key);
    
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({
            key,
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.price,
            option,
            qty,
        });
    }
    
    saveCart(cart);
    showToast('تمت إضافة المنتج للسلة ✓');
    bumpCartCount();
    return true;
}

function removeFromCart(key) {
    const cart = getCart().filter(item => item.key !== key);
    saveCart(cart);
}

function updateCartQty(key, delta) {
    const cart = getCart();
    const item = cart.find(i => i.key === key);
    if (item) {
        item.qty = Math.max(1, item.qty + delta);
        saveCart(cart);
    }
}

function clearCart() {
    saveCart([]);
}

function getCartTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = cart.length > 0 ? CONFIG.shippingFee : 0;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
}

// === RENDER CART SIDEBAR ===
function renderCartSidebar() {
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartShipping = document.getElementById('cart-shipping');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;

    const cart = getCart();
    const { subtotal, shipping, total } = getCartTotals();

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <span class="empty-icon">🛒</span>
                <h4>السلة فاضية</h4>
                <p>اضف منتجات وتعالى تشوفهم هنا</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-img">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    ${item.option ? `<div class="cart-item-option">${item.option}</div>` : ''}
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="changeQty('${item.key}', -1)">−</button>
                        <span class="qty-display">${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty('${item.key}', 1)">+</button>
                        <span class="cart-item-remove" onclick="removeItem('${item.key}')">حذف</span>
                    </div>
                </div>
                <div class="cart-item-price">${(item.price * item.qty).toLocaleString()} ${CONFIG.currency}</div>
            </div>
        `).join('');
    }

    if (cartSubtotal) cartSubtotal.textContent = `${subtotal.toLocaleString()} ${CONFIG.currency}`;
    if (cartShipping) cartShipping.textContent = shipping > 0 ? `${shipping} ${CONFIG.currency}` : 'مجاني';
    if (cartTotal) cartTotal.textContent = `${total.toLocaleString()} ${CONFIG.currency}`;
}

function changeQty(key, delta) {
    updateCartQty(key, delta);
    renderCartSidebar();
}

function removeItem(key) {
    removeFromCart(key);
    renderCartSidebar();
    showToast('تم حذف المنتج من السلة');
}

// === HERO ANIMATIONS ===
function initHeroAnimations() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const heroVisual = document.querySelector('.hero-visual');
        if (heroVisual && scrolled < window.innerHeight) {
            heroVisual.style.transform = `translateY(${scrolled * 0.06}px)`;
        }
    }, { passive: true });
}

// === CATEGORY FILTER ===
function initCategoryFilter(containerId) {
    const pills = document.querySelectorAll(`#${containerId} .category-pill`);
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const cat = pill.dataset.cat;
            filterProducts(cat);
        });
    });
}

// Global filterProducts placeholder - overridden by page scripts
function filterProducts(category) {}

// === SMOOTH SCROLL ===
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
