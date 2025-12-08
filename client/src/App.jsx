import React, { useState } from 'react';
import SalesView from './components/SalesView';       
import AddProductForm from './components/AddProductForm'; 

const VIEWS = {
    SALES: 'sales',
    ADD_PRODUCT: 'add_product',
};

function App() {
    const [currentView, setCurrentView] = useState(VIEWS.SALES);

    const navigateTo = (viewName, productId = null) => {
        setCurrentView(viewName);
    };

    const renderView = () => {
        switch (currentView) {
            case VIEWS.SALES:
                return <SalesView navigateTo={navigateTo} />; 
            case VIEWS.ADD_PRODUCT:
                return <AddProductForm navigateTo={navigateTo} />;
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