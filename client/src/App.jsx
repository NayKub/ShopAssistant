import React, { useState } from 'react';
import LoginView from './pages/LoginView';       
import RegisterView from './pages/RegisterView'; 
import SalesView from './pages/SalesView';       
import AddProductForm from './pages/AddProductForm'; 
import EditProductForm from './pages/EditProductForm';
import SettingsPage from './pages/SettingsPage';

const VIEWS = {
    REGISTER: 'register',
    LOGIN: 'login',
    SALES: 'sales',
    ADD_PRODUCT: 'add_product',
    EDIT_PRODUCT: 'edit_product',
    SETTINGS: 'settings', // 🆕 เพิ่ม View สำหรับ Settings
};

const checkAuthStatus = () => {
    return localStorage.getItem('userToken') && localStorage.getItem('storeId');
};

function App() {
    const initialView = checkAuthStatus() ? VIEWS.SALES : VIEWS.REGISTER;
    const [currentView, setCurrentView] = useState(initialView);
    const [editingProductId, setEditingProductId] = useState(null); 
    
    const navigateTo = (viewName, productId = null) => {
        setEditingProductId(productId); 
        setCurrentView(viewName);
    };

    const handleLoginSuccess = () => {
        setCurrentView(VIEWS.SALES);
    };
    
    const renderView = () => {
        switch (currentView) {
            case VIEWS.REGISTER:
                return <RegisterView navigateTo={navigateTo} />; 
            case VIEWS.LOGIN:
                return <LoginView navigateTo={navigateTo} onLoginSuccess={handleLoginSuccess} />; 
            case VIEWS.SALES:
                return <SalesView navigateTo={navigateTo} />; 
            case VIEWS.ADD_PRODUCT:
                return <AddProductForm navigateTo={navigateTo} />;
            case VIEWS.EDIT_PRODUCT:
                return <EditProductForm navigateTo={navigateTo} productId={editingProductId} />; 
            case VIEWS.SETTINGS: // 🆕 Case สำหรับหน้า Settings
                return <SettingsPage navigateTo={navigateTo} />;
            default:
                return <div className="p-8 text-red-600 text-center">404 Not Found</div>;
        }
    };

    return (
        <div className="App">
            {renderView()}
        </div>
    );
}

export default App;