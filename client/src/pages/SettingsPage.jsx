import React from 'react';

const SettingsPage = ({ navigateTo }) => {
    
    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo'); 
        localStorage.removeItem('storeId'); 
        navigateTo('login');
    };

    return (
        <div className="flex justify-center items-center min-h-screen font-sans bg-gray-50">
            <div className="w-11/12 sm:w-4/5 lg:w-2/5 max-w-lg p-10 bg-white shadow-2xl rounded-xl space-y-7 text-center">
                
                <h2 className="text-3xl font-bold text-gray-800">Settings & Account</h2>
                
                <div className="text-gray-600 text-lg">
                    Manage your session or log out from the system.
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full text-white text-[20px] font-medium px-10 py-4 border-none rounded-[20px] cursor-pointer 
                               transition duration-200 shadow-lg 
                               bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                >
                    Sign Out / Logout
                </button>
                
                <button
                    onClick={() => navigateTo('sales')}
                    className="w-full text-gray-700 text-[18px] font-medium px-10 py-3 border-none rounded-[20px] cursor-pointer 
                               transition duration-200 bg-gray-200 hover:bg-gray-300 shadow-md"
                >
                    Back to Sales Page
                </button>

            </div>
        </div>
    );
}

export default SettingsPage;