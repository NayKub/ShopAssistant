import { useState, useEffect, useCallback } from 'react';

// ================== CONFIG ==================
const CATEGORY_URL = 'http://localhost:3000/api/categories';
const DELETE_CATEGORY_URL = 'http://localhost:3000/api/categories'; 
const getToken = () => localStorage.getItem('userToken');

// --- UI Constants ---
// Input style for modal
const INPUT_STYLE_MODAL = 'w-full bg-gray-100 border border-gray-300 rounded-[10px] px-[16px] py-[12px] text-[18px] text-[#444] font-normal outline-none placeholder:text-[#888] box-border transition-all duration-200 focus:bg-white focus:shadow-md';
// Blue button style (Add)
const BUTTON_BLUE = 'text-white text-base font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 shadow-md hover:translate-y-[-1px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400';
// Red button style (Delete)
const BUTTON_RED = 'text-white text-base font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:bg-red-600 disabled:bg-red-300 bg-red-500';


// ================== COMPONENT ==================
const CategoryManagementComponent = ({ onClose }) => {
    
    // ---------- STATES ----------
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    
    // ---------- FETCH CATEGORIES ----------
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
    
    // ---------- ADD NEW CATEGORY ----------
    const handleAddNewCategory = async (e) => {
        e.preventDefault();
        const trimmedName = newCategoryName.trim();
        if (!trimmedName) {
            setMessage('❌ Please enter a category name.');
            setTimeout(() => setMessage(null), 2000);
            return;
        }
        
        setLoading(true); 
        setMessage(null);
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
                setMessage(`✅ Added Category: ${trimmedName}`);
                setNewCategoryName('');
                await fetchCategories(); 

            } else {
                setMessage(`❌ Add Category Failed: ${result.error || result.message || 'Server Error'}`);
            }

        } catch (error) {
            setMessage('❌ Network Error: Could not add category.');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };
    
    // ---------- DELETE CATEGORY ----------
    const handleDeleteCategory = async (categoryId, categoryName) => {
        if (!window.confirm(`Are you sure you want to delete "${categoryName}"? Products linked to this category may need reassignment.`)) return;
        
        setLoading(true); 
        setMessage(null);
        const token = getToken(); 

        try {
            const response = await fetch(`${DELETE_CATEGORY_URL}/${categoryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok || response.status === 204) {
                setMessage(`🗑️ Deleted category: ${categoryName}`);
                await fetchCategories(); 
            } else {
                 const result = await response.json();
                 setMessage(`❌ Deletion failed: ${result.message || 'Could not delete. Check for linked products.'}`);
            }

        } catch (error) {
            setMessage('❌ Network Error: Could not delete category.');
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };


    // ================== RENDER UI ==================
    return (
        <div className="p-8 bg-white shadow-2xl rounded-2xl space-y-7 max-w-lg mx-auto w-full border border-gray-200">
            <h3 className="text-3xl font-bold text-gray-800 border-b-2 border-gray-100 pb-3 flex justify-between items-center">
                🏷️ Manage Categories
                <button 
                    onClick={onClose} 
                    className="text-gray-500 hover:text-red-600 text-4xl leading-none transition duration-200"
                    aria-label="Close"
                >&times;</button>
            </h3>
            
            {/* Add New Category Form */}
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
                    className={`${BUTTON_BLUE} min-w-[120px] text-lg`} 
                >
                    {loading && newCategoryName.trim() ? 'Adding...' : 'Add'}
                </button>
            </form>

            {/* Message Display */}
            {message && (
                <div className={`p-3 rounded-xl text-base w-full text-center font-medium ${message.startsWith('✅') || message.startsWith('🗑️') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border ${message.startsWith('✅') || message.startsWith('🗑️') ? 'border-green-300' : 'border-red-300'}`}>
                    {message}
                </div>
            )}
            
            {/* Category List */}
            <div className="max-h-72 overflow-y-auto border-2 border-gray-200 rounded-xl p-3 bg-gray-50 shadow-inner">
                <h4 className="text-xl font-semibold text-gray-700 mb-3">Current Categories:</h4>
                {categories.length === 0 ? (
                    <p className="text-gray-500 italic p-3 text-center">No categories found</p>
                ) : (
                    <ul className="space-y-3">
                        {categories.map((cat) => (
                            <li 
                                key={cat._id} 
                                className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200"
                            >
                                <span className="text-gray-800 text-lg font-medium">{cat.name}</span>
                                <button
                                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                    disabled={loading}
                                    className={`${BUTTON_RED}`} 
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
        </div>
    );
}

export default CategoryManagementComponent;