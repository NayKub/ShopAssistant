import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

const SettingsPage = ({ onClose, navigateTo }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('account');
    const [profile, setProfile] = useState({ store_name: '', email: '', phone: '', profile_image: '' });
    const [isEditing, setIsEditing] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const getToken = () => localStorage.getItem('userToken');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/settings/profile', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const result = await response.json();
            if (result.success) {
                setProfile(result.data);
            }
        } catch (err) {
            console.error('Fetch profile error:', err);
        }
    };

    const handleImageUpload = async (e) => { 
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/settings/profile-image', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                setProfile(prev => ({ ...prev, profile_image: result.image }));
            }
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (field, value) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/settings/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ [field]: value })
            });
            if (response.ok) {
                setProfile(prev => ({ ...prev, [field]: value }));
                setIsEditing(null);
            }
        } catch (err) {
            console.error('Update error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigateTo('login');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`relative flex h-[550px] w-full max-w-[850px] overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 ${isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-gray-800'}`}>
                
                <button 
                    onClick={onClose}
                    className={`absolute right-6 top-6 z-10 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className={`flex w-1/4 flex-col border-r transition-colors duration-300 ${isDarkMode ? 'border-gray-800 bg-[#121212]' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="flex-1 space-y-2 p-6">
                        <button 
                            onClick={() => setActiveTab('account')}
                            className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'account' ? (isDarkMode ? 'bg-gray-800 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm') : (isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100')}`}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Account</span>
                        </button>

                        <button 
                            onClick={() => setActiveTab('theme')}
                            className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${activeTab === 'theme' ? (isDarkMode ? 'bg-gray-800 text-blue-400 shadow-sm' : 'bg-white text-blue-600 shadow-sm') : (isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100')}`}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            <span>Theme</span>
                        </button>
                    </div>

                    <div className="p-6">
                        <button 
                            onClick={handleLogout}
                            className={`flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Log out</span>
                        </button>
                    </div>
                </div>

                <div className={`flex-1 p-12 overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
                    {activeTab === 'account' ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className={`mb-8 text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Account</h2>
                            <div className="flex items-start space-x-12">
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className={`group relative h-32 w-32 cursor-pointer overflow-hidden rounded-full ring-4 transition-all ${isDarkMode ? 'bg-gray-800 ring-gray-800 hover:ring-blue-900' : 'bg-gray-100 ring-gray-50 hover:ring-blue-100'}`}
                                >
                                    <img 
                                        src={profile.profile_image ? `http://localhost:3000/uploads/${profile.profile_image}` : "https://via.placeholder.com/150"} 
                                        alt="Avatar" 
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                </div>

                                <div className="flex-1 space-y-8">
                                    {[
                                        { id: 'store_name', label: 'STORE NAME', value: profile.store_name },
                                        { id: 'email', label: 'EMAIL', value: profile.email },
                                        { id: 'phone', label: 'PHONE NUMBER', value: profile.phone },
                                        { id: 'password', label: 'PASSWORD', value: '••••••••••••••••' },
                                    ].map((field) => (
                                        <div key={field.id} className={`group relative border-b pb-2 transition-colors ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                            <label className={`block text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{field.label}</label>
                                            <div className="flex items-center justify-between mt-1">
                                                {isEditing === field.id ? (
                                                    <input 
                                                        autoFocus
                                                        defaultValue={field.value}
                                                        onBlur={(e) => handleUpdate(field.id, e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(field.id, e.target.value)}
                                                        className={`text-lg bg-transparent outline-none w-full font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                                                    />
                                                ) : (
                                                    <span className={`text-lg font-medium ${field.id === 'phone' && !field.value ? (isDarkMode ? 'text-gray-700' : 'text-gray-300') : (isDarkMode ? 'text-gray-200' : 'text-gray-700')}`}>
                                                        {field.id === 'phone' ? (field.value || '-') : field.value}
                                                    </span>
                                                )}
                                                {field.id !== 'password' && (
                                                    <button onClick={() => setIsEditing(field.id)} className={`transition-colors ${isDarkMode ? 'text-gray-600 hover:text-blue-400' : 'text-gray-400 hover:text-blue-500'}`}>
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className={`mb-8 text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Theme</h2>
                            <div className="space-y-4">
                                <label 
                                    onClick={() => isDarkMode && toggleTheme()}
                                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${!isDarkMode ? 'border-blue-500 bg-blue-50/50' : (isDarkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50')}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className={`h-6 w-6 ${!isDarkMode ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
                                        </svg>
                                        <span className={`text-lg font-medium ${!isDarkMode ? (isDarkMode ? 'text-blue-400' : 'text-blue-700') : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}>Light Mode</span>
                                    </div>
                                    <div className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${!isDarkMode ? 'border-blue-500' : (isDarkMode ? 'border-gray-600' : 'border-gray-300')}`}>
                                        {!isDarkMode && <div className="h-3 w-3 rounded-full bg-blue-500" />}
                                    </div>
                                </label>

                                <label 
                                    onClick={() => !isDarkMode && toggleTheme()}
                                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${isDarkMode ? 'border-blue-500 bg-blue-900/10' : 'border-gray-100 hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className={`h-6 w-6 ${isDarkMode ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                        <span className={`text-lg font-medium ${isDarkMode ? 'text-blue-400' : 'text-gray-700'}`}>Dark Mode</span>
                                    </div>
                                    <div className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${isDarkMode ? 'border-blue-500' : 'border-gray-300'}`}>
                                        {isDarkMode && <div className="h-3 w-3 rounded-full bg-blue-500" />}
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;