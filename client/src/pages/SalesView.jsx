import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/sales/Header';
import ProductGrid from '../components/sales/ProductGrid';
import Cart from '../components/sales/Cart';
import Sidebar from '../components/sales/Sidebar';
import CategoryManagementComponent from '../components/sales/CategoryManagementComponent'; 
import SettingsPage from '../components/sales/SettingsPage';

const SalesPage = ({ navigateTo }) => {
    const { isDarkMode } = useTheme(); // ✅ ดึงมาใช้คุม Theme หลัก
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [checkoutMessage, setCheckoutMessage] = useState(null); 
    const [activeItem, setActiveItem] = useState('home');
    const [viewMode, setViewMode] = useState('grid');
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    
    const allCategories = useMemo(() => {
        const productCategories = products.map(p => p.category?.name || p.category).filter(Boolean);
        return ['All', ...new Set(productCategories)];
    }, [products]);

    const getToken = () => localStorage.getItem('userToken');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = getToken();
        if (!token) {
            setError('Error: User not logged in.');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/api/products', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setProducts(result.data.map(p => ({ ...p, price: parseFloat(p.price) })));
            } else {
                setError('Failed to fetch products');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCloseCategoryManager = useCallback(() => {
        setShowCategoryManager(false);
        fetchProducts(); 
    }, [fetchProducts]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const getAvailableStock = useCallback((product) => {
        return Math.max(0, (product.stock || 0) - (product.sold_count || 0));
    }, []);

    const addToCart = useCallback((product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product._id === product._id);
            const totalAvailableStock = getAvailableStock(product);
            const quantityInCart = existingItem ? existingItem.quantity : 0;
            if (quantityInCart + 1 > totalAvailableStock) {
                setCheckoutMessage(`⚠ ${product.product_name}: Stock limit reached`);
                setTimeout(() => setCheckoutMessage(null), 2000);
                return prevCart;
            }
            if (existingItem) {
                return prevCart.map(item => item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
            } else {
                return [...prevCart, { product, quantity: 1 }];
            }
        });
    }, [getAvailableStock]);

    const handleRemoveFromCart = useCallback((productId) => {
        setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
    }, []);

    const handleClearCart = useCallback(() => {
        setCart([]);
    }, []);

    const updateQuantity = useCallback((productId, change) => {
        setCart(prevCart => prevCart.flatMap(item => {
            if (item.product._id === productId) {
                const totalAvailableStock = getAvailableStock(item.product);
                let newQuantity = item.quantity + change;
                if (newQuantity <= 0) return [];
                if (newQuantity > totalAvailableStock) newQuantity = totalAvailableStock;
                return [{ ...item, quantity: newQuantity }];
            }
            return [item];
        }));
    }, [getAvailableStock]);
    
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product permanently?')) return;
        
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/products/permanent/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (response.ok) {
                await fetchProducts(); 
            }
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setLoading(false); 
        }
    };

    const handleRefillStock = async (productId, amount) => {
        try {
            const response = await fetch(`http://localhost:3000/api/products/restock/${productId}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}` 
                },
                body: JSON.stringify({ amount })
            });
            if (response.ok) {
                await fetchProducts(); 
            }
        } catch (err) {
            console.error('Refill error:', err);
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setLoading(true);
        setCheckoutMessage(null);
        const token = getToken();

        try {
            const response = await fetch('http://localhost:3000/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        productId: item.product._id,
                        quantity: item.quantity
                    }))
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setCheckoutMessage('✅ Checkout successful!');
                setCart([]); 
                await fetchProducts(); 
            } else {
                setCheckoutMessage(`❌ Checkout failed: ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            setCheckoutMessage('❌ Network error during checkout');
        } finally {
            setLoading(false);
            setTimeout(() => setCheckoutMessage(null), 3000);
        }
    };

    const handleSidebarNavigation = useCallback((id) => {
        if (id === 'settings') {
            setShowSettings(true); 
        } else {
            setActiveItem(id);
            setShowSettings(false);
        }
    }, []);

    const { subtotal, tax, total } = useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const tx = sub * 0.07;
        return { subtotal: sub, tax: tx, total: sub + tx };
    }, [cart]);

    const filteredProducts = useMemo(() => {
        let result = products;
        if (selectedCategory !== 'All') result = result.filter(p => (p.category?.name || p.category) === selectedCategory);
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(p => p.product_name.toLowerCase().includes(lower) || p._id.includes(lower));
        }
        return result;
    }, [products, selectedCategory, searchTerm]);

    return (
        <div className={`flex min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'}`}>
            <Sidebar 
                activeItem={activeItem} 
                onNavigate={handleSidebarNavigation} 
            />

            <div className={`flex-1 ml-[80px] p-10 pr-[300px] transition-colors duration-300 ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-800'}`}>
                {error && (
                    <div className="p-4 mb-6 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800/50">
                        {error}
                    </div>
                )}
                
                <Header 
                    searchQuery={searchTerm}
                    onSearchChange={setSearchTerm}
                    categories={allCategories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    onAddProduct={() => navigateTo('add_product')}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    onManageCategories={() => setShowCategoryManager(true)}
                />

                <div className="mt-8">
                    <ProductGrid 
                        products={filteredProducts}
                        onAddToCart={addToCart}
                        isLoading={loading}
                        viewMode={viewMode}
                        getAvailableStock={getAvailableStock}
                        cartItems={cart}
                        onRemoveAll={handleDeleteProduct} 
                        onRefillStock={handleRefillStock}
                        navigateTo={navigateTo}
                    />
                </div>
            </div>

            <Cart 
                cartItems={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={handleRemoveFromCart}
                onCheckout={handleCheckout}
                subtotal={subtotal}
                tax={tax}
                total={total}
                isLoading={loading}
                checkoutMessage={checkoutMessage}
                clearCart={handleClearCart}
                getAvailableStock={getAvailableStock}
                serviceCharge={0}
                discount={0}
            />

            {showCategoryManager && (
                <CategoryManagementComponent onClose={handleCloseCategoryManager} />
            )}

            {showSettings && (
                <SettingsPage 
                    navigateTo={navigateTo} 
                    onClose={() => setShowSettings(false)} 
                />
            )}
        </div>
    );
}

export default SalesPage;