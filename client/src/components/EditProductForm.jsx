import React, { useState, useEffect } from 'react';

// Component สำหรับหน้าแก้ไขสินค้า
const EditProductForm = ({ navigateTo, productId }) => {
    // State สำหรับเก็บข้อมูลสินค้าปัจจุบัน
    const [formData, setFormData] = useState({
        product_name: '',
        cost: 0,
        price: '', 
        stock: 0,
        category: 'All', 
    });
    
    // State สำหรับรูปภาพ
    const [imageFile, setImageFile] = useState(null); // เก็บไฟล์รูปภาพใหม่ที่ผู้ใช้อัปโหลด
    const [existingImageName, setExistingImageName] = useState(''); // 🚨 อัปเดต: ให้ค่าเริ่มต้นเป็นสตริงว่าง
    const [imagePreviewUrl, setImagePreviewUrl] = useState(''); // URL สำหรับแสดงตัวอย่างรูปภาพ
    
    // State สำหรับ Profit Radio และราคาแนะนำ
    const profitOptions = [5, 10, 15, 20]; // ใช้เป็น %
    const [profitPercentage, setProfitPercentage] = useState(10); 
    const [suggestedPrice, setSuggestedPrice] = useState(''); // ราคาแนะนำ
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const API_URL = 'http://localhost:3000/api/products';
    // 🚀 NEW: Base URL สำหรับรูปภาพ
    const BASE_UPLOAD_URL = 'http://localhost:3000/uploads/';
    const DEFAULT_PLACEHOLDER_TEXT = 'Click to Add Picture';


    // ฟังก์ชันคำนวณราคาขายตาม Profit Ratio
    const calculatePrice = (currentCost, currentProfitPercentage) => {
        const costValue = parseFloat(currentCost);
        const profitPct = parseFloat(currentProfitPercentage);
        
        if (costValue > 0 && profitPct >= 0) {
            const profitAmount = costValue * (profitPct / 100);
            const finalPrice = costValue + profitAmount;
            return finalPrice.toFixed(2);
        }
        return '';
    };

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
                    
                    // Logic คำนวณ closestProfit เหมือนเดิม
                    let closestProfit = 10;
                    if (productData.cost > 0 && productData.price > 0) {
                        const currentProfitRatio = ((productData.price - productData.cost) / productData.cost) * 100;
                        if (currentProfitRatio > 0) {
                            closestProfit = profitOptions.reduce((prev, curr) => 
                                Math.abs(curr - currentProfitRatio) < Math.abs(prev - currentProfitRatio) ? curr : prev
                            );
                        }
                    }
                    setProfitPercentage(closestProfit);

                    // 🚀 UPDATED: โหลดชื่อรูปภาพเดิม
                    setExistingImageName(productData.image || ''); // เก็บชื่อไฟล์
                    
                    setFormData({
                        product_name: productData.product_name || '',
                        cost: productData.cost || 0,
                        price: productData.price ? productData.price.toString() : '',
                        stock: productData.stock || 0,
                        category: productData.category || 'All',
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

    // 2. useEffect สำหรับคำนวณราคาแนะนำเมื่อ Cost หรือ Profit Ratio เปลี่ยน
    useEffect(() => {
        const calculatedPrice = calculatePrice(formData.cost, profitPercentage);
        setSuggestedPrice(calculatedPrice);
    }, [formData.cost, profitPercentage]);

    // 3. Handle input changes (Product Name, Cost, Stock, Category)
    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === 'cost' || name === 'stock' ? parseFloat(value) || 0 : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };
    
    // 4. Handle Price Change (ผู้ใช้กำหนดเอง)
    const handlePriceChange = (e) => {
        setFormData(prev => ({
            ...prev,
            price: e.target.value
        }));
    };

    // 5. Handle profit change (คำนวณเฉพาะราคาแนะนำ)
    const handleProfitChange = (pct) => {
        setProfitPercentage(pct);
    };
    
    // 🚀 NEW: Handle Image File Change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // สร้าง URL สำหรับแสดงตัวอย่าง
            setImagePreviewUrl(URL.createObjectURL(file)); 
        } else {
            setImageFile(null);
            setImagePreviewUrl('');
        }
    };

    // 6. Handle form submission (Update Function)
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const finalPrice = parseFloat(formData.price);
        if (isNaN(finalPrice) || finalPrice <= 0) {
            setMessage('❌ กรุณาใส่ราคาขายที่ถูกต้อง (ต้องมากกว่า 0)');
            setLoading(false);
            return;
        }

        // 🚀 NEW: สร้าง FormData เพื่อรองรับการส่งไฟล์
        const updateData = new FormData();
        
        // 1. เพิ่มข้อมูลสินค้า
        updateData.append('product_name', formData.product_name);
        updateData.append('cost', formData.cost);
        updateData.append('price', finalPrice);
        updateData.append('stock', formData.stock);
        updateData.append('category', formData.category);

        // 2. เพิ่มไฟล์รูปภาพใหม่ (ถ้ามีการอัปโหลดใหม่)
        if (imageFile) {
            // หากมีการอัปโหลดไฟล์ใหม่ ให้ส่งไฟล์ไป
            updateData.append('image', imageFile);
        } else {
            // หากไม่มีการอัปโหลดไฟล์ใหม่ และมีรูปเดิมอยู่ ให้ส่งชื่อไฟล์เดิมไป
            updateData.append('existingImageName', existingImageName); 
        }

        try {
            // 🚨 สำคัญ: เมื่อส่ง FormData ไม่ต้องกำหนด Content-Type: application/json
            const response = await fetch(`${API_URL}/${productId}`, {
                method: 'PUT',
                body: updateData, // ใช้ FormData
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setMessage('✅ Product updated successfully!');
                // 🚀 NEW: อัปเดตชื่อรูปภาพเดิม ถ้า Server ส่งชื่อใหม่กลับมา
                setExistingImageName(result.data.image || existingImageName);
                setImageFile(null); // เคลียร์ไฟล์ที่ถูกอัปโหลด
                setImagePreviewUrl(''); // เคลียร์ Preview
                
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
    
    // 7. Handle Delete
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        setLoading(true);
        setMessage('');
        
        try {
            const response = await fetch(`${API_URL}/${productId}`, {
                method: 'DELETE',
            });
            
            if (response.status === 204 || (response.ok && response.status === 200)) {
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
    
    // คำนวณกำไรปัจจุบันเพื่อแสดงผล
    const currentCost = parseFloat(formData.cost) || 0;
    const actualPrice = parseFloat(formData.price) || 0;
    const actualProfitAmount = actualPrice - currentCost;
    const actualProfitRatio = currentCost > 0 ? (actualProfitAmount / currentCost) * 100 : 0;
    const isLoss = actualProfitAmount < 0 && actualPrice > 0;

    // 🚀 NEW: กำหนด URL ที่จะใช้แสดงผล
    const displayImageUrl = imagePreviewUrl 
        ? imagePreviewUrl // รูปใหม่ที่ผู้ใช้เพิ่งเลือก
        : existingImageName 
            ? `${BASE_UPLOAD_URL}${existingImageName}` // รูปเดิมที่อยู่ใน Server
            : null; // ไม่มีรูปเลย

    // 🚀 NEW: Text ที่จะแสดงใน Overlay
    const overlayText = imageFile ? imageFile.name : (existingImageName ? 'Click to Change Picture' : DEFAULT_PLACEHOLDER_TEXT);
    const currentImageNameDisplay = existingImageName ? existingImageName : 'None';


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
                    {/* Image Upload Area 🚀 UPDATED */}
                    <div className="mb-8">
                        <div className="border-4 border-dashed border-gray-300 rounded-lg h-64 flex flex-col justify-center items-center cursor-pointer hover:border-green-400 transition duration-300 relative overflow-hidden">
                            
                            {/* Display Image Preview or Placeholder */}
                            {displayImageUrl ? (
                                <img 
                                    src={displayImageUrl} 
                                    alt="Product Preview" 
                                    className="object-cover w-full h-full absolute"
                                    // 🚀 NEW: จัดการกรณีที่รูปภาพเดิมโหลดไม่ได้ (ถ้ามี)
                                    onError={(e) => { e.target.onerror = null; e.target.src=''; }}
                                />
                            ) : (
                                // Placeholder เมื่อไม่มีรูปภาพเลย
                                <div className="text-gray-500 flex flex-col items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                    </svg>
                                    <span>{DEFAULT_PLACEHOLDER_TEXT}</span>
                                </div>
                            )}
                            
                            {/* File Input */}
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleImageChange}
                                id="imageUpload"
                                accept="image/*"
                            />
                            
                            {/* Label for File Input (Overlay) */}
                            <label htmlFor="imageUpload" className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-white opacity-0 hover:opacity-100 transition duration-300 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                <span>{overlayText}</span>
                                <span className="text-xs text-gray-300 mt-1">Current: {currentImageNameDisplay}</span>
                            </label>
                        </div>
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
                    
                    {/* Category Input Field */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                        <input
                            type="text"
                            name="category"
                            placeholder="Category (e.g., Drinks, Snacks)"
                            value={formData.category}
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
                            {profitOptions.map(profit => (
                                <label key={profit} className="inline-flex items-center ml-4">
                                    <input
                                        type="radio"
                                        name="profit_radio"
                                        value={profit}
                                        checked={profitPercentage === profit}
                                        onChange={() => handleProfitChange(profit)}
                                        className="form-radio h-4 w-4 text-green-600"
                                    />
                                    <span className="ml-2 text-gray-700">{profit}%</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    {/* Price - User Customizable + Suggestion */}
                    <div className="mb-4 space-y-2">
                         {/* คำแนะนำราคาจะอยู่ด้านบน */}
                        {suggestedPrice && currentCost > 0 && (
                            <p className="text-sm text-gray-600 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                💡 **แนะนำ:** หากต้องการกำไร {profitPercentage}% ควรตั้งราคา **{suggestedPrice}** บาท
                            </p>
                        )}
                        
                        <label className="block text-gray-700 text-sm font-bold mb-2">Price (Selling Price)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handlePriceChange}
                            required
                            min="0"
                            step="0.01"
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                         {/* แสดงกำไรจริงของราคาที่ผู้ใช้กรอก */}
                        {actualPrice > 0 && currentCost > 0 && (
                            <p className={`text-sm ml-1 ${isLoss ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                                **กำไรจริง:** {actualProfitAmount.toFixed(2)} บาท ({actualProfitRatio.toFixed(2)}%)
                                {isLoss && " (ขาดทุน!)"}
                            </p>
                        )}
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
                            className={`bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                        >
                            Delete
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.product_name || !formData.cost || !formData.price || !formData.stock}
                            className={`bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
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