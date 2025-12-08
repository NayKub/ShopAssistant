import React, { useState, useEffect } from 'react';

const SalesView = ({ navigateTo }) => { 
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/products');
                const result = await response.json();
                
                if (response.ok) {
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
        fetchProducts();
    }, []);

    const addToCart = (product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product._id === product._id);
            
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

    const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const discount = 0;
    const serviceCharge = 0;
    const tax = subtotal * 0.07;
    const total = subtotal - discount + serviceCharge + tax;

    const categories = ['All', 'Drinks', 'Snacks', 'Clothes', 'Electronics'];

    const filteredProducts = products.filter(product => 
        (selectedCategory === 'All') &&
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-xl">Loading products...</div>;
    if (error) return <div className="p-8 text-center text-xl text-red-600">{error}</div>;

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="w-20 bg-gray-800 text-white flex flex-col items-center py-6 space-y-8">
                <div className="w-6 h-6 rounded-full bg-red-500 mb-8" />
                <div className="hover:bg-gray-700 p-2 rounded-lg cursor-pointer">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                </div>
                <div className="hover:bg-gray-700 p-2 rounded-lg cursor-pointer">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 9a1 1 0 011-1h8a1 1 0 010 2H6a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 010 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                </div>
                <div className="hover:bg-gray-700 p-2 rounded-lg cursor-pointer">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 11a1 1 0 100-2h12a1 1 0 100-2H4a1 1 0 000 2h12a1 1 0 100 2H4z" /></svg>
                </div>
                <div className="hover:bg-gray-700 p-2 rounded-lg cursor-pointer">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.492 15.659a1.5 1.5 0 01-2.984 0L8.136 5.51a1.5 1.5 0 012.728 0l.628 10.149zM10 2a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" /></svg>
                </div>
            </div>

            <div className="flex-grow p-6">
                <div className="mb-6 flex space-x-4">
                    <button 
                        onClick={() => navigateTo('add_product')} 
                        className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-md transition duration-200"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17 9V7h-4V3H7v4H3v2h4v4H3v2h4v4h4v-4h4v-2h-4V9h4z" /></svg>
                        <span>Add Product</span> 
                    </button>
                    
                    <button className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md transition duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.492 15.659a1.5 1.5 0 01-2.984 0L8.136 5.51a1.5 1.5 0 012.728 0l.628 10.149zM10 2a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" /></svg>
                        <span>Edit Product</span>
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

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                            <div className="bg-gray-200 h-32 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">Image</span>
                            </div>
                            
                            <div className="p-3 flex-grow flex flex-col justify-between">
                                <h3 className="font-semibold text-gray-800 line-clamp-2">{product.product_name}</h3>
                                <div className="text-sm text-gray-500 mt-1">In stock: {product.stock}</div>
                                
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-xl font-bold text-green-600">
                                        {product.price.toFixed(2)} ฿
                                    </span>
                                    <button 
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock < 1}
                                        className="bg-green-500 text-white rounded-full p-1.5 hover:bg-green-600 disabled:bg-gray-400"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredProducts.length === 0 && <p className="col-span-full text-center text-gray-500">No products found.</p>}
                </div>
            </div>

            <div className="w-96 bg-white p-6 shadow-xl flex flex-col">
                <h2 className="text-2xl font-bold mb-6">Order</h2>
                
                <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                    {cart.length === 0 ? (
                        <p className="text-gray-500">No items in cart.</p>
                    ) : (
                        cart.map(item => (
                            <div key={item.product._id} className="flex items-center space-x-3 p-2 border-b">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                                <div className="flex-grow">
                                    <p className="font-semibold line-clamp-1">{item.product.product_name}</p>
                                    <p className="text-sm text-gray-500">{item.product.price.toFixed(2)} ฿ x {item.quantity}</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-bold text-lg mr-2">{(item.product.price * item.quantity).toFixed(2)}</span>
                                    <button className="text-gray-400 hover:text-red-500">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-auto pt-6 border-t">
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

                    <button className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg disabled:bg-gray-400" disabled={cart.length === 0}>
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesView;
