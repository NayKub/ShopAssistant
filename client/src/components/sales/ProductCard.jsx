import React, { useState } from 'react';
import RestockButton from './RestockButton'; 

// Constant defining the base URL for uploaded images.
const BASE_UPLOAD_URL = 'http://localhost:3000/uploads';

const ProductCard = ({ product, onAddToCart, viewMode, getAvailableStock, quantityInCart, onRemoveAll, onRefillStock, navigateTo }) => {
  const placeholderImage = "https://via.placeholder.com/150?text=No+Image";
  
  const availableStock = getAvailableStock(product);
  const isInStock = availableStock > 0;
  const canAddToCart = (availableStock - quantityInCart) > 0;
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  };

  const getStockDisplay = () => {
    if (availableStock === 0) {
      return { text: 'Out of stock', className: 'text-red-600 font-semibold' };
    }
    if (availableStock < 5) {
      return { text: `Only ${availableStock} left`, className: 'text-orange-500 font-semibold' };
    }
    return { text: `In stock: ${availableStock} available`, className: 'text-green-600' };
  };

  const stockInfo = getStockDisplay();

  // Extract correct category name from product object or string
  const categoryName = typeof product.category === 'object' && product.category !== null 
    ? product.category.name 
    : product.category || 'N/A';

  return (
    <div 
        className={`bg-white rounded-[15px] p-[18px] shadow-md flex transition-all duration-200 relative overflow-hidden
          ${!isInStock ? 'opacity-70' : 'hover:translate-y-[-2px] hover:shadow-xl'}
          ${viewMode === 'table' ? 'flex-row items-center p-4 mb-3 rounded-xl' : 'flex-col gap-3'}`
        }
        onClick={() => navigateTo('edit_product', product._id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Restock and Delete Button Group (Visible when Out of Stock and Hovered) */}
      {(!isInStock) && isHovered && (
          <div className="absolute top-3 right-3 z-30 flex items-center space-x-2">
            {/* Delete Product Button */}
            <button 
              className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-semibold cursor-pointer transition-all duration-200 shadow-md flex items-center justify-center hover:bg-red-700"
              onClick={(e) => { e.stopPropagation(); onRemoveAll(product._id); }}
              title="Delete Product"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
              
            <RestockButton 
                productId={product._id} 
                onRefillStock={onRefillStock}
            />
          </div>
      )}

      {/* Product Image */}
      <div className={`bg-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden 
        ${viewMode === 'table' ? 'w-20 h-20 flex-shrink-0' : 'w-full h-[140px]'}
      `}>
        {product.image ? (
          <img 
            src={`${BASE_UPLOAD_URL}/${product.image}`}
            alt={product.product_name} 
            className="w-full h-full object-cover" 
            onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }}
          />
        ) : (
          <div className="text-4xl text-gray-500">
            <span>📷</span>
          </div>
        )}
        {!isInStock && <div className="absolute inset-0 bg-black bg-opacity-70 text-white flex items-center justify-center text-xs font-semibold">Out of Stock</div>}
      </div>
      
      {/* Product Info */}
      <div className={`flex flex-col gap-2 ${viewMode === 'table' ? 'flex-1 ml-4 min-w-0' : 'flex-1'}`}>
        <h3 className="text-sm font-semibold text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap leading-tight" title={product.product_name}>{product.product_name}</h3>
        
        {/* Category name */}
        <div className="text-xs text-gray-500 uppercase font-medium">{categoryName}</div>
        
        <div className="text-xs">
          <span className={stockInfo.className}>
            {stockInfo.text}
          </span>
          {quantityInCart > 0 && <span className="ml-2 text-blue-500 text-xs font-bold">({quantityInCart} in cart)</span>}
        </div>

        {/* Price and Add to Cart Button */}
        <div className={`flex items-center mt-auto ${viewMode === 'table' ? 'ml-auto gap-5' : 'justify-between'}`}>
          <span className="text-lg font-bold text-green-600">{formatPrice(product.price)}</span>
          <button 
            className={`w-[38px] h-[38px] rounded-full bg-green-500 text-white text-xl font-light cursor-pointer transition-all duration-200 shadow-md flex items-center justify-center 
              ${!canAddToCart ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'hover:bg-green-600 hover:scale-[1.05] hover:shadow-lg'}`}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            disabled={!canAddToCart}
            title={canAddToCart ? 'Add to cart' : 'Stock limit reached'}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;