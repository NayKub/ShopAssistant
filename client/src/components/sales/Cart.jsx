import React from 'react';

const BASE_UPLOAD_URL = 'http://localhost:3000/uploads';

const Cart = ({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout, 
  subtotal, 
  tax, 
  serviceCharge, 
  discount,
  total,
  isLoading,
  checkoutMessage,
  clearCart,
  getAvailableStock,
  baseUploadUrl // Prop for dynamic URL
}) => {
  const finalBaseUploadUrl = baseUploadUrl || BASE_UPLOAD_URL; 
  const placeholderImage = "https://via.placeholder.com/150?text=No+Image";
  
  const formatPrice = (price) => {
    // Format to THB currency
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2,
    }).format(price);
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartItemStyle = `
    .cart-items-custom-scroll::-webkit-scrollbar {
        width: 6px;
    }
    .cart-items-custom-scroll::-webkit-scrollbar-track {
        background: #f8f8f8;
        border-radius: 3px;
    }
    .cart-items-custom-scroll::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
    }
    .cart-items-custom-scroll::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
  `;

  // Handle input changes (while typing)
  const handleInputChange = (productId, e) => {
    const value = e.target.value;
    
    if (value === '') {
        onUpdateQuantity(productId, 0, true); // isTyping: true, quantity = 0
        return;
    } 

    const newQuantity = parseInt(value, 10);
    if (isNaN(newQuantity) || newQuantity < 0) return; 

    onUpdateQuantity(productId, newQuantity, true); // isTyping: true
  };

  // Handle input blur (validation/correction)
  const handleInputBlur = (productId) => {
    const item = cartItems.find(i => i.product._id === productId);
    if (!item) return;

    const currentQuantity = item.quantity;
    const availableStock = getAvailableStock(item.product);
    
    let finalQuantity = currentQuantity;
    
    if (currentQuantity < 1) {
        if (availableStock > 0) {
            finalQuantity = 1; // Default to 1 if stock available
        } else {
            onRemoveItem(productId); // Remove item if stock is zero
            return; 
        }
    } else if (currentQuantity > availableStock) {
        finalQuantity = availableStock; // Cap at max stock
    } 

    onUpdateQuantity(productId, finalQuantity, false); // isTyping: false
  };

  // Set isTyping to true on focus
  const handleInputFocus = (productId, itemQuantity) => {
      onUpdateQuantity(productId, itemQuantity, true); 
  }

  return (
    <div className="fixed right-0 top-0 w-[300px] h-screen bg-gray-50 p-5 flex flex-col gap-5 shadow-xl z-20">
      <style>{cartItemStyle}</style>

      <div className="border-b border-gray-200 pb-4">
        <h3 className="m-0 text-xl font-semibold text-gray-800">Order ({itemCount} items)</h3>
      </div>

      <div className="flex flex-col gap-4 max-h-[40%] overflow-y-auto cart-items-custom-scroll">
        {cartItems.length === 0 ? (
          <div className="text-center p-10 text-gray-600">
            <span className="text-5xl block mb-4">🛒</span>
            <p className="mb-2 text-base font-semibold text-gray-800">Your cart is empty</p>
            <small className="text-sm">Add some products to get started</small>
          </div>
        ) : (
          cartItems.map(item => {
            const availableStock = getAvailableStock(item.product);
            const totalItemPrice = parseFloat(item.product.price) * item.quantity;
            
            // Display empty string while typing 0 or empty
            const displayQuantity = item.isTyping && (item.quantity === 0 || isNaN(item.quantity)) ? '' : item.quantity;

            return (
              <div key={item.product._id} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="w-10 h-10 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.product.image ? (
                    <img 
                      src={`${finalBaseUploadUrl}/${item.product.image}`}
                      alt={item.product.product_name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.onerror = null; e.target.src=placeholderImage; }}
                    />
                  ) : (
                    <span className="text-base text-gray-500">📦</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis" title={item.product.product_name}>{item.product.product_name}</div>
                  <div className="text-xs text-gray-600">{formatPrice(item.product.price)}</div>
                  <div className="text-sm text-gray-800 font-semibold">{formatPrice(totalItemPrice)}</div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                    <button 
                      className="w-6 h-6 rounded-l-lg bg-gray-100 text-gray-700 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => onUpdateQuantity(item.product._id, -1, false)} // Decrement quantity
                      disabled={isLoading || item.quantity <= 1}
                    >
                      -
                    </button>
                    
                    {/* Quantity Input Field */}
                    <input 
                        type="number"
                        min="0"
                        max={availableStock}
                        value={displayQuantity}
                        onChange={(e) => handleInputChange(item.product._id, e)}
                        onBlur={() => handleInputBlur(item.product._id)}
                        onFocus={() => handleInputFocus(item.product._id, item.quantity)} // Set typing state on focus
                        className="w-8 text-sm font-semibold text-center border-none bg-transparent focus:outline-none focus:ring-0 p-0 m-0"
                        disabled={isLoading}
                    />
                    
                    <button 
                      className="w-6 h-6 rounded-r-lg bg-gray-100 text-gray-700 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => onUpdateQuantity(item.product._id, 1, false)} // Increment quantity
                      disabled={isLoading || item.quantity >= availableStock}
                    >
                      +
                    </button>
                  </div>
                  <button 
                    className="bg-transparent border-none text-base cursor-pointer p-1 rounded-sm transition-colors duration-200 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onRemoveItem(item.product._id)}
                    title="Remove item"
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 100 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {checkoutMessage && (
          <div className={`p-3 rounded-lg text-sm font-medium ${checkoutMessage.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {checkoutMessage}
          </div>
      )}
      
      {cartItems.length > 0 && (
        <>
          <div className="mt-auto">
            {/* Clear Cart Button */}
            <button 
                onClick={clearCart} 
                className="w-full mb-3 py-2 text-red-600 border border-red-400 rounded-lg hover:bg-red-50 font-semibold transition duration-150 flex items-center justify-center"
                disabled={isLoading}
            >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                Clear Cart
            </button>
          </div>

          <div className="bg-gray-200 p-4 rounded-[15px] flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-sm text-green-600">
                <span>Discount (0%)</span>
                <span className="font-semibold">-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Service Charge</span>
              <span>{serviceCharge === 0 ? 'Free' : formatPrice(serviceCharge)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Tax (7%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <hr className="border-t border-gray-400 my-2" />
            <div className="flex justify-between items-center text-lg font-bold text-gray-800">
              <span>Total</span>
              <span className="text-green-600">{formatPrice(total)}</span>
            </div>
          </div>
          
          <button 
            className={`bg-green-600 text-white p-4 rounded-[15px] text-lg font-semibold cursor-pointer transition-colors duration-200 
              ${isLoading || cartItems.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'hover:bg-green-700 hover:translate-y-[-1px)'}`
            }
            onClick={onCheckout}
            disabled={isLoading || cartItems.length === 0}
          >
            {isLoading ? 'Processing...' : `Continue • ${formatPrice(total)}`}
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;