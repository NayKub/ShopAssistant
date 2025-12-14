import React, { useState, useEffect } from 'react';

// Component สำหรับหน้าแก้ไขสินค้า
const ProductEditPage = ({ navigateTo, productId = 'MOCK_ID_1' }) => {
    
    const [formData, setFormData] = useState({
        product_name: '',
        cost: 0,
        price: '', 
        stock: 0,
        category: 'All', 
    });
    
    const [imageFile, setImageFile] = useState(null); 
    const [existingImageName, setExistingImageName] = useState(''); 
    const [imagePreviewUrl, setImagePreviewUrl] = useState(''); 
    
    const profitOptions = [5, 10, 15, 20]; 
    const [profitPercentage, setProfitPercentage] = useState(10); 
    const [suggestedPrice, setSuggestedPrice] = useState(''); 
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false); 

    const API_URL = 'http://localhost:3000/api/products';
    const BASE_UPLOAD_URL = 'http://localhost:3000/uploads/';
    const DEFAULT_PLACEHOLDER_TEXT = 'Click to Add Picture';

    const FORM_WIDTH_CLASSES = 'w-11/12 sm:w-4/5 lg:w-3/5 max-w-3xl'; 
    const INPUT_STYLE = 'w-full bg-[#dddddd] border-none rounded-[18px] px-[24px] py-[16px] text-[22px] text-[#444] font-normal outline-none placeholder:text-[#888] box-border';

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

    useEffect(() => {
        if (!productId) {
            setError('Error: No product ID provided for editing.');
            setLoading(false);
            return;
        }

        const fetchProductData = async () => {
            try {
                if (productId === 'MOCK_ID_1') {
                     const productData = {
                        product_name: 'Premium Coffee Blend',
                        cost: 150.00,
                        price: 180.00,
                        stock: 50,
                        category: 'Drinks',
                        image: 'coffee_mock.jpg'
                    };
                    
                    let closestProfit = 10;
                    if (productData.cost > 0 && productData.price > 0) {
                        const currentProfitRatio = ((productData.price - productData.cost) / productData.cost) * 100; 
                        closestProfit = profitOptions.reduce((prev, curr) => 
                            Math.abs(curr - currentProfitRatio) < Math.abs(prev - currentProfitRatio) ? curr : prev
                        );
                    }
                    setProfitPercentage(closestProfit);
                    setExistingImageName(productData.image || ''); 
                    
                    setFormData({
                        product_name: productData.product_name || '',
                        cost: productData.cost || 0,
                        price: productData.price ? productData.price.toString() : '',
                        stock: productData.stock || 0,
                        category: productData.category || 'All',
                    });
                    setLoading(false);
                    return;
                }
                
                const response = await fetch(`${API_URL}/${productId}`);
                const result = await response.json();

                if (response.ok && result.success) {
                    const productData = result.data;
                    
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
                    setExistingImageName(productData.image || ''); 
                    
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

    useEffect(() => {
        const calculatedPrice = calculatePrice(formData.cost, profitPercentage);
        setSuggestedPrice(calculatedPrice);
    }, [formData.cost, profitPercentage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = name === 'cost' || name === 'stock' ? (value === '' ? '' : parseFloat(value) || 0) : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };
    
    const handlePriceChange = (e) => {
        setFormData(prev => ({
            ...prev,
            price: e.target.value
        }));
    };

    const handleProfitChange = (pct) => {
        setProfitPercentage(pct);
    };
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file)); 
        } else {
            setImageFile(null);
            setImagePreviewUrl('');
        }
    };

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

        const updateData = new FormData();
        
        updateData.append('product_name', formData.product_name);
        updateData.append('cost', formData.cost);
        updateData.append('price', finalPrice);
        updateData.append('stock', formData.stock);
        updateData.append('category', formData.category);

        if (imageFile) {
            updateData.append('image', imageFile);
        } else {
            updateData.append('existingImageName', existingImageName); 
        }

        try {
            if (productId === 'MOCK_ID_1') {
                setTimeout(() => {
                    setLoading(false);
                    setMessage('✅ Product (Mock ID) updated successfully!');
                    setExistingImageName(imageFile ? imageFile.name : existingImageName); 
                    setImageFile(null); 
                    setImagePreviewUrl(''); 
                    setTimeout(() => navigateTo('sales'), 1500);
                }, 1500);
                return;
            }

            const response = await fetch(`${API_URL}/${productId}`, {
                method: 'PUT',
                body: updateData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setMessage('✅ Product updated successfully!');
                setExistingImageName(result.data.image || existingImageName);
                setImageFile(null); 
                setImagePreviewUrl(''); 
                setTimeout(() => navigateTo('sales'), 1500); 
            } else {
                setMessage(`❌ Update failed: ${result.error}`);
            }

        } catch (err) {
            setMessage('❌ Network Error: Failed to connect or update product.');
        } finally {
            if (productId !== 'MOCK_ID_1') setLoading(false); 
        }
    };
    
    const handleDelete = async () => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${formData.product_name}"?`)) return;

        setIsDeleting(true);
        setMessage('');
        
        try {
            if (productId === 'MOCK_ID_1') {
                setTimeout(() => {
                    setMessage('🗑️ Product (Mock ID) deleted successfully!');
                    setTimeout(() => navigateTo('sales'), 1500);
                }, 1500);
                return;
            }

            const response = await fetch(`${API_URL}/${productId}`, { method: 'DELETE' });
            
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
             if (productId !== 'MOCK_ID_1') setIsDeleting(false);
        }
    };
    
    const currentCost = parseFloat(formData.cost) || 0;
    const actualPrice = parseFloat(formData.price) || 0;
    const actualProfitAmount = actualPrice - currentCost;
    const actualProfitRatio = currentCost > 0 ? (actualProfitAmount / currentCost) * 100 : 0;
    const isLoss = actualProfitAmount < 0 && actualPrice > 0;

    const displayImageUrl = imagePreviewUrl 
        ? imagePreviewUrl 
        : existingImageName 
            ? `${BASE_UPLOAD_URL}${existingImageName}` 
            : null;

    const overlayText = imageFile ? imageFile.name : (existingImageName ? 'Click to Change Picture' : DEFAULT_PLACEHOLDER_TEXT);


    if (loading && !formData.product_name) {
        return (
            <div className="flex justify-center items-center min-h-screen pt-10 pb-10 font-varela bg-gray-50">
                <div className="text-xl text-gray-600">Loading product details...</div>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="flex justify-center items-center min-h-screen pt-10 pb-10 font-varela bg-gray-50">
                <div className="text-xl text-red-600 p-8 bg-white shadow-xl rounded-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen pt-10 pb-10 font-varela bg-gray-50">
            <form onSubmit={handleUpdate} className={`${FORM_WIDTH_CLASSES} p-10 bg-white shadow-2xl rounded-xl space-y-7`}>
                
                {/* --- HEADER (เหลือแค่ชื่อสินค้า) --- */}
                <div className="flex justify-start items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Edit Product: {formData.product_name}</h2>
                </div>
                {/* ---------------------------------- */}
                
                {/* Image Upload Area */}
                <div 
                    className="w-full aspect-[4/3] border-3 border-dashed border-gray-400 rounded-[13px] 
                               flex flex-col items-center justify-center relative overflow-hidden mx-auto" 
                    style={{ maxWidth: '500px' }} 
                >
                    {displayImageUrl ? (
                        <img 
                            src={displayImageUrl} 
                            alt="Product Preview" 
                            className="object-cover w-full h-full absolute"
                            onError={(e) => { e.target.onerror = null; e.target.src=''; }}
                        />
                    ) : (
                        <div className="text-gray-500 flex flex-col items-center">
                            <span className="text-8xl text-gray-400" role="img" aria-label="camera">📷</span>
                            <span className="mt-[7px] text-[22px] font-semibold text-[#222]">Add Product Picture</span>
                        </div>
                    )}
                    
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleImageChange} 
                        id="imageUpload"
                        accept="image/*"
                    />
                    <label htmlFor="imageUpload" className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-white opacity-0 hover:opacity-100 transition duration-300 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[22px] font-semibold">{overlayText}</span>
                    </label>
                </div>

                {/* Product Name */}
                <input 
                    type="text" 
                    placeholder="Product Name" 
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    required
                    className={INPUT_STYLE} 
                />
                
                {/* Category Input Field */}
                <input
                    type="text"
                    name="category"
                    placeholder="Category (e.g., Drinks, Snacks)"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={INPUT_STYLE}
                />

                {/* Cost + Profit Group */}
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                        {/* Cost Input (ความกว้าง 1/3) */}
                        <input 
                            type="number" 
                            placeholder="Cost (ราคาทุน)"
                            name="cost"
                            value={formData.cost}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className={`w-full sm:w-1/3 ${INPUT_STYLE.replace('w-full', '')}`} 
                        />
                        
                        {/* Profit Radios */}
                        <div className="flex items-center space-x-6 pl-[8px] pt-1 flex-wrap sm:flex-1">
                            <span className="font-semibold text-[20px] text-[#444] mb-2 sm:mb-0">Profit Ratio:</span>
                            
                            <div className="flex items-center space-x-[20px]">
                                {profitOptions.map((pct) => (
                                    <label key={pct} className="text-[20px] text-[#444] font-normal flex items-center space-x-[1px] cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="profit" 
                                            value={pct} 
                                            checked={profitPercentage === pct}
                                            onChange={() => handleProfitChange(pct)}
                                            className="accent-[#25823a] w-[20px] h-[20px] mr-[1px]" 
                                        />
                                        <span>{pct}%</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Price Group */}
                <div className="space-y-2">
                    {suggestedPrice && currentCost > 0 && (
                        <p className={`text-base text-gray-700 pl-[18px] pt-2 pb-2 bg-yellow-100 rounded-[10px] border border-yellow-300 w-full font-medium`}>
                            💡 แนะนำ: หากต้องการกำไร {profitPercentage}% ควรตั้งราคา **{suggestedPrice}** บาท
                        </p>
                    )}
                    <input 
                        type="number" 
                        placeholder="Price (ราคาขาย)" 
                        name="price"
                        value={formData.price}
                        onChange={handlePriceChange}
                        required
                        min="0"
                        step="0.01"
                        className={INPUT_STYLE} 
                    />
                    
                    {actualPrice > 0 && currentCost > 0 && (
                        <p className={`text-base ml-1 pl-[18px] pt-1 ${isLoss ? 'text-red-600 font-bold' : 'text-green-700 font-semibold'}`}>
                            กำไรจริง: {actualProfitAmount.toFixed(2)} บาท ({actualProfitRatio.toFixed(2)}%)
                            {isLoss && " (ขาดทุน!)"}
                        </p>
                    )}
                </div>

                {/* Stock Input */}
                <input 
                    type="number" 
                    placeholder="Stock" 
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    className={`${INPUT_STYLE} mb-4`} 
                />
                    
                {/* Action Buttons Group: Delete / Save / Cancel */}
                <div className="flex justify-between items-center pt-4">
                    
                    {/* Delete Button (ซ้าย) */}
                    <button
                        type="button" 
                        onClick={handleDelete}
                        disabled={loading || isDeleting}
                        className="text-white text-[20px] font-medium px-8 py-4 border-none rounded-[20px] cursor-pointer 
                                   font-varela transition duration-200 shadow-md 
                                   bg-red-700 hover:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    
                    <div className="flex space-x-4">
                        {/* Cancel Button */}
                        <button
                            type="button" 
                            onClick={() => navigateTo && navigateTo('sales')} 
                            disabled={loading || isDeleting}
                            className="text-gray-700 text-[20px] font-medium px-10 py-4 border-none rounded-[20px] cursor-pointer 
                                        font-varela transition duration-200 bg-gray-200 hover:bg-gray-300 shadow-md disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        {/* Save Button (ขวา) */}
                        <button 
                            type="submit"
                            disabled={loading || isDeleting || !formData.product_name || !formData.cost || !formData.price || !formData.stock}
                            className={`text-white text-[20px] font-medium 
                                    px-10 py-4 border-none rounded-[20px] cursor-pointer 
                                    font-varela transition duration-200 shadow-md
                                    ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#25823a] hover:bg-[#166534]'}`}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
                
                {/* Message Area */}
                {message && (
                    <div className={`p-4 rounded-lg text-base w-full mt-4 text-center font-medium ${message.startsWith('✅') || message.startsWith('🗑️') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}

export default ProductEditPage;