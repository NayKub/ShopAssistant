import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import ProductCard from './ProductCard'; 

const ProductGrid = ({ products, onAddToCart, isLoading, viewMode, getAvailableStock, cartItems, onRemoveAll, onRefillStock, navigateTo }) => {
  const { isDarkMode } = useTheme();

  const customScrollbar = `
    .product-grid-custom-scroll::-webkit-scrollbar {
        width: 8px;
    }
    .product-grid-custom-scroll::-webkit-scrollbar-track {
        background: ${isDarkMode ? '#1e1e1e' : '#f1f1f1'};
        border-radius: 4px;
    }
    .product-grid-custom-scroll::-webkit-scrollbar-thumb {
        background: ${isDarkMode ? '#444' : '#c1c1c1'};
        border-radius: 4px;
        transition: background 0.2s ease;
    }
    .product-grid-custom-scroll::-webkit-scrollbar-thumb:hover {
        background: ${isDarkMode ? '#555' : '#a8a8a8'};
    }
  `;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className={`text-lg p-5 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading products...
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center p-5">
          <span className="text-5xl block mb-4">📦</span>
          <h3 className={`text-lg font-semibold mb-2 transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            No products found
          </h3>
          <p className={`text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            Try adjusting your search or category filter
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{customScrollbar}</style>
      <div className={`w-full max-h-[70vh] overflow-y-auto pr-2 product-grid-custom-scroll 
        ${viewMode === 'table' 
          ? 'block space-y-3'
          : 'grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'}
      `}>
        {products.map(product => {
            const itemInCart = cartItems.find(item => item.product._id === product._id);
            const quantityInCart = itemInCart ? itemInCart.quantity : 0;

            return (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={onAddToCart}
                viewMode={viewMode}
                getAvailableStock={getAvailableStock}
                quantityInCart={quantityInCart}
                onRemoveAll={onRemoveAll}
                onRefillStock={onRefillStock} 
                navigateTo={navigateTo}
              />
            )
        })}
      </div>
    </>
  );
}

export default ProductGrid;