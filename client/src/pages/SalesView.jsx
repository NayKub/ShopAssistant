import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../components/sales/Header';
import ProductGrid from '../components/sales/ProductGrid';
import Cart from '../components/sales/Cart';
import Sidebar from '../components/sales/Sidebar'; // import มาใช้ตรงนี้ครับ
import CategoryManagementComponent from '../components/sales/CategoryManagementComponent'; 

const SalesPage = ({ navigateTo }) => {
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

    // ... (fetchProducts และ logic อื่นๆ เหมือนเดิม) ...
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

    const handleCheckout = async () => {
        // ... (logic checkout เหมือนเดิม) ...
    };

    const handleSidebarNavigation = useCallback((id) => {
        if (id === 'settings') {
            setShowSettings(true); // เปิด Pop-up แทนการเปลี่ยนหน้า
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
        <div className="flex">
            {/* เรียกใช้ Sidebar ที่แยกออกมาแล้ว */}
            <Sidebar 
                activeItem={activeItem} 
                onNavigate={handleSidebarNavigation} 
            />

            <div className="flex-1 min-h-screen bg-white ml-[80px] p-10 pr-[300px]">
                {error && <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
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

                <ProductGrid 
                    products={filteredProducts}
                    onAddToCart={addToCart}
                    isLoading={loading}
                    viewMode={viewMode}
                    getAvailableStock={getAvailableStock}
                    cartItems={cart}
                    navigateTo={navigateTo}
                />
            </div>

            <Cart 
                cartItems={cart}
                onUpdateQuantity={updateQuantity}
                onCheckout={handleCheckout}
                subtotal={subtotal}
                tax={tax}
                total={total}
                isLoading={loading}
                checkoutMessage={checkoutMessage}
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