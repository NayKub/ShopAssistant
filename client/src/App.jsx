import React, { useState } from 'react';
import SalesView from './components/SalesView';       
import AddProductForm from './components/AddProductForm'; 
import EditProductForm from './components/EditProductForm';

const VIEWS = {
    SALES: 'sales',
    ADD_PRODUCT: 'add_product',
    EDIT_PRODUCT: 'edit_product',
};

function App() {
    const [currentView, setCurrentView] = useState(VIEWS.SALES);
    const [editingProductId, setEditingProductId] = useState(null); 
    
    const navigateTo = (viewName, productId = null) => {
        setEditingProductId(productId); 
        setCurrentView(viewName);
    };

    const renderView = () => {
        switch (currentView) {
            case VIEWS.SALES:
                return <SalesView navigateTo={navigateTo} />; 
            case VIEWS.ADD_PRODUCT:
                return <AddProductForm navigateTo={navigateTo} />;
            case VIEWS.EDIT_PRODUCT:
                return <EditProductForm navigateTo={navigateTo} productId={editingProductId} />; 
            default:
                return <div>404 Not Found</div>;
        }
    };

    return (
        <div className="App">
            {renderView()}
        </div>
    );
}

export default App;