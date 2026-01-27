import { useState, useEffect, useCallback } from 'react';

const CATEGORY_URL = 'http://localhost:3000/api/categories';
const DELETE_CATEGORY_URL = 'http://localhost:3000/api/categories'; 
const getToken = () => localStorage.getItem('userToken');

const INPUT_STYLE_MODAL = 'w-full bg-gray-100 border border-gray-300 rounded-[10px] px-[16px] py-[12px] text-[18px] text-[#444] font-normal outline-none placeholder:text-[#888] box-border transition-all duration-200 focus:bg-white focus:shadow-md';
const BUTTON_BLUE = 'text-white text-base font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 shadow-md hover:translate-y-[-1px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400';
const BUTTON_RED = 'text-white text-base font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:bg-red-600 disabled:bg-red-300 bg-red-500';

const CategoryManagementComponent = ({ onClose }) => {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    
    const fetchCategories = useCallback(async () => {
        const token = getToken();
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(CATEGORY_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await res.json();
            if (res.ok && result.success) {
                setCategories(result.data || []);
            }
        } catch {
            setMessage('❌ Failed to load categories'); 
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);
    
    const handleAddNewCategory = async (e) => {
        e.preventDefault();
        const trimmedName = newCategoryName.trim();
        if (!trimmedName) return;
        
        setLoading(true); 
        const token = getToken(); 
        try {
            const response = await fetch(CATEGORY_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: trimmedName }),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setNewCategoryName('');
                await fetchCategories(); 
            }
        } catch (error) {
            setMessage('❌ Network Error');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };
    
    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (!window.confirm(`Are you sure you want to delete "${categoryName}"?`)) return;
        setLoading(true); 
        const token = getToken(); 
        try {
            const response = await fetch(`${DELETE_CATEGORY_URL}/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                await fetchCategories(); 
            }
        } catch (error) {
            setMessage('❌ Error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white shadow-2xl rounded-[32px] space-y-7 max-w-lg w-full border border-gray-200 p-10 relative animate-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()} 
            >
                <h3 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-100 pb-3 flex justify-between items-center">
                    🏷️ Manage Categories
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-red-600 text-4xl leading-none transition duration-200"
                    >&times;</button>
                </h3>
                
                <form onSubmit={handleAddNewCategory} className="flex space-x-3">
                    <input
                        type="text"
                        placeholder="New Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className={INPUT_STYLE_MODAL} 
                        disabled={loading}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading || !newCategoryName.trim()}
                        className={`${BUTTON_BLUE} min-w-[100px]`} 
                    >
                        {loading ? '...' : 'Add'}
                    </button>
                </form>

                {message && (
                    <div className={`p-3 rounded-xl text-sm text-center font-medium border ${message.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        {message}
                    </div>
                )}
                
                <div className="max-h-80 overflow-y-auto border border-gray-100 rounded-2xl p-2 bg-gray-50/50">
                    <h4 className="text-lg font-semibold text-gray-600 mb-3 px-2">Current Categories</h4>
                    {categories.length === 0 ? (
                        <p className="text-gray-400 italic p-5 text-center">No categories found</p>
                    ) : (
                        <ul className="space-y-2">
                            {categories.map((cat) => (
                                <li 
                                    key={cat._id} 
                                    className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-200"
                                >
                                    <span className="text-gray-700 font-medium">{cat.name}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                        disabled={loading}
                                        className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CategoryManagementComponent;