import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:3000/api/products';
const CATEGORY_URL = 'http://localhost:3000/api/categories';
const DELETE_API_URL = 'http://localhost:3000/api/products/permanent';
const BASE_UPLOAD_URL = 'http://localhost:3000/uploads/';

const profitOptions = [5, 10, 15, 20]; 
const getToken = () => localStorage.getItem('userToken');

const DEFAULT_PLACEHOLDER_TEXT = 'Click to Add Picture';
const FORM_WIDTH_CLASSES = 'w-11/12 sm:w-4/5 lg:w-3/5 max-w-3xl'; 
const INPUT_STYLE = 'w-full bg-[#dddddd] border-none rounded-[18px] px-[24px] py-[16px] text-[22px] text-[#444] font-normal outline-none placeholder:text-[#888] box-border';
const SELECT_STYLE = `${INPUT_STYLE} appearance-none cursor-pointer`; 


const ProductEditPage = ({ navigateTo, productId }) => {
    
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
    
    // Cleanup Image Preview URL on component unmount
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
        } catch {
            // Error
        }
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

    
    useEffect(() => {
        
        if (!formData.cost || isNaN(parseFloat(formData.cost))) return;
        const cost = parseFloat(formData.cost);
        const price = cost + (cost * profitPercentage) / 100;
        
        
        
    }, [formData.cost, profitPercentage]);
    
    
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
        if (imagePreviewUrl) {
            URL.revokeObjectURL(imagePreviewUrl);
        }

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
        
        
        const finalPrice = parseFloat(formData.price);
        const finalCost = parseFloat(formData.cost);
        const finalStock = parseInt(formData.stock);

        if (isNaN(finalPrice) || finalPrice <= 0) {
             setMessage('❌ Please enter a valid selling price (must be greater than 0)');
             setLoading(false);
             return;
        }
         if (isNaN(finalCost) || finalCost < 0) {
             setMessage('❌ Please enter a valid cost price (must not be negative)');
             setLoading(false);
             return;
        }
         if (isNaN(finalStock) || finalStock < 0) {
             setMessage('❌ Please enter a valid stock quantity (must not be negative)');
             setLoading(false);
             return;
        }
        if (!formData.category) {
            setMessage('❌ Please select a product Category.');
            setLoading(false);
            return;
        }


        const data = new FormData();
        data.append('product_name', formData.product_name);
        data.append('cost', finalCost);
        data.append('price', finalPrice); 
        data.append('stock', finalStock);
        data.append('category', formData.category);
        data.append('sold_count', formData.sold_count); 

        if (imageFile) data.append('image', imageFile);
        else if (existingImageName) data.append('image', existingImageName);
        

        try {
            const res = await fetch(`${API_URL}/${productId}`, {
                method: 'PUT',
                headers: { 
                    Authorization: `Bearer ${token}` 
                },
                body: data
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setMessage('✅ Updated successfully');
                setExistingImageName(result.data.image || existingImageName);
                if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
                setImageFile(null); 
                setImagePreviewUrl('');
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
        setMessage('');

        const token = getToken();
        if (!token) {
            setMessage('Not authenticated');
            setIsDeleting(false);
            return;
        }

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
    
    const displayImageUrl = imagePreviewUrl
        ? imagePreviewUrl 
        : existingImageName
            ? `${BASE_UPLOAD_URL}${existingImageName}` 
            : null;
            
    const overlayText = imageFile ? imageFile.name : (existingImageName ? 'Click to Change Picture' : DEFAULT_PLACEHOLDER_TEXT);
    
    const isFormValid = formData.product_name && formData.cost !== '' && formData.price !== '' && formData.stock !== '' && formData.category;


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
                
                <div className="flex justify-start items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Edit Product: {formData.product_name}</h2>
                </div>
                
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
                
                {/* Category Select Section */}
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
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                            <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                    
                    

                </div>


                {/* Cost + Profit Group */}
                <div className="space-y-3">
                    {/* Cost Input (Full Width) */}
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
                    
                    {/* Profit Radios */}
                    <div className="flex items-center space-x-6 pl-[8px] pt-1"> 
                        <span className="font-semibold text-[20px] text-[#444]">Profit Ratio:</span>
                        
                        <div className="flex items-center space-x-[20px] overflow-x-auto whitespace-nowrap">
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
                        <p className={`text-base ml-1 pl-[18px] pt-1 ${isLoss ? 'text-red-600 font-bold' : 'text-green-700 font-semibold'}`}>
                            Actual Profit: {actualProfitAmount.toFixed(2)} Baht ({actualProfitRatio.toFixed(2)}%)
                            {isLoss && " (Loss!)"}
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
                    
                    {/* Delete Button (Left) */}
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

                        {/* Save Button (Right) */}
                        <button
                            type="submit"
                            disabled={!isFormValid || loading || isDeleting}
                            className={`text-white text-[20px] font-medium 
                                        px-10 py-4 border-none rounded-[20px] cursor-pointer 
                                        font-varela transition duration-200 shadow-md
                                        ${(!isFormValid || loading || isDeleting) 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-[#25823a] hover:bg-[#166534]'}`}
                        >
                            {loading && !isDeleting ? 'Saving...' : 'Save'}
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