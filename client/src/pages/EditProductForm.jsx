import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://localhost:3000/api/products';
const CATEGORY_URL = 'http://localhost:3000/api/categories';
const DELETE_API_URL = 'http://localhost:3000/api/products/permanent';
const BASE_UPLOAD_URL = 'http://localhost:3000/uploads/';

const profitOptions = [5, 10, 15, 20]; 
const getToken = () => localStorage.getItem('userToken');

const DEFAULT_PLACEHOLDER_TEXT = 'Click to Add Picture';
const FORM_WIDTH_CLASSES = 'w-11/12 sm:w-4/5 lg:w-3/5 max-w-3xl'; 

const ProductEditPage = ({ navigateTo, productId }) => {
    const { isDarkMode } = useTheme();
    
    const [formData, setFormData] = useState({
        product_name: '',
        cost: '',
        price: '',
        stock: '',
        category: '',
        sold_count: 0
    });

    const [categories, setCategories] = useState([]);
    const [profitPercentage, setProfitPercentage] = useState(10);
    const [imageFile, setImageFile] = useState(null);
    const [existingImageName, setExistingImageName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(''); 
    
    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    const fetchCategories = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        try {
            const res = await fetch(CATEGORY_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setCategories(result.data || []);
            }
        } catch { /* Error handle */ }
    }, []);

    const fetchProductData = useCallback(async () => {
        if (!productId) {
            setError('No product ID');
            setLoading(false);
            return;
        }
        const token = getToken();
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (res.ok && result.success) {
                const p = result.data;
                const costValue = parseFloat(p.cost);
                let closestProfit = profitOptions[0] || 0; 
                if (costValue > 0 && p.price > 0) {
                    const ratio = ((p.price - costValue) / costValue) * 100;
                    closestProfit = profitOptions.reduce((a, b) =>
                        Math.abs(b - ratio) < Math.abs(a - ratio) ? b : a
                    );
                }
                setProfitPercentage(closestProfit);
                setExistingImageName(p.image || '');
                setFormData({
                    product_name: p.product_name || '',
                    cost: costValue?.toString() || '',
                    price: p.price?.toString() || '',
                    stock: p.stock?.toString() || '',
                    category: p.category?._id || '', 
                    sold_count: p.sold_count || 0
                });
            } else {
                setError(result.error || 'Load failed');
            }
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchCategories();
        fetchProductData();
    }, [fetchCategories, fetchProductData]);

    const suggestedPrice = (() => {
        if (!formData.cost || isNaN(parseFloat(formData.cost))) return '';
        const cost = parseFloat(formData.cost);
        const price = cost + (cost * profitPercentage) / 100;
        return price.toFixed(2);
    })();

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
    };
    
    const handleCostChange = e => {
        const { value } = e.target;
        setFormData(f => ({ ...f, cost: value }));
    };
    
    const handlePriceChange = e => {
        setFormData(f => ({ ...f, price: e.target.value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        if (file) {
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file)); 
        } else {
            setImageFile(null);
            setImagePreviewUrl('');
        }
    };
    
    const handleProfitChange = (pct) => {
        setProfitPercentage(pct);
        if (formData.cost && !isNaN(parseFloat(formData.cost))) {
             const cost = parseFloat(formData.cost);
             const price = cost + (cost * pct) / 100;
             setFormData(f => ({ ...f, price: price.toFixed(2) }));
        }
    };

    const handleUpdate = async e => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const token = getToken();
        if (!token) {
            setMessage('Not authenticated');
            setLoading(false);
            return;
        }
        const data = new FormData();
        data.append('product_name', formData.product_name);
        data.append('cost', formData.cost);
        data.append('price', formData.price); 
        data.append('stock', formData.stock);
        data.append('category', formData.category);
        data.append('sold_count', formData.sold_count); 
        if (imageFile) data.append('image', imageFile);

        try {
            const res = await fetch(`${API_URL}/${productId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: data
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setMessage('✅ Updated successfully');
                setTimeout(() => navigateTo('sales'), 1500);
            } else {
                setMessage(`❌ Update failed: ${result.error || result.message}`);
            }
        } catch {
            setMessage('❌ Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete product "${formData.product_name}"?`)) return;
        setIsDeleting(true);
        const token = getToken();
        try {
            const res = await fetch(`${DELETE_API_URL}/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok || res.status === 204) {
                setMessage('🗑️ Deleted');
                setTimeout(() => navigateTo('sales'), 1500);
            } else {
                const result = await res.json();
                setMessage(`❌ Deletion failed: ${result.error || result.message}`);
            }
        } catch {
            setMessage('❌ Network error');
        } finally {
            setIsDeleting(false);
        }
    };

    const currentCost = parseFloat(formData.cost) || 0;
    const actualPrice = parseFloat(formData.price) || 0;
    const actualProfitAmount = actualPrice - currentCost;
    const actualProfitRatio = currentCost > 0 ? (actualProfitAmount / currentCost) * 100 : 0;
    const isLoss = actualProfitAmount < 0 && actualPrice > 0;
    
    const displayImageUrl = imagePreviewUrl ? imagePreviewUrl : (existingImageName ? `${BASE_UPLOAD_URL}${existingImageName}` : null);
    const overlayText = imageFile ? imageFile.name : (existingImageName ? 'Click to Change Picture' : DEFAULT_PLACEHOLDER_TEXT);
    const isFormValid = formData.product_name && formData.cost !== '' && formData.price !== '' && formData.stock !== '' && formData.category;

    // Styles
    const INPUT_STYLE = `w-full border-none rounded-[18px] px-[24px] py-[16px] text-[22px] font-normal outline-none box-border transition-colors duration-200 ${
        isDarkMode 
        ? 'bg-gray-800 text-white placeholder:text-gray-500 focus:bg-gray-700' 
        : 'bg-[#dddddd] text-[#444] placeholder:text-[#888] focus:bg-white focus:shadow-sm'
    }`;
    const SELECT_STYLE = `${INPUT_STYLE} appearance-none cursor-pointer`;

    if (loading && !formData.product_name) { 
        return (
            <div className={`flex justify-center items-center min-h-screen pt-10 pb-10 transition-colors duration-300 ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'}`}>
                <div className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading product details...</div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className={`flex justify-center items-center min-h-screen pt-10 pb-10 transition-colors duration-300 ${isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'}`}>
                <div className={`text-xl p-8 shadow-xl rounded-xl ${isDarkMode ? 'bg-[#1a1a1a] text-red-400 border border-red-900/30' : 'bg-white text-red-600'}`}>{error}</div>
            </div>
        );
    }

    return (
        <div className={`flex justify-center items-center min-h-screen pt-10 pb-10 transition-colors duration-300 ${
            isDarkMode ? 'bg-[#121212]' : 'bg-gray-50'
        }`}>
            <form onSubmit={handleUpdate} className={`${FORM_WIDTH_CLASSES} p-10 shadow-2xl rounded-xl space-y-7 transition-colors duration-300 ${
                isDarkMode ? 'bg-[#1a1a1a] border border-gray-800' : 'bg-white'
            }`}>
                
                <div className="flex justify-start items-center mb-6">
                    <h2 className={`text-3xl font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Edit Product: {formData.product_name}</h2>
                </div>
                
                <div 
                    className={`w-full aspect-[4/3] border-3 border-dashed rounded-[13px] flex flex-col items-center justify-center relative overflow-hidden mx-auto transition-colors ${
                        isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-400 bg-transparent'
                    }`} 
                    style={{ maxWidth: '500px' }} 
                >
                    {displayImageUrl ? (
                        <img src={displayImageUrl} alt="Product Preview" className="object-cover w-full h-full absolute" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <span className="text-8xl opacity-40" role="img" aria-label="camera">📷</span>
                            <span className={`mt-[7px] text-[22px] font-semibold transition-colors ${isDarkMode ? 'text-gray-400' : 'text-[#222]'}`}>Add Product Picture</span>
                        </div>
                    )}
                    
                    <input type="file" className="hidden" onChange={handleImageChange} id="imageUpload" accept="image/*" />
                    <label htmlFor="imageUpload" className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 text-white opacity-0 hover:opacity-100 transition duration-300 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[22px] font-semibold">{overlayText}</span>
                    </label>
                </div>

                <input 
                    type="text" 
                    placeholder="Product Name" 
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleChange}
                    required
                    className={INPUT_STYLE} 
                />
                
                <div className="space-y-3">
                    <div className="relative">
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className={SELECT_STYLE}
                            disabled={loading}
                        >
                            <option value="">--- Select Category ---</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-700'}`}>
                            <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <input 
                        type="number" 
                        placeholder="Cost Price"
                        name="cost"
                        value={formData.cost}
                        onChange={handleCostChange} 
                        required
                        min="0"
                        step="0.01"
                        className={INPUT_STYLE} 
                    />
                    
                    <div className="flex items-center space-x-6 pl-[8px] pt-1"> 
                        <span className={`font-semibold text-[20px] transition-colors ${isDarkMode ? 'text-gray-300' : 'text-[#444]'}`}>Profit Ratio:</span>
                        <div className="flex items-center space-x-[20px] overflow-x-auto whitespace-nowrap">
                            {profitOptions.map((pct) => (
                                <label key={pct} className={`text-[20px] font-normal flex items-center space-x-[1px] cursor-pointer transition-colors ${isDarkMode ? 'text-gray-400' : 'text-[#444]'}`}>
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
                        <p className={`text-base pl-[18px] pt-2 pb-2 rounded-[10px] border w-full font-medium transition-colors ${
                            isDarkMode 
                            ? 'bg-yellow-900/20 border-yellow-800 text-yellow-500' 
                            : 'bg-yellow-100 border-yellow-300 text-gray-700'
                        }`}>
                            💡 Suggestion: For {profitPercentage}% profit, set the price at **{suggestedPrice}** Baht
                        </p>
                    )}
                    <input 
                        type="number" 
                        placeholder="Selling Price" 
                        name="price"
                        value={formData.price}
                        onChange={handlePriceChange} 
                        required
                        min="0"
                        step="0.01"
                        className={INPUT_STYLE} 
                    />
                    
                    {actualPrice > 0 && currentCost > 0 && (
                        <p className={`text-base ml-1 pl-[18px] pt-1 ${isLoss ? 'text-red-500 font-bold' : (isDarkMode ? 'text-green-400 font-semibold' : 'text-green-700 font-semibold')}`}>
                            Actual Profit: {actualProfitAmount.toFixed(2)} Baht ({actualProfitRatio.toFixed(2)}%)
                            {isLoss && " (Loss!)"}
                        </p>
                    )}
                </div>

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
                    
                <div className="flex justify-between items-center pt-4">
                    <button
                        type="button" 
                        onClick={handleDelete}
                        disabled={loading || isDeleting}
                        className="text-white text-[20px] font-medium px-8 py-4 border-none rounded-[20px] cursor-pointer transition duration-200 shadow-md bg-red-700 hover:bg-red-800 disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    
                    <div className="flex space-x-4">
                        <button
                            type="button" 
                            onClick={() => navigateTo && navigateTo('sales')} 
                            disabled={loading || isDeleting}
                            className={`text-[20px] font-medium px-10 py-4 border-none rounded-[20px] cursor-pointer transition duration-200 shadow-md disabled:opacity-50 ${
                                isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={!isFormValid || loading || isDeleting}
                            className={`text-white text-[20px] font-medium px-10 py-4 border-none rounded-[20px] cursor-pointer transition duration-200 shadow-md ${
                                (!isFormValid || loading || isDeleting) 
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-[#25823a] hover:bg-[#166534]'
                            }`}
                        >
                            {loading && !isDeleting ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
                
                {message && (
                    <div className={`p-4 rounded-lg text-base w-full mt-4 text-center font-medium border transition-colors ${
                        message.startsWith('✅') || message.startsWith('🗑️')
                        ? (isDarkMode ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-100 text-green-700 border-green-300') 
                        : (isDarkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-100 text-red-700 border-red-300')
                    }`}>
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
}

export default ProductEditPage;