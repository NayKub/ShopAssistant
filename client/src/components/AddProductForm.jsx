import React, { useState, useEffect } from 'react';

const ProductAddPage = ({ navigateTo }) => {
    const [productName, setProductName] = useState('');
    const [cost, setCost] = useState('');
    const [profitPercentage, setProfitPercentage] = useState(10);
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null); 
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [suggestedPrice, setSuggestedPrice] = useState(''); 

    const profitOptions = [5, 10, 15, 20];

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
        const calculatedPrice = calculatePrice(cost, profitPercentage);
        if (calculatedPrice) {
            setSuggestedPrice(calculatedPrice);
        } else {
            setSuggestedPrice('');
        }
    }, [cost, profitPercentage]);

    const handleCostChange = (e) => {
        setCost(e.target.value);
    };

    const handleProfitChange = (pct) => {
        setProfitPercentage(pct);
    };
    
    const handlePriceChange = (e) => {
        setPrice(e.target.value);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
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
        
        const formDataToSend = new FormData();
        
        formDataToSend.append('product_name', productName);
        formDataToSend.append('cost', parseFloat(cost));
        formDataToSend.append('price', finalPrice); 
        formDataToSend.append('stock', parseInt(stock));
        
        if (imageFile) {
            formDataToSend.append('image', imageFile); 
        }

        try {
            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                body: formDataToSend, 
            });

            const result = await response.json();

            if (response.ok && result.success) { 
                setMessage('✅ สินค้าถูกเพิ่มสำเร็จ!');
                setProductName('');
                setCost('');
                setProfitPercentage(10);
                setPrice('');
                setStock('');
                setImageFile(null);
                setImagePreviewUrl(null); 
            } else {
                setMessage(`❌ ข้อผิดพลาด: ${result.error || 'Server Error'}`);
            }

        } catch (error) {
            setMessage('❌ Network Error: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        } finally {
            setLoading(false);
        }
    };

    const currentCost = parseFloat(cost) || 0;
    const actualPrice = parseFloat(price) || 0;
    const actualProfitAmount = actualPrice - currentCost;
    const actualProfitRatio = currentCost > 0 ? (actualProfitAmount / currentCost) * 100 : 0;
    const isLoss = actualProfitAmount < 0 && actualPrice > 0;
    
    const FORM_WIDTH_CLASSES = 'w-11/12 sm:w-4/5 lg:w-3/5 max-w-3xl'; 
    const INPUT_STYLE = `w-full bg-[#dddddd] border-none rounded-[18px] 
                       px-[24px] py-[16px] text-[22px] text-[#444] font-normal outline-none 
                       placeholder:text-[#888] box-border`;

    return (
        <div className="flex justify-center items-center min-h-screen pt-10 pb-10 font-varela bg-gray-50">
            <form onSubmit={handleSubmit} className={`${FORM_WIDTH_CLASSES} p-10 bg-white shadow-2xl rounded-xl space-y-7`}>
                
                {/* --- HEADER (จัดชิดซ้าย) --- */}
                <div className="flex justify-start items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Add New Product</h2>
                </div>
                {/* --------------------------- */}
                
                {/* Image Upload Area */}
                <div 
                    className="w-full aspect-[4/3] border-3 border-dashed border-gray-400 rounded-[13px] 
                               flex flex-col items-center justify-center relative overflow-hidden mx-auto" 
                    style={{ maxWidth: '500px' }} 
                >
                    {imagePreviewUrl ? (
                        <img 
                            src={imagePreviewUrl} 
                            alt="Product Preview" 
                            className="object-cover w-full h-full absolute"
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
                        <span className="text-[22px] font-semibold">{imageFile ? `Change: ${imageFile.name}` : 'Click to Add Picture'}</span>
                    </label>
                </div>

                {/* Product Name */}
                <input 
                    type="text" 
                    placeholder="Product Name" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    className={INPUT_STYLE} 
                />

                {/* Cost + Profit Group */}
                <div className="space-y-3">
                    {/* Cost Input (เต็มความกว้าง) */}
                    <input 
                        type="number" 
                        placeholder="Cost (ราคาทุน)"
                        value={cost}
                        onChange={handleCostChange}
                        required
                        min="0"
                        step="0.01"
                        className={INPUT_STYLE} 
                    />
                    
                    {/* Profit Radios */}
                    <div className="flex items-center space-x-6 pl-[8px] pt-1 flex-wrap">
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
                        value={price}
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
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    min="0"
                    className={`${INPUT_STYLE} mb-4`} 
                />
                    
                {/* Action Buttons Group (จัด Cancel ซ้าย, Add Product ขวา) */}
                <div className="flex justify-between items-center pt-4">
                    
                    {/* Cancel Button (อยู่ซ้าย) */}
                    <button
                        type="button" 
                        onClick={() => navigateTo && navigateTo('sales')} 
                        className="text-gray-700 text-[20px] font-medium 
                                   px-10 py-4 border-none rounded-[20px] cursor-pointer 
                                   font-varela transition duration-200 bg-gray-200 hover:bg-gray-300 shadow-md"
                    >
                        Cancel
                    </button>
                    
                    {/* Add Product Button (อยู่ขวา) */}
                    <button 
                        type="submit"
                        disabled={loading || !productName || !cost || !price || !stock}
                        className={`text-white text-[20px] font-medium 
                                   px-10 py-4 border-none rounded-[20px] cursor-pointer 
                                   font-varela transition duration-200 shadow-md
                                   ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#25823a] hover:bg-[#166534]'}`}
                    >
                        {loading ? 'Adding Product...' : 'Add Product'}
                    </button>
                </div>

                {/* Message Area */}
                {message && (
                    <div className={`p-4 rounded-lg text-base w-full mt-4 text-center font-medium ${message.startsWith('✅') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}

export default ProductAddPage;