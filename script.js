// Utility function for notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        font-size: 14px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.cartModal = document.getElementById('cartModal');
        this.cartIcon = document.getElementById('cartIcon');
        this.cartBadge = document.getElementById('cartBadge');
        this.cartItems = document.getElementById('cartItems');
        this.cartEmpty = document.getElementById('cartEmpty');
        this.cartFooter = document.getElementById('cartFooter');
        this.cartClose = document.getElementById('cartClose');
        this.cartOverlay = document.getElementById('cartOverlay');
        this.totalAmount = document.getElementById('totalAmount');
        this.clearCart = document.getElementById('clearCart');
        this.checkoutBtn = document.getElementById('checkoutBtn');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateCartDisplay();
        this.updateCartBadge();
        this.updateUserInterface(); // Initialize user interface state
    }
    
    bindEvents() {
        // Cart icon click
        this.cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            this.openCart();
        });
        
        // Search icon click
        const searchIcon = document.getElementById('searchIcon');
        if (searchIcon) {
            searchIcon.addEventListener('click', (e) => {
                e.preventDefault();
                showSearchModal();
            });
        }
        
        // User icon click
        const userIcon = document.querySelector('.nav-icon:last-child');
        if (userIcon) {
            userIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.showUserModal();
            });
        }
        
        // Hamburger menu
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            // Close menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
        
        // Close cart
        this.cartClose.addEventListener('click', () => this.closeCart());
        this.cartOverlay.addEventListener('click', () => this.closeCart());
        
        // Clear cart
        this.clearCart.addEventListener('click', () => this.clearCartItems());
        
        // Checkout
        this.checkoutBtn.addEventListener('click', () => this.checkout());
        
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-add-cart')) {
                const productCard = e.target.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = productCard.querySelector('.product-price').textContent;
                this.addToCart(productName, productPrice);
            }
            
            // Quick view buttons
            if (e.target.classList.contains('btn-quick-view')) {
                const productCard = e.target.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                const productPrice = productCard.querySelector('.product-price').textContent;
                this.showQuickViewModal(productName, productPrice);
            }
            
            // Wishlist buttons
            if (e.target.classList.contains('btn-wishlist') || e.target.closest('.btn-wishlist')) {
                const wishlistBtn = e.target.classList.contains('btn-wishlist') ? e.target : e.target.closest('.btn-wishlist');
                const productCard = wishlistBtn.closest('.product-card');
                const productName = productCard.querySelector('h3').textContent;
                this.toggleWishlist(wishlistBtn, productName);
            }
        });
    }
    
    addToCart(name, price) {
        const priceNumber = parseInt(price.replace(/[^\d]/g, ''));
        const existingItem = this.cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: Date.now(),
                name: name,
                price: priceNumber,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartBadge();
        this.showAddToCartNotification(name);
    }
    
    removeFromCart(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartBadge();
    }
    
    updateQuantity(id, quantity) {
        const item = this.cart.find(item => item.id === id);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(id);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartDisplay();
                this.updateCartBadge();
            }
        }
    }
    
    clearCartItems() {
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartBadge();
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    
    updateCartDisplay() {
        if (this.cart.length === 0) {
            this.cartItems.classList.remove('active');
            this.cartEmpty.classList.add('active');
            this.cartFooter.classList.remove('active');
        } else {
            this.cartItems.classList.add('active');
            this.cartEmpty.classList.remove('active');
            this.cartFooter.classList.add('active');
            this.renderCartItems();
            this.updateTotal();
        }
    }
    
    renderCartItems() {
        this.cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <i class="fas fa-tshirt"></i>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${this.formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="shoppingCart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                               onchange="shoppingCart.updateQuantity(${item.id}, parseInt(this.value))">
                        <button class="quantity-btn" onclick="shoppingCart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item" onclick="shoppingCart.removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    updateTotal() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.totalAmount.textContent = this.formatPrice(total);
    }
    
    updateCartBadge() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        this.cartBadge.textContent = totalItems;
        
        if (totalItems > 0) {
            this.cartBadge.classList.add('active');
        } else {
            this.cartBadge.classList.remove('active');
        }
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    }
    
    openCart() {
        this.cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeCart() {
        this.cartModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    showAddToCartNotification(productName) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'add-to-cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Đã thêm "${productName}" vào giỏ hàng</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    checkout() {
        if (this.cart.length === 0) {
            showNotification('Giỏ hàng trống!', 'error');
            return;
        }
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    }
    
    showQuickViewModal(productName, productPrice) {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="quick-view-overlay">
                <div class="quick-view-content">
                    <div class="quick-view-header">
                        <h3>Xem nhanh sản phẩm</h3>
                        <button class="quick-view-close">&times;</button>
                    </div>
                    <div class="quick-view-body">
                        <div class="product-preview">
                            <div class="product-image">
                                <i class="fas fa-tshirt"></i>
                            </div>
                        </div>
                        <div class="product-details">
                            <h4>${productName}</h4>
                            <p class="product-price">${productPrice}</p>
                            <div class="product-description">
                                <p>Sản phẩm chất lượng cao với thiết kế hiện đại và thoải mái khi mặc.</p>
                            </div>
                            <div class="size-selection">
                                <h5>Chọn kích thước:</h5>
                                <div class="size-buttons">
                                    <button class="size-btn" data-size="S">S</button>
                                    <button class="size-btn" data-size="M">M</button>
                                    <button class="size-btn" data-size="L">L</button>
                                    <button class="size-btn" data-size="XL">XL</button>
                                </div>
                            </div>
                            <div class="quantity-selection">
                                <h5>Số lượng:</h5>
                                <div class="quantity-controls">
                                    <button class="quantity-btn" onclick="this.parentElement.querySelector('input').value = Math.max(1, parseInt(this.parentElement.querySelector('input').value) - 1)">-</button>
                                    <input type="number" value="1" min="1" class="quantity-input">
                                    <button class="quantity-btn" onclick="this.parentElement.querySelector('input').value = parseInt(this.parentElement.querySelector('input').value) + 1">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="quick-view-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.quick-view-modal').remove()">Đóng</button>
                        <button class="btn btn-primary add-to-cart-quick">Thêm vào giỏ hàng</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .quick-view-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
                animation: fadeIn 0.3s ease;
            }
            
            .quick-view-overlay {
                background: rgba(0, 0, 0, 0.5);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .quick-view-content {
                background: white;
                border-radius: 15px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease;
            }
            
            .quick-view-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .quick-view-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .quick-view-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                padding: 30px;
            }
            
            .product-preview {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .product-image {
                width: 200px;
                height: 200px;
                background: #f8f9fa;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
                color: #666;
            }
            
            .product-details h4 {
                font-size: 24px;
                margin-bottom: 10px;
                color: #333;
            }
            
            .product-details .product-price {
                font-size: 20px;
                color: #e74c3c;
                font-weight: 600;
                margin-bottom: 20px;
            }
            
            .product-description {
                margin-bottom: 20px;
                color: #666;
                line-height: 1.6;
            }
            
            .size-selection, .quantity-selection {
                margin-bottom: 20px;
            }
            
            .size-selection h5, .quantity-selection h5 {
                margin-bottom: 10px;
                color: #333;
                font-size: 16px;
            }
            
            .size-buttons {
                display: flex;
                gap: 10px;
            }
            
            .size-btn {
                padding: 10px 15px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .size-btn:hover, .size-btn.active {
                background: #000;
                color: white;
                border-color: #000;
            }
            
            .quick-view-footer {
                display: flex;
                gap: 15px;
                padding: 20px 30px;
                border-top: 1px solid #f0f0f0;
                justify-content: flex-end;
            }
            
            @media (max-width: 768px) {
                .quick-view-body {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Modal interactions
        const closeBtn = modal.querySelector('.quick-view-close');
        const overlay = modal.querySelector('.quick-view-overlay');
        const addToCartBtn = modal.querySelector('.add-to-cart-quick');
        const sizeBtns = modal.querySelectorAll('.size-btn');
        
        // Close modal
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) modal.remove();
        });
        
        // Size selection
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Add to cart from quick view
        addToCartBtn.addEventListener('click', () => {
            const selectedSize = modal.querySelector('.size-btn.active');
            const quantity = parseInt(modal.querySelector('.quantity-input').value);
            
            if (!selectedSize) {
                showNotification('Vui lòng chọn kích thước!', 'error');
                return;
            }
            
            // Add to cart multiple times based on quantity
            for (let i = 0; i < quantity; i++) {
                this.addToCart(productName, productPrice);
            }
            
            showNotification(`Đã thêm ${quantity} "${productName}" (${selectedSize.textContent}) vào giỏ hàng!`);
            modal.remove();
        });
        
        // Add "Buy Now" button functionality
        const buyNowBtn = modal.querySelector('.btn-secondary');
        if (buyNowBtn) {
            buyNowBtn.textContent = 'Mua ngay';
            buyNowBtn.className = 'btn btn-primary buy-now-btn';
            buyNowBtn.addEventListener('click', () => {
                const selectedSize = modal.querySelector('.size-btn.active');
                const quantity = parseInt(modal.querySelector('.quantity-input').value);
                
                if (!selectedSize) {
                    showNotification('Vui lòng chọn kích thước!', 'error');
                    return;
                }
                
                // Clear cart first
                this.clearCartItems();
                
                // Add to cart multiple times based on quantity
                for (let i = 0; i < quantity; i++) {
                    this.addToCart(productName, productPrice);
                }
                
                showNotification(`Đã thêm ${quantity} "${productName}" (${selectedSize.textContent}) vào giỏ hàng!`);
                modal.remove();
                
                // Redirect to checkout
                setTimeout(() => {
                    window.location.href = 'checkout.html';
                }, 1000);
            });
        }
    }
    
    toggleWishlist(button, productName) {
        const icon = button.querySelector('i');
        const isWishlisted = icon.classList.contains('fas');
        
        if (isWishlisted) {
            icon.classList.remove('fas');
            icon.classList.add('far');
            showNotification(`Đã xóa "${productName}" khỏi danh sách yêu thích`);
        } else {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#e74c3c';
            showNotification(`Đã thêm "${productName}" vào danh sách yêu thích`);
        }
    }
    
    showUserModal() {
        const user = this.getCurrentUser();
        const modal = document.createElement('div');
        modal.className = 'user-modal';
        
        if (user) {
            // User is logged in
            modal.innerHTML = `
                <div class="user-overlay">
                    <div class="user-content">
                        <div class="user-header">
                            <h3><i class="fas fa-user-check"></i> Tài khoản</h3>
                            <button class="user-close">&times;</button>
                        </div>
                        <div class="user-body">
                            <div class="user-info">
                                <div class="user-avatar">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="user-details">
                                    <h4>${user.fullName}</h4>
                                    <p>${user.email}</p>
                                </div>
                            </div>
                            <div class="user-options">
                                <button class="user-option" onclick="shoppingCart.showProfileModal()">
                                    <i class="fas fa-user-circle"></i>
                                    <span>Thông tin cá nhân</span>
                                </button>
                                <button class="user-option" onclick="shoppingCart.showOrderHistory()">
                                    <i class="fas fa-history"></i>
                                    <span>Lịch sử đơn hàng</span>
                                </button>
                                <button class="user-option" onclick="shoppingCart.showWishlist()">
                                    <i class="fas fa-heart"></i>
                                    <span>Sản phẩm yêu thích</span>
                                </button>
                                <button class="user-option" onclick="shoppingCart.showSettings()">
                                    <i class="fas fa-cog"></i>
                                    <span>Cài đặt</span>
                                </button>
                                <button class="user-option logout-option" onclick="shoppingCart.logout()">
                                    <i class="fas fa-sign-out-alt"></i>
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // User is not logged in
            modal.innerHTML = `
                <div class="user-overlay">
                    <div class="user-content">
                        <div class="user-header">
                            <h3><i class="fas fa-user"></i> Tài khoản</h3>
                            <button class="user-close">&times;</button>
                        </div>
                        <div class="user-body">
                            <div class="user-options">
                                <button class="user-option" onclick="shoppingCart.showLoginModal()">
                                    <i class="fas fa-sign-in-alt"></i>
                                    <span>Đăng nhập</span>
                                </button>
                                <button class="user-option" onclick="shoppingCart.showRegisterModal()">
                                    <i class="fas fa-user-plus"></i>
                                    <span>Đăng ký</span>
                                </button>
                                <button class="user-option" onclick="shoppingCart.showGuestInfo()">
                                    <i class="fas fa-info-circle"></i>
                                    <span>Thông tin khách</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .user-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
                animation: fadeIn 0.3s ease;
            }
            
            .user-overlay {
                background: rgba(0, 0, 0, 0.5);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .user-content {
                background: white;
                border-radius: 15px;
                max-width: 400px;
                width: 100%;
                animation: slideIn 0.3s ease;
            }
            
            .user-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .user-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .user-body {
                padding: 30px;
            }
            
            .user-options {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .user-option {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                border: 1px solid #f0f0f0;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 16px;
                color: #333;
            }
            
            .user-option:hover {
                background: #f8f9fa;
                border-color: #000;
            }
            
            .user-option i {
                font-size: 18px;
                width: 20px;
                text-align: center;
            }
            
            .user-info {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .user-avatar {
                width: 50px;
                height: 50px;
                background: #e9ecef;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                color: #666;
            }
            
            .user-details h4 {
                margin: 0 0 5px 0;
                font-size: 16px;
                color: #333;
            }
            
            .user-details p {
                margin: 0;
                font-size: 14px;
                color: #666;
            }
            
            .logout-option {
                border-color: #dc3545 !important;
                color: #dc3545 !important;
            }
            
            .logout-option:hover {
                background: #dc3545 !important;
                color: white !important;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Modal interactions
        const closeBtn = modal.querySelector('.user-close');
        const overlay = modal.querySelector('.user-overlay');
        
        // Close modal
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) modal.remove();
        });
    }
    
    showLoginModal() {
        this.showAuthModal('login');
    }
    
    showRegisterModal() {
        this.showAuthModal('register');
    }
    
    showProfileModal() {
        if (this.isLoggedIn()) {
            this.showUserProfileModal();
        } else {
            showNotification('Vui lòng đăng nhập để xem thông tin cá nhân!', 'error');
        }
    }
    
    showOrderHistory() {
        if (this.isLoggedIn()) {
            this.showOrderHistoryModal();
        } else {
            showNotification('Vui lòng đăng nhập để xem lịch sử đơn hàng!', 'error');
        }
    }
    
    showAuthModal(type) {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-overlay">
                <div class="auth-content">
                    <div class="auth-header">
                        <h3><i class="fas ${type === 'login' ? 'fa-sign-in-alt' : 'fa-user-plus'}"></i> 
                            ${type === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h3>
                        <button class="auth-close">&times;</button>
                    </div>
                    <div class="auth-body">
                        <form class="auth-form" id="authForm">
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="password">Mật khẩu</label>
                                <input type="password" id="password" name="password" required>
                            </div>
                            ${type === 'register' ? `
                                <div class="form-group">
                                    <label for="confirmPassword">Xác nhận mật khẩu</label>
                                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                                </div>
                                <div class="form-group">
                                    <label for="fullName">Họ và tên</label>
                                    <input type="text" id="fullName" name="fullName" required>
                                </div>
                                <div class="form-group">
                                    <label for="phone">Số điện thoại</label>
                                    <input type="tel" id="phone" name="phone" required>
                                </div>
                            ` : ''}
                            <button type="submit" class="btn btn-primary auth-submit">
                                ${type === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                            </button>
                        </form>
                        <div class="auth-divider">
                            <span>hoặc</span>
                        </div>
                        <div class="social-login">
                            <button class="btn btn-social btn-google">
                                <i class="fab fa-google"></i>
                                ${type === 'login' ? 'Đăng nhập' : 'Đăng ký'} với Google
                            </button>
                            <button class="btn btn-social btn-facebook">
                                <i class="fab fa-facebook-f"></i>
                                ${type === 'login' ? 'Đăng nhập' : 'Đăng ký'} với Facebook
                            </button>
                        </div>
                        <div class="auth-footer">
                            ${type === 'login' ? 
                                '<p>Chưa có tài khoản? <a href="#" class="switch-auth" data-type="register">Đăng ký ngay</a></p>' :
                                '<p>Đã có tài khoản? <a href="#" class="switch-auth" data-type="login">Đăng nhập</a></p>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
                animation: fadeIn 0.3s ease;
            }
            
            .auth-overlay {
                background: rgba(0, 0, 0, 0.5);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .auth-content {
                background: white;
                border-radius: 15px;
                max-width: 450px;
                width: 100%;
                animation: slideIn 0.3s ease;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .auth-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .auth-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .auth-body {
                padding: 30px;
            }
            
            .auth-form {
                margin-bottom: 20px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #333;
            }
            
            .form-group input {
                width: 100%;
                padding: 12px 15px;
                border: 2px solid #f0f0f0;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.3s ease;
                box-sizing: border-box;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: #000;
            }
            
            .auth-submit {
                width: 100%;
                padding: 15px;
                font-size: 16px;
                font-weight: 600;
                margin-top: 10px;
            }
            
            .auth-divider {
                text-align: center;
                margin: 20px 0;
                position: relative;
            }
            
            .auth-divider::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 1px;
                background: #f0f0f0;
            }
            
            .auth-divider span {
                background: white;
                padding: 0 15px;
                color: #666;
                font-size: 14px;
            }
            
            .social-login {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .btn-social {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 12px;
                border: 2px solid #f0f0f0;
                background: white;
                color: #333;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 14px;
                font-weight: 500;
            }
            
            .btn-social:hover {
                border-color: #000;
                background: #f8f9fa;
            }
            
            .btn-google:hover {
                border-color: #db4437;
                color: #db4437;
            }
            
            .btn-facebook:hover {
                border-color: #4267B2;
                color: #4267B2;
            }
            
            .auth-footer {
                text-align: center;
                margin-top: 20px;
            }
            
            .auth-footer p {
                color: #666;
                font-size: 14px;
            }
            
            .auth-footer a {
                color: #000;
                text-decoration: none;
                font-weight: 600;
            }
            
            .auth-footer a:hover {
                text-decoration: underline;
            }
            
            @media (max-width: 480px) {
                .auth-content {
                    margin: 10px;
                }
                
                .auth-body {
                    padding: 20px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Modal interactions
        const closeBtn = modal.querySelector('.auth-close');
        const overlay = modal.querySelector('.auth-overlay');
        const form = modal.querySelector('.auth-form');
        const switchAuth = modal.querySelector('.switch-auth');
        
        // Close modal
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) modal.remove();
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit(type, form, modal);
        });
        
        // Switch between login and register
        if (switchAuth) {
            switchAuth.addEventListener('click', (e) => {
                e.preventDefault();
                modal.remove();
                this.showAuthModal(switchAuth.dataset.type);
            });
        }
        
        // Social login buttons
        const googleBtn = modal.querySelector('.btn-google');
        const facebookBtn = modal.querySelector('.btn-facebook');
        
        googleBtn.addEventListener('click', () => {
            showNotification('Chức năng đăng nhập Google sẽ được phát triển trong tương lai!');
        });
        
        facebookBtn.addEventListener('click', () => {
            showNotification('Chức năng đăng nhập Facebook sẽ được phát triển trong tương lai!');
        });
    }
    
    handleAuthSubmit(type, form, modal) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Basic validation
        if (!email || !password) {
            showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Email không hợp lệ!', 'error');
            return;
        }
        
        if (type === 'register') {
            const confirmPassword = formData.get('confirmPassword');
            const fullName = formData.get('fullName');
            const phone = formData.get('phone');
            
            if (!fullName || !phone) {
                showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Mật khẩu xác nhận không khớp!', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
                return;
            }
            
            // Phone validation
            const phoneRegex = /^[0-9]{10,11}$/;
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                showNotification('Số điện thoại không hợp lệ!', 'error');
                return;
            }
            
            // Simulate registration
            this.registerUser({ email, password, fullName, phone });
            modal.remove();
            showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
            
        } else {
            // Simulate login
            this.loginUser({ email, password });
            modal.remove();
        }
    }
    
    registerUser(userData) {
        // Store user data in localStorage (in real app, this would be sent to server)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUser = users.find(user => user.email === userData.email);
        
        if (existingUser) {
            showNotification('Email đã được sử dụng!', 'error');
            return;
        }
        
        users.push({
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    loginUser(credentials) {
        // Show loading state
        const submitBtn = document.querySelector('.auth-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Đang đăng nhập...';
        submitBtn.disabled = true;
        
        // Simulate API delay
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
            
            if (user) {
                // Store logged in user
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.updateUserInterface();
                showNotification(`Chào mừng trở lại, ${user.fullName}!`, 'success');
            } else {
                showNotification('Email hoặc mật khẩu không đúng!', 'error');
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }, 1000);
    }
    
    logout() {
        localStorage.removeItem('currentUser');
        this.updateUserInterface();
        showNotification('Đã đăng xuất thành công!', 'success');
    }
    
    isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }
    
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
    
    updateUserInterface() {
        const user = this.getCurrentUser();
        const userIcon = document.querySelector('.nav-icon:last-child');
        
        if (user) {
            // Update user icon to show logged in state
            userIcon.innerHTML = '<i class="fas fa-user-check"></i>';
            userIcon.style.color = '#28a745';
        } else {
            // Reset user icon
            userIcon.innerHTML = '<i class="fas fa-user"></i>';
            userIcon.style.color = '#333';
        }
    }
    
    showUserProfileModal() {
        const user = this.getCurrentUser();
        const modal = document.createElement('div');
        modal.className = 'profile-modal';
        modal.innerHTML = `
            <div class="profile-overlay">
                <div class="profile-content">
                    <div class="profile-header">
                        <h3><i class="fas fa-user-circle"></i> Thông tin cá nhân</h3>
                        <button class="profile-close">&times;</button>
                    </div>
                    <div class="profile-body">
                        <div class="profile-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="profile-info">
                            <div class="info-item">
                                <label>Họ và tên:</label>
                                <span>${user.fullName}</span>
                            </div>
                            <div class="info-item">
                                <label>Email:</label>
                                <span>${user.email}</span>
                            </div>
                            <div class="info-item">
                                <label>Số điện thoại:</label>
                                <span>${user.phone}</span>
                            </div>
                            <div class="info-item">
                                <label>Ngày tham gia:</label>
                                <span>${new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                        </div>
                        <div class="profile-actions">
                            <button class="btn btn-secondary" onclick="shoppingCart.logout()">Đăng xuất</button>
                            <button class="btn btn-primary">Cập nhật thông tin</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .profile-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
                animation: fadeIn 0.3s ease;
            }
            
            .profile-overlay {
                background: rgba(0, 0, 0, 0.5);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .profile-content {
                background: white;
                border-radius: 15px;
                max-width: 500px;
                width: 100%;
                animation: slideIn 0.3s ease;
            }
            
            .profile-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .profile-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .profile-body {
                padding: 30px;
                text-align: center;
            }
            
            .profile-avatar {
                width: 80px;
                height: 80px;
                background: #f8f9fa;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                font-size: 32px;
                color: #666;
            }
            
            .profile-info {
                margin-bottom: 30px;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .info-item:last-child {
                border-bottom: none;
            }
            
            .info-item label {
                font-weight: 600;
                color: #333;
            }
            
            .info-item span {
                color: #666;
            }
            
            .profile-actions {
                display: flex;
                gap: 15px;
            }
            
            .profile-actions .btn {
                flex: 1;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Modal interactions
        const closeBtn = modal.querySelector('.profile-close');
        const overlay = modal.querySelector('.profile-overlay');
        
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) modal.remove();
        });
    }
    
    showOrderHistoryModal() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const user = this.getCurrentUser();
        
        // Filter orders for current user
        const userOrders = user ? orders.filter(order => order.customer.email === user.email) : [];
        
        const modal = document.createElement('div');
        modal.className = 'order-history-modal';
        
        if (userOrders.length === 0) {
            modal.innerHTML = `
                <div class="order-history-overlay">
                    <div class="order-history-content">
                        <div class="order-history-header">
                            <h3><i class="fas fa-history"></i> Lịch sử đơn hàng</h3>
                            <button class="order-history-close">&times;</button>
                        </div>
                        <div class="order-history-body">
                            <div class="order-history-empty">
                                <i class="fas fa-shopping-bag"></i>
                                <p>Chưa có đơn hàng nào</p>
                                <span>Bạn chưa thực hiện đơn hàng nào. Hãy bắt đầu mua sắm!</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            const ordersHtml = userOrders.map(order => `
                <div class="order-item-history">
                    <div class="order-header">
                        <div class="order-info">
                            <h4>Đơn hàng #${order.id}</h4>
                            <p>Ngày đặt: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                            <p>Trạng thái: <span class="status ${order.status}">${this.getStatusText(order.status)}</span></p>
                        </div>
                        <div class="order-total">
                            <strong>${this.formatPrice(order.total)}</strong>
                        </div>
                    </div>
                    <div class="order-items-history">
                        ${order.items.map(item => `
                            <div class="history-item">
                                <div class="item-icon">
                                    <i class="fas fa-tshirt"></i>
                                </div>
                                <div class="item-info">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-details">${this.formatPrice(item.price)} x ${item.quantity}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-secondary btn-sm" onclick="shoppingCart.viewOrderDetails('${order.id}')">
                            <i class="fas fa-eye"></i> Xem chi tiết
                        </button>
                    </div>
                </div>
            `).join('');
            
            modal.innerHTML = `
                <div class="order-history-overlay">
                    <div class="order-history-content">
                        <div class="order-history-header">
                            <h3><i class="fas fa-history"></i> Lịch sử đơn hàng</h3>
                            <button class="order-history-close">&times;</button>
                        </div>
                        <div class="order-history-body">
                            <div class="orders-list">
                                ${ordersHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .order-history-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
                animation: fadeIn 0.3s ease;
            }
            
            .order-history-overlay {
                background: rgba(0, 0, 0, 0.5);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .order-history-content {
                background: white;
                border-radius: 15px;
                max-width: 600px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease;
            }
            
            .order-history-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .order-history-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .order-history-body {
                padding: 30px;
            }
            
            .order-history-empty {
                text-align: center;
                padding: 40px 20px;
            }
            
            .order-history-empty i {
                font-size: 48px;
                color: #ccc;
                margin-bottom: 15px;
            }
            
            .order-history-empty p {
                font-size: 18px;
                font-weight: 500;
                color: #666;
                margin-bottom: 10px;
            }
            
            .order-history-empty span {
                font-size: 14px;
                color: #999;
            }
            
            .orders-list {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .order-item-history {
                border: 1px solid #f0f0f0;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .order-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: #f8f9fa;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .order-info h4 {
                margin-bottom: 5px;
                color: #333;
                font-size: 16px;
            }
            
            .order-info p {
                margin-bottom: 3px;
                color: #666;
                font-size: 14px;
            }
            
            .order-total {
                font-size: 18px;
                color: #333;
            }
            
            .order-items-history {
                padding: 15px 20px;
            }
            
            .history-item {
                display: flex;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .history-item:last-child {
                border-bottom: none;
            }
            
            .item-icon {
                width: 30px;
                height: 30px;
                background: #f8f9fa;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 10px;
                font-size: 12px;
                color: #666;
            }
            
            .item-info {
                flex: 1;
            }
            
            .item-name {
                font-weight: 600;
                margin-bottom: 3px;
                color: #333;
                font-size: 14px;
            }
            
            .item-details {
                color: #666;
                font-size: 12px;
            }
            
            .order-actions {
                padding: 15px 20px;
                border-top: 1px solid #f0f0f0;
                background: #f8f9fa;
            }
            
            .btn-sm {
                padding: 8px 15px;
                font-size: 14px;
            }
            
            .status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .status.pending {
                background: #fff3cd;
                color: #856404;
            }
            
            .status.processing {
                background: #cce5ff;
                color: #004085;
            }
            
            .status.shipped {
                background: #d4edda;
                color: #155724;
            }
            
            .status.delivered {
                background: #d1e7dd;
                color: #0f5132;
            }
            
            .status.cancelled {
                background: #f8d7da;
                color: #721c24;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Modal interactions
        const closeBtn = modal.querySelector('.order-history-close');
        const overlay = modal.querySelector('.order-history-overlay');
        
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) modal.remove();
        });
    }
    
    getStatusText(status) {
        const statusMap = {
            'pending': 'Chờ xử lý',
            'processing': 'Đang xử lý',
            'shipped': 'Đã gửi hàng',
            'delivered': 'Đã giao hàng',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    }
    
    viewOrderDetails(orderId) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            showNotification('Không tìm thấy đơn hàng!', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'order-details-modal';
        modal.innerHTML = `
            <div class="order-details-overlay">
                <div class="order-details-content">
                    <div class="order-details-header">
                        <h3><i class="fas fa-receipt"></i> Chi tiết đơn hàng #${order.id}</h3>
                        <button class="order-details-close">&times;</button>
                    </div>
                    <div class="order-details-body">
                        <div class="order-info-section">
                            <h4>Thông tin đơn hàng</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>Mã đơn hàng:</label>
                                    <span>${order.id}</span>
                                </div>
                                <div class="info-item">
                                    <label>Ngày đặt:</label>
                                    <span>${new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div class="info-item">
                                    <label>Trạng thái:</label>
                                    <span class="status ${order.status}">${this.getStatusText(order.status)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Phương thức thanh toán:</label>
                                    <span>${this.getPaymentMethodText(order.paymentMethod)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="customer-info-section">
                            <h4>Thông tin khách hàng</h4>
                            <div class="info-grid">
                                <div class="info-item">
                                    <label>Họ tên:</label>
                                    <span>${order.customer.firstName} ${order.customer.lastName}</span>
                                </div>
                                <div class="info-item">
                                    <label>Email:</label>
                                    <span>${order.customer.email}</span>
                                </div>
                                <div class="info-item">
                                    <label>Số điện thoại:</label>
                                    <span>${order.customer.phone}</span>
                                </div>
                                <div class="info-item">
                                    <label>Địa chỉ:</label>
                                    <span>${order.customer.address}, ${order.customer.district}, ${order.customer.city}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="order-items-section">
                            <h4>Sản phẩm đã đặt</h4>
                            <div class="order-items-list">
                                ${order.items.map(item => `
                                    <div class="order-item-detail">
                                        <div class="item-icon">
                                            <i class="fas fa-tshirt"></i>
                                        </div>
                                        <div class="item-info">
                                            <div class="item-name">${item.name}</div>
                                            <div class="item-price">${this.formatPrice(item.price)} x ${item.quantity}</div>
                                        </div>
                                        <div class="item-total">
                                            ${this.formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="order-summary-section">
                            <h4>Tổng cộng</h4>
                            <div class="total-amount">
                                <strong>${this.formatPrice(order.total)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .order-details-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
                animation: fadeIn 0.3s ease;
            }
            
            .order-details-overlay {
                background: rgba(0, 0, 0, 0.5);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .order-details-content {
                background: white;
                border-radius: 15px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                animation: slideIn 0.3s ease;
            }
            
            .order-details-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .order-details-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .order-details-body {
                padding: 30px;
            }
            
            .order-info-section,
            .customer-info-section,
            .order-items-section,
            .order-summary-section {
                margin-bottom: 30px;
            }
            
            .order-info-section h4,
            .customer-info-section h4,
            .order-items-section h4,
            .order-summary-section h4 {
                margin-bottom: 15px;
                color: #333;
                font-size: 18px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .info-item label {
                font-weight: 600;
                color: #333;
            }
            
            .info-item span {
                color: #666;
            }
            
            .status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 600;
            }
            
            .status.pending {
                background: #fff3cd;
                color: #856404;
            }
            
            .status.processing {
                background: #cce5ff;
                color: #004085;
            }
            
            .status.shipped {
                background: #d4edda;
                color: #155724;
            }
            
            .status.delivered {
                background: #d1e7dd;
                color: #0f5132;
            }
            
            .status.cancelled {
                background: #f8d7da;
                color: #721c24;
            }
            
            .order-items-list {
                border: 1px solid #f0f0f0;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .order-item-detail {
                display: flex;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .order-item-detail:last-child {
                border-bottom: none;
            }
            
            .item-icon {
                width: 40px;
                height: 40px;
                background: #f8f9fa;
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                font-size: 16px;
                color: #666;
            }
            
            .item-info {
                flex: 1;
            }
            
            .item-name {
                font-weight: 600;
                margin-bottom: 5px;
                color: #333;
            }
            
            .item-price {
                color: #666;
                font-size: 14px;
            }
            
            .item-total {
                font-weight: 600;
                color: #333;
            }
            
            .total-amount {
                text-align: right;
                font-size: 20px;
                color: #333;
            }
            
            @media (max-width: 768px) {
                .info-grid {
                    grid-template-columns: 1fr;
                }
                
                .order-details-content {
                    margin: 10px;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Modal interactions
        const closeBtn = modal.querySelector('.order-details-close');
        const overlay = modal.querySelector('.order-details-overlay');
        
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) modal.remove();
        });
    }
    
    getPaymentMethodText(method) {
        const methodMap = {
            'cod': 'Thanh toán khi nhận hàng (COD)',
            'bank': 'Chuyển khoản ngân hàng',
            'momo': 'Ví MoMo',
            'vnpay': 'VNPay'
        };
        return methodMap[method] || method;
    }
    
    showWishlist() {
        showNotification('Chức năng sản phẩm yêu thích sẽ được phát triển trong tương lai!');
    }
    
    showSettings() {
        showNotification('Chức năng cài đặt sẽ được phát triển trong tương lai!');
    }
    
    showGuestInfo() {
        const modal = document.createElement('div');
        modal.className = 'guest-info-modal';
        modal.innerHTML = `
            <div class="guest-info-overlay">
                <div class="guest-info-content">
                    <div class="guest-info-header">
                        <h3><i class="fas fa-info-circle"></i> Thông tin khách</h3>
                        <button class="guest-info-close">&times;</button>
                    </div>
                    <div class="guest-info-body">
                        <div class="guest-info-text">
                            <p>Bạn đang truy cập với tư cách khách. Để có trải nghiệm tốt hơn, vui lòng:</p>
                            <ul>
                                <li>Đăng ký tài khoản để lưu giỏ hàng</li>
                                <li>Xem lịch sử đơn hàng</li>
                                <li>Nhận thông báo khuyến mãi</li>
                                <li>Lưu sản phẩm yêu thích</li>
                            </ul>
                        </div>
                        <div class="guest-info-actions">
                            <button class="btn btn-primary" onclick="shoppingCart.showRegisterModal()">Đăng ký ngay</button>
                            <button class="btn btn-secondary" onclick="shoppingCart.showLoginModal()">Đăng nhập</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .guest-info-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
                animation: fadeIn 0.3s ease;
            }
            
            .guest-info-overlay {
                background: rgba(0, 0, 0, 0.5);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .guest-info-content {
                background: white;
                border-radius: 15px;
                max-width: 500px;
                width: 100%;
                animation: slideIn 0.3s ease;
            }
            
            .guest-info-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .guest-info-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
            }
            
            .guest-info-body {
                padding: 30px;
            }
            
            .guest-info-text {
                margin-bottom: 30px;
            }
            
            .guest-info-text p {
                margin-bottom: 15px;
                color: #333;
                line-height: 1.6;
            }
            
            .guest-info-text ul {
                list-style: none;
                padding: 0;
            }
            
            .guest-info-text li {
                padding: 8px 0;
                color: #666;
                position: relative;
                padding-left: 20px;
            }
            
            .guest-info-text li::before {
                content: '✓';
                position: absolute;
                left: 0;
                color: #28a745;
                font-weight: bold;
            }
            
            .guest-info-actions {
                display: flex;
                gap: 15px;
            }
            
            .guest-info-actions .btn {
                flex: 1;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Modal interactions
        const closeBtn = modal.querySelector('.guest-info-close');
        const overlay = modal.querySelector('.guest-info-overlay');
        
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) modal.remove();
        });
    }
}

class Chatbot {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.minimizeBtn = document.getElementById('minimizeBtn');
        
        // Generate a unique session ID for this conversation
        this.sessionId = this.generateSessionId();
        
        // API configuration
        this.apiBaseUrl = 'http://localhost:3000/api';
        
        this.init();
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    init() {
        this.bindEvents();
        this.scrollToBottom();
    }
    
    bindEvents() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Enable/disable send button based on input
        this.messageInput.addEventListener('input', () => {
            this.sendBtn.disabled = !this.messageInput.value.trim();
        });
        
        // Header buttons
        this.minimizeBtn.addEventListener('click', () => this.minimizeChat());
        
        // Auto-focus input on load
        this.messageInput.focus();
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        this.sendBtn.disabled = true;
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send message to backend API
            const response = await fetch(`${this.apiBaseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage(data.response, 'bot');
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        const icon = document.createElement('i');
        icon.className = sender === 'bot' ? 'fas fa-robot' : 'fas fa-user';
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const messageText = document.createElement('p');
        messageText.textContent = text;
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.getCurrentTime();
        
        content.appendChild(messageText);
        content.appendChild(time);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    // Method to load conversation history (optional feature)
    async loadConversationHistory() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/conversation/${this.sessionId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.conversation && data.conversation.length > 0) {
                    // Clear current messages
                    this.chatMessages.innerHTML = '';
                    
                    // Load conversation history
                    data.conversation.forEach(msg => {
                        this.addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
                    });
                }
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }
    
    // Method to clear conversation
    async clearConversation() {
        try {
            await fetch(`${this.apiBaseUrl}/conversation/${this.sessionId}`, {
                method: 'DELETE'
            });
            
            // Clear the chat display
            this.chatMessages.innerHTML = '';
            
            // Add welcome message
            this.addMessage("Hello! I'm your AI assistant. How can I help you today?", 'bot');
            
        } catch (error) {
            console.error('Error clearing conversation:', error);
        }
    }
    
    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }
    
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes} ${ampm}`;
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    minimizeChat() {
        const container = document.querySelector('.chatbot-container');
        const toggle = document.getElementById('chatbotToggle');
        
        // Hide chatbot container
        container.classList.remove('active');
        
        // Show toggle button
        toggle.style.display = 'flex';
    }
    

}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Chatbot();
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add click sound effect (optional)
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.addEventListener('click', () => {
        // You can add a subtle animation or sound here
        sendBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            sendBtn.style.transform = 'scale(1)';
        }, 100);
    });
    
    // Add hover effects for messages
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.message')) {
            e.target.closest('.message').style.transform = 'translateX(2px)';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.message')) {
            e.target.closest('.message').style.transform = 'translateX(0)';
        }
    });
});

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Product interactions
document.querySelectorAll('.btn-add-cart').forEach(button => {
    button.addEventListener('click', function() {
        const productName = this.closest('.product-card').querySelector('h3').textContent;
        showNotification(`Đã thêm "${productName}" vào giỏ hàng!`);
        
        // Add animation effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});

document.querySelectorAll('.btn-wishlist').forEach(button => {
    button.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.style.color = '#ff4757';
            showNotification('Đã thêm vào danh sách yêu thích!');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            icon.style.color = '#666';
            showNotification('Đã xóa khỏi danh sách yêu thích!');
        }
    });
});

document.querySelectorAll('.btn-quick-view').forEach(button => {
    button.addEventListener('click', function() {
        const productName = this.closest('.product-card').querySelector('h3').textContent;
        showNotification(`Đang xem chi tiết "${productName}"...`);
    });
});

// Quick view functionality
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.btn-add-cart') && !e.target.closest('.btn-wishlist') && !e.target.closest('.btn-quick-view')) {
            const productName = this.querySelector('h3').textContent;
            const productPrice = this.querySelector('.product-price').textContent;
            showProductModal(productName, productPrice);
        }
    });
});

// Search functionality
const searchIcon = document.querySelector('.nav-icon i.fa-search');
searchIcon.addEventListener('click', () => {
    showSearchModal();
});

// Contact form handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const subject = this.querySelectorAll('input[type="text"]')[1].value;
        const message = this.querySelector('textarea').value;
        
        if (name && email && message) {
            showNotification('Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.');
            this.reset();
        } else {
            showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
        }
    });
}

// Chatbot functionality
const chatbotContainer = document.getElementById('chatbotContainer');
const chatbotToggle = document.getElementById('chatbotToggle');
const minimizeBtn = document.getElementById('minimizeBtn');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');

// Chat session management
let currentSessionId = null;

// Chatbot toggle
chatbotToggle.addEventListener('click', () => {
    chatbotContainer.classList.add('active');
    chatbotToggle.style.display = 'none';
    messageInput.focus();
});

// Minimize chatbot
minimizeBtn.addEventListener('click', () => {
    chatbotContainer.classList.remove('active');
    chatbotToggle.style.display = 'flex';
});



// Send message to backend
async function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        // Add user message to chat
        addMessage(message, 'user');
        messageInput.value = '';
        
        // Disable send button and show typing indicator
        sendBtn.disabled = true;
        showTypingIndicator();
        
        try {
            // Send message to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: currentSessionId
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Store session ID for future messages
            currentSessionId = data.sessionId;
            
            // Add AI response to chat
            addMessage(data.response, 'bot');
            
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Show error message
            addMessage('Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn. Vui lòng thử lại sau.', 'bot');
            
            // Show notification
            showNotification('Có lỗi kết nối với server. Vui lòng thử lại!', 'error');
        } finally {
            // Re-enable send button and hide typing indicator
            sendBtn.disabled = false;
            hideTypingIndicator();
        }
    }
}

// Send button click
sendBtn.addEventListener('click', sendMessage);

// Enter key to send
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `
        <p>${text}</p>
        <span class="message-time">${getCurrentTime()}</span>
    `;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// Get current time
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Load conversation history (if session exists)
async function loadConversationHistory(sessionId) {
    try {
        const response = await fetch(`/api/conversation/${sessionId}`);
        if (response.ok) {
            const data = await response.json();
            currentSessionId = data.sessionId;
            
            // Clear existing messages (except the initial bot message)
            const existingMessages = chatMessages.querySelectorAll('.message');
            if (existingMessages.length > 1) {
                existingMessages.forEach((msg, index) => {
                    if (index > 0) { // Keep the first welcome message
                        msg.remove();
                    }
                });
            }
            
            // Add conversation history
            data.messages.forEach(msg => {
                if (msg.role !== 'system') {
                    addMessage(msg.content, msg.role);
                }
            });
        }
    } catch (error) {
        console.error('Error loading conversation history:', error);
    }
}

// Clear conversation
async function clearConversation() {
    if (currentSessionId) {
        try {
            await fetch(`/api/conversation/${currentSessionId}`, {
                method: 'DELETE'
            });
            currentSessionId = null;
            
            // Clear chat messages except the first welcome message
            const messages = chatMessages.querySelectorAll('.message');
            messages.forEach((msg, index) => {
                if (index > 0) {
                    msg.remove();
                }
            });
            
            showNotification('Cuộc trò chuyện đã được xóa!');
        } catch (error) {
            console.error('Error clearing conversation:', error);
            showNotification('Có lỗi khi xóa cuộc trò chuyện!', 'error');
        }
    }
}

// Check server health
async function checkServerHealth() {
    try {
        const response = await fetch('/api/health');
        if (response.ok) {
            const data = await response.json();
            console.log('Server health:', data);
        }
    } catch (error) {
        console.error('Server health check failed:', error);
    }
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#000' : '#ff4757'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Product modal
function showProductModal(productName, productPrice) {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${productName}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="product-image">
                        <div class="product-placeholder">
                            <i class="fas fa-tshirt"></i>
                        </div>
                    </div>
                    <div class="product-details">
                        <h4>${productName}</h4>
                        <p class="price">${productPrice}</p>
                        <p class="description">Sản phẩm chất lượng cao với thiết kế hiện đại và thoải mái. Phù hợp cho mọi dịp và phong cách.</p>
                        <div class="size-selection">
                            <h5>Chọn kích thước:</h5>
                            <div class="size-options">
                                <button class="size-btn">S</button>
                                <button class="size-btn">M</button>
                                <button class="size-btn">L</button>
                                <button class="size-btn">XL</button>
                            </div>
                        </div>
                        <div class="quantity-selection">
                            <h5>Số lượng:</h5>
                            <div class="quantity-controls">
                                <button class="qty-btn" data-action="decrease">-</button>
                                <span class="qty-display">1</span>
                                <button class="qty-btn" data-action="increase">+</button>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="btn btn-primary add-to-cart-modal">Thêm vào giỏ hàng</button>
                            <button class="btn btn-secondary buy-now">Mua ngay</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .product-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .modal-overlay {
            background: rgba(0, 0, 0, 0.5);
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .modal-content {
            background: white;
            border-radius: 15px;
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        
        .modal-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            padding: 30px;
        }
        
        .product-image {
            display: flex;
            justify-content: center;
        }
        
        .product-details h4 {
            font-size: 1.5rem;
            margin-bottom: 10px;
        }
        
        .price {
            font-size: 1.8rem;
            font-weight: 700;
            color: #000;
            margin-bottom: 20px;
        }
        
        .description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        
        .size-selection, .quantity-selection {
            margin-bottom: 25px;
        }
        
        .size-selection h5, .quantity-selection h5 {
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .size-options {
            display: flex;
            gap: 10px;
        }
        
        .size-btn {
            width: 50px;
            height: 50px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .size-btn:hover, .size-btn.active {
            border-color: #000;
            background: #000;
            color: white;
        }
        
        .quantity-controls {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .qty-btn {
            width: 40px;
            height: 40px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 5px;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.3s ease;
        }
        
        .qty-btn:hover {
            border-color: #000;
            background: #000;
            color: white;
        }
        
        .qty-display {
            font-size: 18px;
            font-weight: 600;
            min-width: 30px;
            text-align: center;
        }
        
        .modal-actions {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @media (max-width: 768px) {
            .modal-body {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .modal-actions {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Modal interactions
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    const sizeBtns = modal.querySelectorAll('.size-btn');
    const qtyBtns = modal.querySelectorAll('.qty-btn');
    const qtyDisplay = modal.querySelector('.qty-display');
    const addToCartBtn = modal.querySelector('.add-to-cart-modal');
    const buyNowBtn = modal.querySelector('.buy-now');
    
    // Close modal
    closeBtn.addEventListener('click', () => removeModal(modal));
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) removeModal(modal);
    });
    
    // Size selection
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Quantity controls
    let quantity = 1;
    qtyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'increase' && quantity < 10) {
                quantity++;
            } else if (action === 'decrease' && quantity > 1) {
                quantity--;
            }
            qtyDisplay.textContent = quantity;
        });
    });
    
    // Add to cart
    addToCartBtn.addEventListener('click', () => {
        const selectedSize = modal.querySelector('.size-btn.active');
        if (!selectedSize) {
            showNotification('Vui lòng chọn kích thước!', 'error');
            return;
        }
        
        // Add to cart
        if (window.shoppingCart) {
            for (let i = 0; i < quantity; i++) {
                window.shoppingCart.addToCart(productName, productPrice);
            }
        }
        
        showNotification(`Đã thêm ${quantity} "${productName}" (${selectedSize.textContent}) vào giỏ hàng!`);
        removeModal(modal);
    });
    
    // Buy now
    buyNowBtn.addEventListener('click', () => {
        const selectedSize = modal.querySelector('.size-btn.active');
        if (!selectedSize) {
            showNotification('Vui lòng chọn kích thước!', 'error');
            return;
        }
        
        // Clear cart first
        if (window.shoppingCart) {
            window.shoppingCart.clearCartItems();
        }
        
        // Add to cart
        if (window.shoppingCart) {
            for (let i = 0; i < quantity; i++) {
                window.shoppingCart.addToCart(productName, productPrice);
            }
        }
        
        showNotification(`Đang chuyển đến trang thanh toán cho ${quantity} "${productName}" (${selectedSize.textContent})...`);
        removeModal(modal);
        
        // Redirect to checkout
        setTimeout(() => {
            window.location.href = 'checkout.html';
        }, 1000);
    });
}

function removeModal(modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
        document.body.removeChild(modal);
    }, 300);
}

// Search modal
function showSearchModal() {
    const modal = document.createElement('div');
    modal.className = 'search-modal';
    modal.innerHTML = `
        <div class="search-overlay">
            <div class="search-content">
                <div class="search-header">
                    <h3>Tìm kiếm sản phẩm</h3>
                    <button class="search-close">&times;</button>
                </div>
                <div class="search-body">
                    <div class="search-input-wrapper">
                        <input type="text" placeholder="Nhập tên sản phẩm..." class="search-input">
                        <button class="search-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div class="search-suggestions">
                        <h4>Gợi ý tìm kiếm:</h4>
                        <div class="suggestion-tags">
                            <span class="tag">Áo thun</span>
                            <span class="tag">Quần jean</span>
                            <span class="tag">Váy đầm</span>
                            <span class="tag">Áo khoác</span>
                            <span class="tag">Giày dép</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add search modal styles
    const style = document.createElement('style');
    style.textContent = `
        .search-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .search-overlay {
            background: rgba(0, 0, 0, 0.5);
            width: 100%;
            height: 100%;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 100px 20px 20px;
        }
        
        .search-content {
            background: white;
            border-radius: 15px;
            max-width: 600px;
            width: 100%;
            animation: slideDown 0.3s ease;
        }
        
        .search-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .search-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }
        
        .search-body {
            padding: 30px;
        }
        
        .search-input-wrapper {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }
        
        .search-input {
            flex: 1;
            padding: 15px;
            border: 2px solid #f0f0f0;
            border-radius: 8px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s ease;
        }
        
        .search-input:focus {
            border-color: #000;
        }
        
        .search-btn {
            background: #000;
            color: white;
            border: none;
            padding: 15px 20px;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .search-btn:hover {
            background: #333;
        }
        
        .search-suggestions h4 {
            margin-bottom: 15px;
            color: #666;
        }
        
        .suggestion-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .tag {
            background: #f8f9fa;
            color: #333;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 1px solid #f0f0f0;
        }
        
        .tag:hover {
            background: #000;
            color: white;
        }
        
        @keyframes slideDown {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Search modal interactions
    const closeBtn = modal.querySelector('.search-close');
    const overlay = modal.querySelector('.search-overlay');
    const searchInput = modal.querySelector('.search-input');
    const searchBtn = modal.querySelector('.search-btn');
    const tags = modal.querySelectorAll('.tag');
    
    // Close modal
    closeBtn.addEventListener('click', () => removeModal(modal));
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) removeModal(modal);
    });
    
    // Search functionality
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            showNotification(`Đang tìm kiếm: "${query}"...`);
            removeModal(modal);
        }
    });
    
    // Enter key to search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // Tag suggestions
    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            searchInput.value = tag.textContent;
            searchBtn.click();
        });
    });
    
    // Focus on input
    setTimeout(() => searchInput.focus(), 100);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.category-card, .product-card, .about-text, .contact-info');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Check server health on page load
    checkServerHealth();
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Initialize Shopping Cart and Chatbot
let shoppingCart;
let chatbot;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Shopping Cart
    shoppingCart = new ShoppingCart();
    
    // Initialize Chatbot
    chatbot = new Chatbot();
});
