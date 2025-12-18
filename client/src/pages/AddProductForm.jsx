import React, { useState, useEffect, useCallback } from 'react';

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
    
    
    const [categories, setCategories] = useState([]); 
    const [selectedCategory, setSelectedCategory] = useState(''); 
    const [categoryLoading, setCategoryLoading] = useState(true);
    
    

    const profitOptions = [5, 10, 15, 20];
    const CATEGORY_API_URL = 'http://localhost:3000/api/categories';
    const PRODUCT_API_URL = 'http://localhost:3000/api/products';


    const getToken = () => localStorage.getItem('userToken');

    
    const fetchCategories = useCallback(async () => {
        setCategoryLoading(true);
        const token = getToken();
        if (!token) {
            setMessage('❌ Error: Token not found. Please log in first.');
            setCategoryLoading(false);
            return;
        }

        try {
            const response = await fetch(CATEGORY_API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            
            if (response.ok && result.success) {
                setCategories(result.data);
                if (result.data.length > 0) {
                    
                    if (!selectedCategory) {
                        setSelectedCategory(result.data[0]._id);
                    }
                } else {
                    setSelectedCategory('');
                }
            } else {
                setMessage(`❌ Failed to fetch categories: ${result.error || result.message}`);
            }
        } catch (err) {
            setMessage('❌ Network Error: Could not retrieve Category list.');
        } finally {
            setCategoryLoading(false);
        }
    }, [selectedCategory]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);


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
        
        if (price === '' || price === calculatedPrice) {
            setPrice(calculatedPrice);
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
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl); 
        }
        if (file) {
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file)); 
        } else {
            setImageFile(null);
            setImagePreviewUrl(null);
        }
    };

    useEffect(() => {
        
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        
        const token = getToken(); 
        
        if (!token) {
            setMessage('❌ Error: Token not found. Please log in first.');
            setLoading(false);
            return;
        }
        
        if (!selectedCategory) {
            setMessage('❌ Please select a product Category.');
            setLoading(false);
            return;
        }

        const finalPrice = parseFloat(price);
        const finalCost = parseFloat(cost);
        const finalStock = parseInt(stock);

        if (isNaN(finalPrice) || finalPrice <= 0 || isNaN(finalCost) || finalCost < 0 || isNaN(finalStock) || finalStock < 0) {
             setMessage('❌ Please check Price or Stock data (must be valid numbers).');
            setLoading(false);
            return;
        }

        
        const formDataToSend = new FormData();
        
        formDataToSend.append('product_name', productName);
        formDataToSend.append('cost', finalCost);
        formDataToSend.append('price', finalPrice); 
        formDataToSend.append('stock', finalStock);
        
        formDataToSend.append('category', selectedCategory); 

        if (imageFile) {
            formDataToSend.append('image', imageFile); 
        }

        try {
            const response = await fetch(PRODUCT_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
                body: formDataToSend, 
            });

            const result = await response.json();

            if (response.ok && result.success) { 
                const categoryName = categories.find(c => c._id === result.data.category)?.name || 'N/A';
                setMessage('✅ Product added successfully! (Category: ' + categoryName + ')');
                
                
                setProductName('');
                setCost('');
                setProfitPercentage(10);
                setPrice('');
                setStock('');
                setImageFile(null);
                setImagePreviewUrl(null); 
                
                setTimeout(() => setMessage(''), 3000);

            } else if (response.status === 401) {
                 setMessage(`❌ Error: Unauthorized (Token expired/invalid)`);
            } else {
                setMessage(`❌ Error: ${result.error || result.message || 'Server Error'}`);
            }

        } catch (error) {
            setMessage('❌ Network Error: Could not connect to the server.');
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
    
    const SELECT_STYLE = `${INPUT_STYLE} appearance-none cursor-pointer`; 
    const BUTTON_PRIMARY = 'text-white text-[20px] font-medium px-10 py-4 border-none rounded-[20px] cursor-pointer font-varela transition duration-200 shadow-md';
    const BUTTON_SECONDARY = 'text-gray-700 text-[20px] font-medium px-10 py-4 border-none rounded-[20px] cursor-pointer font-varela transition duration-200 bg-gray-200 hover:bg-gray-300 shadow-md';


    return (
        <div className="flex justify-center items-center min-h-screen pt-10 pb-10 font-varela bg-gray-50">
            <form onSubmit={handleSubmit} className={`${FORM_WIDTH_CLASSES} p-10 bg-white shadow-2xl rounded-xl space-y-7`}>
                
                
                <div className="flex justify-start items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Add New Product</h2>
                </div>
                
                
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

                
                <input 
                    type="text" 
                    placeholder="Product Name" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                    className={INPUT_STYLE} 
                />
                
                
                <div className="space-y-3">
                    <div className="relative">
                        {categoryLoading ? (
                            <select className={SELECT_STYLE} disabled>
                                <option>Loading Categories...</option>
                            </select>
                        ) : categories.length === 0 ? (
                            <select className={`${SELECT_STYLE} bg-red-100 text-red-700`} disabled>
                                <option value="">❌ No Categories Found</option>
                            </select>
                        ) : (
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                required
                                className={SELECT_STYLE}
                            >
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                            <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>


                
                <div className="space-y-3">
                    
                    <input 
                        type="number" 
                        placeholder="Cost Price"
                        value={cost}
                        onChange={handleCostChange}
                        required
                        min="0"
                        step="0.01"
                        className={INPUT_STYLE} 
                    />
                    
                    
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
                
                
                <div className="space-y-2">
                    {suggestedPrice && currentCost > 0 && (
                        <p className={`text-base text-gray-700 pl-[18px] pt-2 pb-2 bg-yellow-100 rounded-[10px] border border-yellow-300 w-full font-medium`}>
                            💡 Suggestion: For {profitPercentage}% profit, set the price at **{suggestedPrice}** Baht
                        </p>
                    )}
                    <input 
                        type="number" 
                        placeholder="Selling Price" 
                        value={price}
                        onChange={handlePriceChange}
                        required
                        min="0"
                        step="0.01"
                        className={INPUT_STYLE} 
                    />
                    
                    {actualPrice > 0 && currentCost > 0 && (
                        <p className={`text-base ml-1 pl-[18px] pt-1 ${isLoss ? 'text-red-600 font-bold' : 'text-green-700 font-semibold'}`}>
                            Actual Profit: {actualProfitAmount.toFixed(2)} Baht ({actualProfitRatio.toFixed(2)}%)
                            {isLoss && " (Loss!)"}
                        </p>
                    )}
                </div>

                
                <input 
                    type="number" 
                    placeholder="Stock" 
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    min="0"
                    className={`${INPUT_STYLE} mb-4`} 
                />
                    
                
                <div className="flex justify-between items-center pt-4">
                    
                    
                    <button
                        type="button" 
                        onClick={() => navigateTo && navigateTo('sales')} 
                        className={BUTTON_SECONDARY}
                    >
                        Cancel
                    </button>
                    
                    
                    <button 
                        type="submit"
                        
                        disabled={loading || categoryLoading || !selectedCategory || !productName || !cost || !price || !stock} 
                        className={`${BUTTON_PRIMARY} ${
                            (loading || categoryLoading || !selectedCategory || !productName || !cost || !price || !stock) 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-[#25823a] hover:bg-[#166534]'}`
                        }
                    >
                        {loading ? 'Adding Product...' : 'Add Product'}
                    </button>
                </div>

                
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