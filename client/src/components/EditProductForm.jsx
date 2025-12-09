import React, { useState, useEffect } from 'react';

// Component สำหรับหน้าแก้ไขสินค้า
const EditProductForm = ({ navigateTo, productId }) => {
    // State สำหรับเก็บข้อมูลสินค้าปัจจุบัน
    const [formData, setFormData] = useState({
        product_name: '',
        cost: 0,
        price: 0,
        stock: 0,
        // เพิ่ม category field ถ้ามี
    });
    const [selectedProfit, setSelectedProfit] = useState(0.05); // 5% เป็นค่าเริ่มต้น
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const API_URL = 'http://localhost:3000/api/products';

    // 1. ดึงข้อมูลสินค้าเดิมเมื่อ Component ถูกโหลด
    useEffect(() => {
        if (!productId) {
            setError('Error: No product ID provided for editing.');
            setLoading(false);
            return;
        }

        const fetchProductData = async () => {
            try {
                const response = await fetch(`${API_URL}/${productId}`);
                const result = await response.json();

                if (response.ok && result.success) {
                    const productData = result.data;
                    
                    // คำนวณ % profit ที่ใกล้เคียงที่สุดจาก price และ cost เพื่อ set radio button
                    if (productData.cost && productData.price) {
                        const currentProfit = (productData.price - productData.cost) / productData.cost;
                        let closestProfit = 0.05;
                        const profitOptions = [0.05, 0.10, 0.15, 0.20];
                        
                        // หาค่า profit ที่ใกล้เคียงที่สุดในตัวเลือก
                        if (currentProfit > 0) {
                            closestProfit = profitOptions.reduce((prev, curr) => 
                                Math.abs(curr - currentProfit) < Math.abs(prev - currentProfit) ? curr : prev
                            );
                        }
                        setSelectedProfit(closestProfit);
                    }

                    setFormData({
                        product_name: productData.product_name || '',
                        cost: productData.cost || 0,
                        price: productData.price || 0,
                        stock: productData.stock || 0,
                        // ... เพิ่ม field อื่น ๆ
                    });
                } else {
                    setError('Failed to load product data: ' + (result.error || 'Unknown error'));
                }
            } catch (err) {
                setError('Network Error: Cannot connect to server to fetch product data.');
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [productId]);

    // 2. Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'cost' || name === 'stock' ? parseFloat(value) || 0 : value
        }));
    };

    // 3. Handle profit change (recalculates price)
    const handleProfitChange = (profitPercentage) => {
        const profit = parseFloat(profitPercentage);
        setSelectedProfit(profit);
        
        // คำนวณราคาขายใหม่: Price = Cost * (1 + Profit %)
        setFormData(prev => ({
            ...prev,
            price: prev.cost * (1 + profit)
        }));
    };

    // 4. Handle form submission (Update Function)
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${API_URL}/${productId}`, {
                method: 'PUT', // ใช้ PUT สำหรับการ Update
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setMessage('✅ Product updated successfully!');
                // อาจจะนำทางกลับไปหน้า SalesView หลังจากบันทึก 1-2 วินาที
                setTimeout(() => navigateTo('sales'), 1500); 
            } else {
                setMessage(`❌ Update failed: ${result.error}`);
            }

        } catch (err) {
            setMessage('❌ Network Error: Failed to connect or update product.');
        } finally {
            setLoading(false);
        }
    };
    
    // 5. Handle Delete (ถ้าคุณต้องการเพิ่มฟังก์ชันลบด้วย)
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        setLoading(true);
        setMessage('');
        
        try {
            const response = await fetch(`${API_URL}/${productId}`, {
                method: 'DELETE', // ต้องเพิ่ม DELETE API ใน server.js ด้วย!
            });
            
            if (response.ok) {
                setMessage('🗑️ Product deleted successfully!');
                setTimeout(() => navigateTo('sales'), 1500);
            } else {
                const result = await response.json();
                setMessage(`❌ Deletion failed: ${result.error || 'Server error'}`);
            }
        } catch (err) {
            setMessage('❌ Network Error: Failed to delete product.');
        } finally {
            setLoading(false);
        }
    };


    if (loading && !formData.product_name) return <div className="p-8 text-center text-xl">Loading product details...</div>;
    if (error) return <div className="p-8 text-center text-xl text-red-600">{error}</div>;

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-200">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit Product: {formData.product_name}</h1>
                <button 
                    onClick={() => navigateTo('sales')} 
                    className="mb-6 px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150"
                >
                    &larr; Back to Sales
                </button>

                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm ${message.startsWith('✅') || message.startsWith('🗑️') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleUpdate}>
                    {/* Placeholder for Image */}
                    <div className="border-2 border-dashed border-gray-300 h-48 flex items-center justify-center mb-6 rounded-lg">
                        <span className="text-gray-500">Add Product Picture</span>
                    </div>

                    {/* Product Name */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                        <input
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleChange}
                            required
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    
                    {/* Cost and Profit */}
                    <div className="flex items-center mb-4 space-x-4">
                        <div className="flex-1">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Cost</label>
                            <input
                                type="number"
                                name="cost"
                                value={formData.cost}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        
                        <div className="flex-none pt-7">
                            <label className="text-gray-700 text-sm font-bold mr-2">Profit :</label>
                            {[0.05, 0.10, 0.15, 0.20].map(profit => (
                                <label key={profit} className="inline-flex items-center ml-4">
                                    <input
                                        type="radio"
                                        name="profit"
                                        value={profit}
                                        checked={selectedProfit === profit}
                                        onChange={() => handleProfitChange(profit)}
                                        className="form-radio h-4 w-4 text-green-600"
                                    />
                                    <span className="ml-2 text-gray-700">{profit * 100}%</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    {/* Price */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Price (Selling Price)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price.toFixed(2)} // แสดงทศนิยม 2 ตำแหน่ง
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            readOnly // แนะนำให้อ่านอย่างเดียวเมื่อใช้การคำนวณกำไรอัตโนมัติ
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    
                    {/* Stock */}
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            min="0"
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>

                    {/* Buttons: Delete and Save */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className={`bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200 ${loading ? 'opacity-50' : 'hover:bg-red-700'}`}
                        >
                            Delete
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200 ${loading ? 'opacity-50' : 'hover:bg-green-700'}`}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductForm;