import React, { useState } from 'react';

const SettingsPage = ({ navigateTo, onClose }) => {
  const [activeTab, setActiveTab] = useState('account');

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('storeId');
    navigateTo('login');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div 
        className="bg-white rounded-[30px] shadow-2xl w-full max-w-4xl flex overflow-hidden relative animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <div className="w-1/3 bg-gray-100 p-8 flex flex-col justify-between border-r border-gray-200">
          <div className="space-y-4">
            <button 
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'account' ? 'bg-white shadow-md' : 'hover:bg-gray-200'}`}
            >
              <span className="text-xl">👤</span>
              <span className="font-bold text-gray-700">Account</span>
            </button>
            <button 
              onClick={() => setActiveTab('theme')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'theme' ? 'bg-white shadow-md' : 'hover:bg-gray-200'}`}
            >
              <span className="text-xl">🖌️</span>
              <span className="font-bold text-gray-700">Theme</span>
            </button>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all"
          >
            <span className="text-xl">↪️</span>
            <span>Log out</span>
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-10 bg-white relative min-h-[500px]">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 text-3xl transition-colors"
          >
            &times;
          </button>

          {activeTab === 'account' ? (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800">Account</h2>
              
              <div className="flex items-start space-x-10">
                {/* Profile Image Placeholder */}
                <div className="w-40 h-40 rounded-full bg-blue-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                   <div className="text-6xl">🖼️</div>
                </div>

                <div className="flex-1 space-y-5">
                  {[
                    { label: 'Store Name', value: 'My Shop' },
                    { label: 'Email', value: 'shop@example.com' },
                    { label: 'Phone Number', value: '081-234-5678' },
                    { label: 'Password', value: '************' }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex space-x-2">
                        <span className="font-bold text-gray-700">{item.label} :</span>
                        <span className="text-gray-500">{item.value}</span>
                      </div>
                      <button className="text-xl hover:scale-110 transition-transform">📝</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800">Theme</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-4 cursor-pointer p-2">
                  <span className="text-gray-700 font-medium">Light</span>
                  <input type="radio" name="theme" defaultChecked className="w-5 h-5 accent-blue-500" />
                </label>
                <label className="flex items-center space-x-4 cursor-pointer p-2">
                  <span className="text-gray-700 font-medium">Dark</span>
                  <input type="radio" name="theme" className="w-5 h-5 accent-blue-500" />
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