import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../components/sales/Header';
import ProductGrid from '../components/sales/ProductGrid';
import Cart from '../components/sales/Cart';
import CategoryManagementComponent from '../components/sales/CategoryManagementComponent'; 

const Sidebar = ({ activeItem, onNavigate }) => {
  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'settings', icon: '⚙️', label: 'Settings' } 
  ];

  const handleItemClick = (id) => {
    if (id === 'settings') {
        onNavigate('settings');
    } else {
        onNavigate(id);
    }
  };

  return (
    <div className="fixed left-0 top-0 w-[80px] h-screen bg-gray-100 flex flex-col items-center pt-5 pb-5 space-y-5 shadow-lg z-20">
      {menuItems.map(item => (
        <div 
          key={item.id}
          className={`w-[50px] h-[50px] rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 
            ${activeItem === item.id ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-200'}`
          }
          onClick={() => handleItemClick(item.id)}
          title={item.label}
        >
          <span className="text-2xl">{item.icon}</span>
        </div>
      ))}
    </div>
  );
}

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
            setError('Error: User not logged in. Cannot fetch products.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                
                setProducts(result.data.map(p => ({
                    ...p,
                    price: parseFloat(p.price) 
                })));
            } else if (response.status === 401) {
                setError('Authentication failed. Please log in again.');
            } else {
                setError('Failed to fetch products: ' + (result.error || result.message)); 
            }
        } catch (err) {
            setError('Network error or server is down.');
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
        const totalRemainingStock = (product.stock || 0) - (product.sold_count || 0);
        return Math.max(0, totalRemainingStock); 
    }, []);

    const addToCart = useCallback((product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product._id === product._id);
            const totalAvailableStock = getAvailableStock(product);
            const quantityInCart = existingItem ? existingItem.quantity : 0;
            
            if (quantityInCart + 1 > totalAvailableStock) {
                console.warn(`Cannot add more: ${product.product_name} is out of stock (Max: ${totalAvailableStock}).`);
                setCheckoutMessage(`⚠ ${product.product_name}: Only ${totalAvailableStock} items remaining`);
                setTimeout(() => setCheckoutMessage(null), 2000);
                return prevCart;
            }

            if (existingItem) {
                return prevCart.map(item => 
                    item.product._id === product._id 
                        ? { ...item, quantity: item.quantity + 1, isTyping: false }
                        : item
                );
            } else {
                return [...prevCart, { product, quantity: 1, isTyping: false }];
            }
        });
    }, [getAvailableStock]);

    const updateQuantity = useCallback((productId, change, isTyping = false) => {
        setCart(prevCart => {
            return prevCart.flatMap(item => {
                if (item.product._id === productId) {
                    const totalAvailableStock = getAvailableStock(item.product);
                    let newQuantity = item.quantity + change;
                    
                    if (isTyping) {
                        if (newQuantity < 0) newQuantity = 0; 
                        
                        if (newQuantity > totalAvailableStock) {
                            newQuantity = totalAvailableStock;
                            setCheckoutMessage(`⚠ ${item.product.product_name}: Maximum stock is ${totalAvailableStock} items`);
                            setTimeout(() => setCheckoutMessage(null), 2000);
                        }
                        return [{ ...item, quantity: newQuantity, isTyping: true }];
                    }

                    if (change === 0) {
                        return [{ ...item, quantity: item.quantity, isTyping: false }];
                    }

                    if (newQuantity <= 0) {
                        return [];
                    }
                    
                    if (newQuantity > totalAvailableStock) {
                        setCheckoutMessage(`⚠ ${item.product.product_name}: Only ${totalAvailableStock} items remaining`);
                        setTimeout(() => setCheckoutMessage(null), 2000);
                        newQuantity = totalAvailableStock; 
                    }
                    
                    return [{ ...item, quantity: newQuantity, isTyping: false }];
                }
                return [item];
            });
        });
    }, [getAvailableStock]);
    
    const refillStock = useCallback(async (productId, amount) => {
        const token = getToken();
        if (!token) {
            setCheckoutMessage('❌ Error: Unauthorized (Token missing)');
            setTimeout(() => setCheckoutMessage(null), 3000);
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:3000/api/products/restock/${productId}`,
                {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ amount })
                }
            );

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Restock failed');
            }

            setProducts(prev =>
                prev.map(p =>
                    p._id === productId ? result.data : p
                )
            );

            setCheckoutMessage(`✅ ${result.message}`);
            setTimeout(() => setCheckoutMessage(null), 2000);

        } catch (err) {
            setCheckoutMessage(`❌ ${err.message}`);
            setTimeout(() => setCheckoutMessage(null), 3000);
        }
    }, []);

    const removeAllOfProduct = useCallback(async (productId) => {
        const token = getToken();
        if (!token) {
            setCheckoutMessage('❌ Error: Unauthorized (Token missing)');
            setTimeout(() => setCheckoutMessage(null), 3000);
            return;
        }

        try {
            const res = await fetch(
                `http://localhost:3000/api/products/permanent/${productId}`,
                { 
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok && res.status !== 204) {
                const result = await res.json();
                throw new Error(result.error || 'Product deletion failed');
            }

            setProducts(prev => prev.filter(p => p._id !== productId));
            setCart(prev => prev.filter(item => item.product._id !== productId));

            setCheckoutMessage('🗑️ Product permanently deleted');
            setTimeout(() => setCheckoutMessage(null), 2000);

        } catch (err) {
            setCheckoutMessage(`❌ ${err.message}`);
            setTimeout(() => setCheckoutMessage(null), 3000);
        }
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        setCheckoutMessage('Cart cleared');
        setTimeout(() => setCheckoutMessage(null), 2000);
    }, []);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        setCheckoutMessage(null);

        const token = getToken();
        if (!token) {
            setCheckoutMessage('❌ Error: Unauthorized (Token missing)');
            setLoading(false);
            setTimeout(() => setCheckoutMessage(null), 3000);
            return;
        }

        const { total } = (() => {
            const sub = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
            const tx = sub * 0.07;
            const tot = sub + tx;
            return { subtotal: sub, tax: tx, serviceCharge: 0, discount: 0, total: tot };
        })();
        
        const orderData = cart.map(item => ({
            productId: item.product._id,
            quantity: item.quantity,
        }));

        try {
            const response = await fetch('http://localhost:3000/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ items: orderData, totalAmount: total.toFixed(2) }),
            });

            if (response.ok) {
                setCheckoutMessage(`✅ Sale successful! (Total: ${total.toFixed(2)} THB)`);
                setCart([]);
                await fetchProducts();
            } else {
                const errorResult = await response.json();
                setCheckoutMessage(`❌ Sale failed: ${errorResult.message || 'Server error occurred'}`);
            }

        } catch (error) {
            setCheckoutMessage('❌ Network Error: Could not connect to the server to process checkout');
        } finally {
            setLoading(false);
            setTimeout(() => setCheckoutMessage(null), 5000);
        }
    };
    
    const handleSidebarNavigation = useCallback((id) => {
        if (id === 'settings') {
            navigateTo('settings');
        } else {
            setActiveItem(id);
        }
    }, [navigateTo]);

    const { subtotal, tax, total } = useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const tx = sub * 0.07;
        const tot = sub + tx;
        return { subtotal: sub, tax: tx, serviceCharge: 0, discount: 0, total: tot };
    }, [cart]);

    const filteredProducts = useMemo(() => {
        let result = products;

        if (selectedCategory !== 'All') {
            
            result = result.filter(p => (p.category?.name || p.category) === selectedCategory);
        }

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            result = result.filter(p => 
                p.product_name.toLowerCase().includes(lowerCaseSearch) ||
                (p.category?.name || p.category).toLowerCase().includes(lowerCaseSearch) ||
                p._id.includes(lowerCaseSearch)
            );
        }

        return result;
    }, [products, selectedCategory, searchTerm]);
    
    return (
        <div className="flex">
            <Sidebar 
                activeItem={activeItem} 
                onNavigate={handleSidebarNavigation} 
            />

            <div className="flex-1 min-h-screen bg-white ml-[80px] p-10 pr-[300px]">
                {error && (
                    <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        <strong>API Error:</strong> {error}
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

                <ProductGrid 
                    products={filteredProducts}
                    onAddToCart={addToCart}
                    isLoading={loading}
                    viewMode={viewMode}
                    getAvailableStock={getAvailableStock}
                    cartItems={cart}
                    onRemoveAll={removeAllOfProduct}
                    onRefillStock={refillStock} 
                    navigateTo={navigateTo}
                />
            </div>

            <Cart 
                cartItems={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={(productId) => updateQuantity(productId, -cart.find(i => i.product._id === productId).quantity)}
                onCheckout={handleCheckout}
                subtotal={subtotal}
                tax={tax}
                serviceCharge={0}
                discount={0}
                total={total}
                isLoading={loading}
                checkoutMessage={checkoutMessage}
                clearCart={clearCart}
                getAvailableStock={getAvailableStock}
            />
            
            
            {showCategoryManager && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <CategoryManagementComponent 
                        onClose={handleCloseCategoryManager}
                    />
                </div>
            )}
        </div>
    );
}

export default SalesPage;