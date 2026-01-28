import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';

const CATEGORY_URL = 'http://localhost:3000/api/categories';
const DELETE_CATEGORY_URL = 'http://localhost:3000/api/categories'; 
const getToken = () => localStorage.getItem('userToken');

const CategoryManagementComponent = ({ onClose }) => {
    const { isDarkMode } = useTheme();
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div 
                className={`shadow-2xl rounded-[32px] space-y-7 max-w-lg w-full p-10 relative animate-in zoom-in duration-300 transition-colors border ${
                    isDarkMode 
                    ? 'bg-[#1a1a1a] border-gray-800' 
                    : 'bg-white border-gray-200'
                }`}
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Header */}
                <h3 className={`text-3xl font-bold border-b-2 pb-3 flex justify-between items-center transition-colors ${
                    isDarkMode ? 'text-white border-gray-800' : 'text-gray-800 border-gray-100'
                }`}>
                    🏷️ Manage Categories
                    <button 
                        onClick={onClose} 
                        className={`text-4xl leading-none transition-colors ${
                            isDarkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-600'
                        }`}
                    >&times;</button>
                </h3>
                
                {/* Add Form */}
                <form onSubmit={handleAddNewCategory} className="flex space-x-3">
                    <input
                        type="text"
                        placeholder="New Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        disabled={loading}
                        required
                        className={`w-full rounded-[15px] px-[16px] py-[12px] text-[18px] font-normal outline-none transition-all duration-200 border ${
                            isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:bg-gray-700 focus:border-blue-500' 
                            : 'bg-gray-100 border-gray-300 text-gray-800 placeholder:text-gray-400 focus:bg-white focus:border-blue-500 focus:shadow-md'
                        }`}
                    />
                    <button
                        type="submit"
                        disabled={loading || !newCategoryName.trim()}
                        className={`min-w-[100px] text-white text-base font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all duration-200 shadow-md hover:translate-y-[-1px] active:translate-y-0 ${
                            loading || !newCategoryName.trim() 
                            ? 'bg-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? '...' : 'Add'}
                    </button>
                </form>

                {/* Status Message */}
                {message && (
                    <div className={`p-3 rounded-xl text-sm text-center font-medium border transition-colors ${
                        message.startsWith('✅') 
                        ? (isDarkMode ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700') 
                        : (isDarkMode ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700')
                    }`}>
                        {message}
                    </div>
                )}
                
                {/* Categories List Area */}
                <div className={`max-h-80 overflow-y-auto rounded-2xl p-2 transition-colors ${
                    isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-gray-50 border border-gray-100'
                }`}>
                    <h4 className={`text-lg font-semibold mb-3 px-2 transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Current Categories</h4>
                    
                    {categories.length === 0 ? (
                        <p className={`italic p-5 text-center transition-colors ${
                            isDarkMode ? 'text-gray-600' : 'text-gray-400'
                        }`}>No categories found</p>
                    ) : (
                        <ul className="space-y-2">
                            {categories.map((cat) => (
                                <li 
                                    key={cat._id} 
                                    className={`flex justify-between items-center p-4 rounded-2xl shadow-sm border transition-all duration-200 ${
                                        isDarkMode 
                                        ? 'bg-[#222] border-gray-800 hover:border-blue-900/50' 
                                        : 'bg-white border-gray-100 hover:border-blue-200'
                                    }`}
                                >
                                    <span className={`font-medium transition-colors ${
                                        isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                    }`}>{cat.name}</span>
                                    <button
                                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                        disabled={loading}
                                        className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${
                                            isDarkMode 
                                            ? 'text-red-400 hover:bg-red-900/30' 
                                            : 'text-red-500 hover:bg-red-50'
                                        }`}
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