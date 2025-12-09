import React, { useState, useEffect } from 'react';

const AddProductForm = ({ navigateTo }) => {
    const [productName, setProductName] = useState('');
    const [cost, setCost] = useState(0);
    const [profitPercentage, setProfitPercentage] = useState(10);
    const [price, setPrice] = useState(''); // เปลี่ยนเป็น string ว่างเพื่อให้ placeholder ทำงาน
    const [stock, setStock] = useState(0);
    // 🚀 NEW: State สำหรับ URL Preview
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null); 
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // State สำหรับเก็บราคาแนะนำ
    const [suggestedPrice, setSuggestedPrice] = useState(''); 

    const profitOptions = [5, 10, 15, 20];

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

    // 1. useEffect สำหรับคำนวณราคาแนะนำเมื่อ Cost หรือ Profit Ratio เปลี่ยน
    useEffect(() => {
        const calculatedPrice = calculatePrice(cost, profitPercentage);
        if (calculatedPrice) {
            setSuggestedPrice(calculatedPrice);
        } else {
            setSuggestedPrice('');
        }
    }, [cost, profitPercentage]);

    // 2. Handle Cost Change
    const handleCostChange = (e) => {
        const newCost = e.target.value;
        setCost(newCost);
    };

    // 3. Handle Profit Radio Change (แค่คำนวณราคาแนะนำ)
    const handleProfitChange = (pct) => {
        setProfitPercentage(pct);
    };
    
    // 4. Handle Price Change (ผู้ใช้กำหนดเอง)
    const handlePriceChange = (e) => {
        setPrice(e.target.value);
    };

    // 🚀 FIXED: Handle Image File Change (เพิ่ม Logic แสดง Preview)
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // สร้าง URL สำหรับแสดงตัวอย่าง
            setImagePreviewUrl(URL.createObjectURL(file)); 
        } else {
            setImageFile(null);
            setImagePreviewUrl(null);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const finalPrice = parseFloat(price);
        if (isNaN(finalPrice) || finalPrice <= 0) {
            setMessage('❌ กรุณาใส่ราคาขายที่ถูกต้อง (ต้องมากกว่า 0)');
            setLoading(false);
            return;
        }
        
        // 🚀 CRITICAL FIX: ใช้ FormData สำหรับการส่งไฟล์
        const formDataToSend = new FormData();
        
        // 1. เพิ่มข้อมูลสินค้า (ไม่รวมรูปภาพ)
        formDataToSend.append('product_name', productName);
        formDataToSend.append('cost', parseFloat(cost));
        formDataToSend.append('price', finalPrice); 
        formDataToSend.append('stock', parseInt(stock));
        
        // 2. เพิ่มไฟล์รูปภาพ (ถ้ามี)
        if (imageFile) {
            formDataToSend.append('image', imageFile); // 'image' คือ field name ที่ server ใช้รับไฟล์
        }

        try {
            // 🚨 สำคัญ: ห้ามกำหนด Content-Type: application/json เมื่อใช้ FormData
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                // headers ถูกกำหนดอัตโนมัติเป็น multipart/form-data
                body: formDataToSend, // ส่ง FormData
            });

            const result = await response.json();

            if (response.ok && result.success) { // ตรวจสอบ success จาก server response
                setMessage('✅ สินค้าถูกเพิ่มสำเร็จ!');
                // Reset fields
                setProductName('');
                setCost(0);
                setProfitPercentage(10);
                setPrice('');
                setStock(0);
                setImageFile(null);
                setImagePreviewUrl(null); // เคลียร์ Preview
            } else {
                setMessage(`❌ ข้อผิดพลาด: ${result.error || 'Server Error'}`);
            }

        } catch (error) {
            setMessage('❌ Network Error: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        } finally {
            setLoading(false);
        }
    };

    // Calculate current actual profit ratio for display/validation (optional)
    const currentCost = parseFloat(cost) || 0;
    const actualPrice = parseFloat(price) || 0;
    const actualProfitAmount = actualPrice - currentCost;
    const actualProfitRatio = currentCost > 0 ? (actualProfitAmount / currentCost) * 100 : 0;
    const isLoss = actualProfitAmount < 0 && actualPrice > 0;
    
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-8">
            <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white shadow-2xl rounded-lg p-10">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Add New Product</h2>
                <div className="mb-8">
                    {/* Image Upload Area */}
                    <div className="border-4 border-dashed border-gray-300 rounded-lg h-64 flex flex-col justify-center items-center cursor-pointer hover:border-green-400 transition duration-300 relative overflow-hidden">
                        
                        {/* 🚀 UPDATED: แสดง Image Preview หรือ Placeholder */}
                        {imagePreviewUrl ? (
                            <img 
                                src={imagePreviewUrl} 
                                alt="Product Preview" 
                                className="object-cover w-full h-full absolute"
                            />
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                <span>Add Product Picture</span>
                            </div>
                        )}
                        
                        {/* 🚀 UPDATED: File Input & Label Overlay */}
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleImageChange} // ใช้ handleImageChange ที่ถูกเพิ่มเข้ามา
                            id="imageUpload"
                            accept="image/*"
                        />
                         <label htmlFor="imageUpload" className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-white opacity-0 hover:opacity-100 transition duration-300 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span>{imageFile ? `Change: ${imageFile.name}` : 'Click to Add Picture'}</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Product Name */}
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                    />

                    {/* Cost and Profit Radios */}
                    <div className="flex items-center space-x-4">
                        <input
                            type="number"
                            placeholder="Cost (ราคาทุน)"
                            value={cost === 0 ? '' : cost}
                            onChange={handleCostChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-1/3 p-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                        />

                        <div className="flex items-center space-x-3 text-gray-700 w-2/3">
                            <span className="font-medium mr-2">Profit :</span>
                            {profitOptions.map((pct) => (
                                <label key={pct} className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="profit"
                                        value={pct}
                                        checked={profitPercentage === pct}
                                        onChange={() => handleProfitChange(pct)}
                                        className="form-radio h-4 w-4 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="ml-1 text-sm">{pct}%</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    
                    {/* Price Input Area */}
                    <div className="space-y-2">
                        {/* คำแนะนำราคาจะอยู่ด้านบน */}
                        {suggestedPrice && currentCost > 0 && (
                            <p className="text-sm text-gray-600 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                                💡 **แนะนำ:** หากต้องการกำไร {profitPercentage}% ควรตั้งราคา **{suggestedPrice}** บาท
                            </p>
                        )}

                        <input
                            type="number"
                            placeholder="Price (ราคาขาย)"
                            value={price}
                            onChange={handlePriceChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                        />
                        
                        {/* แสดงกำไรจริงของราคาที่ผู้ใช้กรอก (Optional Feedback) */}
                        {actualPrice > 0 && currentCost > 0 && (
                            <p className={`text-sm ml-1 ${isLoss ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                                **กำไรจริง:** {actualProfitAmount.toFixed(2)} บาท ({actualProfitRatio.toFixed(2)}%)
                                {isLoss && " (ขาดทุน!)"}
                            </p>
                        )}
                    </div>
                    
                    {/* Stock */}
                    <input
                        type="number"
                        placeholder="Stock"
                        value={stock === 0 ? '' : stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                        min="0"
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                    />

                    {/* Message Area */}
                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="pt-4 flex justify-between items-center">
                        <button
                            type="button" 
                            onClick={() => navigateTo('sales')} 
                            className="px-6 py-3 rounded-lg text-gray-700 font-bold bg-gray-200 hover:bg-gray-300 transition duration-200"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || !productName || !cost || !price || !stock}
                            className={`px-6 py-3 rounded-lg text-white font-bold transition duration-200 
                                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-md'}`}
                        >
                            {loading ? 'Adding Product...' : 'Add Product'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddProductForm;