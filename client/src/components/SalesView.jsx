import React, { useState, useEffect } from 'react';

const SalesView = ({ navigateTo }) => { 
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [checkoutMessage, setCheckoutMessage] = useState(null); 

    const placeholderImage = "https://via.placeholder.com/150?text=No+Image";

    // 1. ฟังก์ชันดึงข้อมูลสินค้า (Fetch Products)
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3000/api/products');
            const result = await response.json();
            
            if (response.ok) {
                // 💡 สมมติว่าข้อมูลที่ได้มี field: stock และ sold_count
                setProducts(result.data);
            } else {
                setError('Failed to fetch products: ' + result.error); 
            }
        } catch (err) {
            setError('Network error or server is down.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // 🚀 FIXED LOGIC 1: Stock คงเหลือที่พร้อมขาย (แสดงใน UI) = Stock ใน DB - Sold Count ใน DB
    const getAvailableStock = (product) => {
        // Stock ที่เหลือจริง (จาก DB) = (Stock ตั้งต้น) - (Sold Count)
        const totalRemainingStock = (product.stock || 0) - (product.sold_count || 0);
        
        return Math.max(0, totalRemainingStock); 
    };

    // 🚩 FIXED LOGIC 2: Logic การเพิ่มสินค้าลงตะกร้า (addToCart)
    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product._id === product._id);
            
            const totalAvailableStock = getAvailableStock(product);

            const quantityInCart = existingItem ? existingItem.quantity : 0;
            
            if (quantityInCart + 1 > totalAvailableStock) {
                 console.warn(`Cannot add more: ${product.product_name} is out of stock (Max: ${totalAvailableStock}).`);
                 return prevCart; // ไม่เพิ่มสินค้า
            }

            if (existingItem) {
                return prevCart.map(item => 
                    item.product._id === product._id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, { product, quantity: 1 }];
            }
        });
    };
    
    // 🆕 NEW FUNCTION 1: ลดจำนวนสินค้าลงทีละ 1
    const decreaseQuantity = (productId) => {
        setCart(prevCart => {
            return prevCart.flatMap(item => {
                if (item.product._id === productId) {
                    // ถ้าเหลือมากกว่า 1 ชิ้น ให้ลดจำนวน
                    if (item.quantity > 1) {
                        return [{ ...item, quantity: item.quantity - 1 }];
                    } 
                    // ถ้าเหลือ 1 ชิ้น ให้ลบรายการออกไปเลย
                    return []; // ลบรายการนี้ออก
                }
                return [item];
            });
        });
    };

    // 🆕 NEW FUNCTION 2: ลบสินค้าออกทั้งหมดจากตะกร้า (เฉพาะรายการสินค้านั้น)
    const removeAllOfProduct = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
    };

    // 🆕 NEW FUNCTION 3: ลบสินค้าทั้งหมดในตะกร้า (Clear Cart)
    const clearCart = () => {
        setCart([]);
        setCheckoutMessage('ตะกร้าสินค้าถูกล้างแล้ว');
    };


    // 🚀 FIXED LOGIC 3: ฟังก์ชันจัดการ Checkout (อัปเดต sold_count และดึงข้อมูลใหม่)
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        setCheckoutMessage(null);

        const orderData = cart.map(item => ({
            productId: item.product._id,
            quantity: item.quantity,
        }));

        try {
            // API นี้ต้องถูกแก้ไขใน server.js ให้เพิ่มเฉพาะ sold_count เท่านั้น
            const response = await fetch('http://localhost:3000/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: orderData, totalAmount: total.toFixed(2) }),
            });

            if (response.ok) {
                const result = await response.json();
                setCheckoutMessage(`✅ การขายสำเร็จ! (ยอดรวม: ${total.toFixed(2)} ฿)`);
                setCart([]); // ล้างตะกร้า
                // 🚀 สำคัญ: ดึงข้อมูลสินค้าใหม่ เพื่อให้ sold_count ถูกอัปเดต และ UI แสดง Stock ที่ลดลงแล้ว
                await fetchProducts(); 
            } else {
                const errorResult = await response.json();
                setCheckoutMessage(`❌ การขายไม่สำเร็จ: ${errorResult.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์'}`);
            }

        } catch (error) {
            setCheckoutMessage('❌ Network Error: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อทำรายการได้');
        } finally {
            setLoading(false);
        }
    };
    // -------------------------------------------------------------
    
    // ใช้ parseFloat() เพื่อให้แน่ใจว่าทำงานกับตัวเลข
    const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.product.price) * item.quantity), 0);
    const discount = 0;
    const serviceCharge = 0;
    const tax = subtotal * 0.07;
    const total = subtotal - discount + serviceCharge + tax;

    const categories = ['All', 'Drinks', 'Snacks', 'Clothes', 'Electronics'];

    const filteredProducts = products.filter(product => 
        (selectedCategory === 'All' || product.category === selectedCategory) &&
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (loading && cart.length === 0 && !checkoutMessage) return <div className="p-8 text-center text-xl">Loading products...</div>;
    if (error) return <div className="p-8 text-center text-xl text-red-600">{error}</div>;

    const handleAddClick = (e, product) => {
        e.stopPropagation();
        addToCart(product);
    };


    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* -------------------- 1. Left Sidebar (ไม่เปลี่ยนแปลง) -------------------- */}
            <div className="w-20 bg-gray-800 text-white flex flex-col items-center py-6 space-y-8">
                {/* ... (Sidebar icons) ... */}
            </div>

            {/* -------------------- 2. Main Content Area -------------------- */}
            <div className="flex-grow p-6">
                {/* ... (Add Product button, Search, Categories) ... */}
                <div className="mb-6 flex space-x-4">
                    <button 
                        onClick={() => navigateTo('add_product')} 
                        className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition duration-200"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17 9V7h-4V3H7v4H3v2h4v4H3v2h4v4h4v-4h4v-2h-4V9h4z" /></svg>
                        <span>Add Product</span> 
                    </button>
                </div>

                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500"
                    />
                </div>

                <div className="mb-8 flex space-x-3 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap 
                                ${selectedCategory === cat ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-200 border'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* -------------------- Product Grid -------------------- */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredProducts.map(product => {
                        const availableStock = getAvailableStock(product);
                        // หาจำนวนสินค้าที่อยู่ในตะกร้าแล้ว (เพื่อป้องกันการคลิกเพิ่มเกิน totalAvailableStock)
                        const itemInCart = cart.find(item => item.product._id === product._id);
                        const quantityInCart = itemInCart ? itemInCart.quantity : 0;
                        const canAddToCart = (availableStock - quantityInCart) > 0;

                        return (
                        <div 
                            key={product._id} 
                            onClick={() => navigateTo('edit_product', product._id)}
                            className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-xl transition duration-150"
                        >
                            <div className="bg-gray-200 h-32 flex items-center justify-center overflow-hidden">
                                <img 
                                    src={product.image 
                                        ? `http://localhost:3000/uploads/${product.image}` 
                                        : placeholderImage}
                                    alt={product.product_name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }}
                                />
                            </div>
                            
                            <div className="p-3 flex-grow flex flex-col justify-between">
                                <h3 className="font-semibold text-gray-800 line-clamp-2">{product.product_name}</h3>
                                {/* 🚩 Stock ที่แสดง: จะไม่เปลี่ยนจนกว่าจะกด Continue */}
                                <div className={`text-sm mt-1 ${availableStock > 0 ? 'text-gray-500' : 'text-red-500 font-bold'}`}>
                                    In stock: {availableStock}
                                </div>
                                
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-xl font-bold text-green-600">
                                        {parseFloat(product.price).toFixed(2)} ฿
                                    </span>
                                    <button 
                                        onClick={(e) => handleAddClick(e, product)}
                                        // 🚩 ปิดปุ่มเมื่อสินค้าที่อยู่ในตะกร้าถึงขีดจำกัด Stock ที่เหลือจริง
                                        disabled={!canAddToCart} 
                                        className="bg-green-500 text-white rounded-full p-1.5 hover:bg-green-600 disabled:bg-gray-400"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );})}
                    {filteredProducts.length === 0 && <p className="col-span-full text-center text-gray-500">No products found.</p>}
                </div>
            </div>

            {/* -------------------- 3. Right Sidebar (Order Summary/Cart) -------------------- */}
            <div className="w-96 bg-white p-6 shadow-xl flex flex-col">
                <h2 className="text-2xl font-bold mb-6">Order</h2>
                
                <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                    {/* ... (Cart items display) ... */}
                    {cart.length === 0 ? (
                        <p className="text-gray-500">No items in cart.</p>
                    ) : (
                        cart.map(item => {
                            const availableStock = getAvailableStock(item.product);
                            return (
                                <div key={item.product._id} className="flex items-center space-x-3 p-2 border-b">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                        <img 
                                            src={item.product.image 
                                                ? `http://localhost:3000/uploads/${item.product.image}` 
                                                : placeholderImage}
                                            alt={item.product.product_name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold line-clamp-1">{item.product.product_name}</p>
                                        <p className="text-sm text-gray-500">{parseFloat(item.product.price).toFixed(2)} ฿</p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1">
                                        {/* 🚩 ปุ่มจัดการจำนวน: เพิ่ม (-) และ (+) */}
                                        <div className="flex items-center border rounded-md">
                                            {/* ปุ่มลดจำนวนทีละ 1 */}
                                            <button 
                                                onClick={() => decreaseQuantity(item.product._id)} 
                                                className="w-6 h-6 text-gray-700 hover:bg-gray-200"
                                            >
                                                -
                                            </button>
                                            <span className="px-2 font-bold text-sm">{item.quantity}</span>
                                            {/* ปุ่มเพิ่มจำนวนทีละ 1 (ใช้ addToCart เดิม) */}
                                            <button 
                                                onClick={() => addToCart(item.product)} 
                                                disabled={item.quantity >= availableStock} 
                                                className="w-6 h-6 text-gray-700 hover:bg-gray-200 disabled:text-gray-400"
                                            >
                                                +
                                            </button>
                                        </div>
                                        
                                        {/* 🚩 ปุ่มลบรายการทั้งหมด (ถังขยะ) */}
                                        <div className="flex justify-end w-full">
                                            <span className="font-bold text-sm mr-2">{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                                            <button 
                                                onClick={() => removeAllOfProduct(item.product._id)} 
                                                className="text-gray-400 hover:text-red-500 ml-1"
                                                title="ลบสินค้าทั้งหมดในรายการนี้"
                                            >
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {checkoutMessage && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${checkoutMessage.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {checkoutMessage}
                    </div>
                )}


                <div className="mt-auto pt-6 border-t">
                    {/* 🚩 NEW: ปุ่มล้างตะกร้าทั้งหมด */}
                    {cart.length > 0 && (
                        <button 
                            onClick={clearCart} 
                            className="w-full mb-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 hover:border-red-700 font-semibold transition duration-150"
                        >
                            <span className="flex items-center justify-center">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                Clear Cart
                            </span>
                        </button>
                    )}
                    
                    <div className="space-y-2 text-gray-700">
                        <div className="flex justify-between"><span>Subtotal</span><span>{subtotal.toFixed(2)} ฿</span></div>
                        <div className="flex justify-between"><span>Discount</span><span>{discount.toFixed(2)} ฿</span></div>
                        <div className="flex justify-between"><span>Service Charge</span><span>{serviceCharge.toFixed(2)} ฿</span></div>
                        <div className="flex justify-between"><span>Tax (7%)</span><span>{tax.toFixed(2)} ฿</span></div>
                    </div>
                    <div className="flex justify-between mt-3 pt-3 border-t-2 text-xl font-bold">
                        <span>Total</span>
                        <span className="text-green-600">{total.toFixed(2)} ฿</span>
                    </div>

                    <button 
                        onClick={handleCheckout} 
                        className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:bg-gray-400" 
                        disabled={cart.length === 0 || loading}
                    >
                        {loading ? 'Processing...' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesView;