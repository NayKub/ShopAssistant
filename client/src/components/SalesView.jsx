import React, { useState, useEffect, useCallback, useMemo } from 'react';

// ====================================================================
// --- UI Components (Tailwind CSS) ---
// ====================================================================

// 🆕 NEW COMPONENT: Restock Button with Custom Input
const RestockButton = ({ productId, onRefillStock }) => {
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [refillAmount, setRefillAmount] = useState('');

    const handleRefill = (e) => {
        e.stopPropagation();
        const amount = parseInt(refillAmount, 10);
        
        if (amount > 0) {
            onRefillStock(productId, amount);
            setRefillAmount('');
            setIsInputVisible(false); // ปิด Input หลังจากเติมเสร็จ
        } else {
            alert('Please enter a valid amount (greater than 0).');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleRefill(e);
        }
    };

    const handleBlur = () => {
        if (refillAmount === '' || parseInt(refillAmount, 10) <= 0) {
            setIsInputVisible(false);
        }
    };

    const toggleInput = (e) => {
        e.stopPropagation();
        setIsInputVisible(prev => !prev);
        setRefillAmount(''); // ล้างค่าเมื่อเปิด/ปิด
    }

    return (
        <div className="flex items-center space-x-2 z-10">
            {isInputVisible ? (
                <div className="flex items-center bg-white rounded-full p-1 shadow-lg">
                    <input
                        type="number"
                        min="1"
                        value={refillAmount}
                        onChange={(e) => setRefillAmount(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        placeholder="Qty"
                        className="w-12 text-sm font-medium text-center border-none bg-transparent focus:outline-none focus:ring-0 p-0 m-0"
                    />
                    <button 
                        className="w-6 h-6 rounded-full bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50"
                        onClick={handleRefill}
                        disabled={parseInt(refillAmount, 10) <= 0 || !refillAmount}
                        title="Confirm Refill"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                </div>
            ) : null}
            
            <button 
                className="w-7 h-7 rounded-full bg-blue-600 text-white text-base font-semibold cursor-pointer transition-all duration-200 shadow-md flex items-center justify-center hover:bg-blue-700"
                onClick={toggleInput}
                title="Restock (Custom Amount)" 
            >
                {/* Icon for Refill / Input Toggle */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m3.987 11h-.582a2 2 0 01-2-2v-3m11 2v3a2 2 0 01-2 2h-3.987m-4.472-8l-2 2m0 0l2 2m-2-2h8"></path></svg>
            </button>
        </div>
    );
}

const Sidebar = ({ activeItem, onNavigate }) => {
  const menuItems = [
    { id: 'notification', icon: null, hasRedDot: true, label: 'Notifications' },
    { id: 'home', icon: '🏠', hasRedDot: false, label: 'Home' },
    { id: 'analytics', icon: '📊', hasRedDot: false, label: 'Analytics' },
    { id: 'settings', icon: '⚙️', hasRedDot: false, label: 'Settings' }
  ];

  return (
    <div className="fixed left-0 top-0 w-[80px] h-screen bg-gray-100 flex flex-col items-center pt-5 pb-5 space-y-5 shadow-lg z-20">
      {menuItems.map(item => (
        <div 
          key={item.id}
          className={`w-[50px] h-[50px] rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 
            ${activeItem === item.id ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-200'}`
          }
          onClick={() => onNavigate(item.id)}
          title={item.label}
        >
          {item.hasRedDot ? (
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          ) : (
            <span className="text-2xl">{item.icon}</span>
          )}
        </div>
      ))}
    </div>
  );
}

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

  return (
    <div 
        className={`bg-white rounded-[15px] p-[18px] shadow-md flex transition-all duration-200 relative overflow-hidden
          ${!isInStock ? 'opacity-70' : 'hover:translate-y-[-2px] hover:shadow-xl'}
          ${viewMode === 'table' ? 'flex-row items-center p-4 mb-3 rounded-xl' : 'flex-col gap-3'}`
        }
        onClick={() => navigateTo('edit_product', product._id)} // ⭐ ADD
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* 🟢 ปุ่มลบ (แสดงเมื่อ Out of Stock และ Hover) */}
      {(!isInStock) && isHovered && (
          <button 
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-600 text-white text-xs font-semibold cursor-pointer transition-all duration-200 shadow-md flex items-center justify-center z-20 hover:bg-red-700"
              onClick={(e) => { e.stopPropagation(); onRemoveAll(product._id); }}
              title="Delete Product (State Only)"
          >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
      )}

      {/* 🆕 ปุ่มเติม Stock (แสดงเมื่อ Out of Stock และ Hover) */}
      {(!isInStock) && isHovered && (
          <div className="absolute top-3 right-3 z-30 flex items-center space-x-2">
            {/* เลื่อนปุ่มลบไปทางซ้ายสุดของ Restock Button Group */}
            <button 
              className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-semibold cursor-pointer transition-all duration-200 shadow-md flex items-center justify-center hover:bg-red-700"
              onClick={(e) => { e.stopPropagation(); onRemoveAll(product._id); }}
              title="Delete Product (State Only)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
             
            <RestockButton 
                productId={product._id} 
                onRefillStock={onRefillStock}
            />
          </div>
      )}

      {/* Product Image Placeholder */}
      <div className={`bg-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden 
        ${viewMode === 'table' ? 'w-20 h-20 flex-shrink-0' : 'w-full h-[140px]'}
      `}>
        {product.image ? (
          <img 
            src={`http://localhost:3000/uploads/${product.image}`}
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
        <div className="text-xs text-gray-500 uppercase font-medium">{product.category}</div>
        
        <div className="text-xs">
          <span className={stockInfo.className}>
            {stockInfo.text}
          </span>
          {quantityInCart > 0 && <span className="ml-2 text-blue-500 text-xs font-bold">({quantityInCart} in cart)</span>}
        </div>

        {/* Product Footer */}
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

const ProductGrid = ({ products, onAddToCart, isLoading, viewMode, getAvailableStock, cartItems, onRemoveAll, onRefillStock, navigateTo }) => {
  const customScrollbar = `
    .product-grid-custom-scroll::-webkit-scrollbar {
        width: 8px;
    }
    .product-grid-custom-scroll::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    .product-grid-custom-scroll::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
        transition: background 0.2s ease;
    }
    .product-grid-custom-scroll::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
  `;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-gray-600 p-5">Loading products...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center text-gray-600 p-5">
          <span className="text-5xl block mb-4">📦</span>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
          <p className="text-sm">Try adjusting your search or category filter</p>
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
                onRefillStock={onRefillStock} // 🆕 ส่งฟังก์ชันเติม Stock ไปยัง Card
                navigateTo={navigateTo}
              />
            )
        })}
      </div>
    </>
  );
}

const Header = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  onAddProduct,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="mb-8">
      <div className="flex gap-4 mb-6">
        <button className="bg-green-600 text-white p-4 rounded-[15px] text-base font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-green-700 hover:translate-y-[-1px]" onClick={onAddProduct}>
          <span className="text-lg">🏪</span>
          Add product
        </button>
      </div>
      
      <div className="relative mb-5">
        <input 
          type="text" 
          placeholder="Search products..." 
          className="w-full p-5 pl-6 pr-16 border-none rounded-full bg-gray-200 text-lg outline-none transition-colors duration-200 focus:bg-gray-300"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-600 text-xl">🔍</span>
      </div>
      
      <div className="flex justify-between items-center mb-6 gap-5 flex-wrap">
        <div className="flex gap-4 flex-wrap flex-1">
          {categories.map(category => (
            <button
              key={category}
              className={`py-3 px-7 rounded-full text-base font-medium cursor-pointer transition-all duration-200 whitespace-nowrap 
                ${selectedCategory === category 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400 hover:translate-y-[-1px]'}`
              }
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2 bg-gray-200 p-1 rounded-xl">
          <button
            className={`py-2 px-3 rounded-lg text-lg cursor-pointer transition-all duration-200 text-gray-600 
              ${viewMode === 'grid' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-transparent hover:bg-gray-300'}`
            }
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
          >
            ⊞
          </button>
          <button
            className={`py-2 px-3 rounded-lg text-lg cursor-pointer transition-all duration-200 text-gray-600 
              ${viewMode === 'table' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-transparent hover:bg-gray-300'}`
            }
            onClick={() => onViewModeChange('table')}
            title="Table View"
          >
            ☰
          </button>
        </div>
      </div>
    </div>
  );
}

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
  getAvailableStock
}) => {
  const placeholderImage = "https://via.placeholder.com/150?text=No+Image";
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
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

  // 🆕 FIXED: จัดการการเปลี่ยนแปลงของ Input field (ขณะพิมพ์)
  const handleInputChange = (productId, e) => {
    const value = e.target.value;
    
    const currentItem = cartItems.find(i => i.product._id === productId);
    if (!currentItem) return;

    if (value === '') {
        // หากช่องว่าง ให้ส่งค่าที่เป็นการเปลี่ยนแปลงไปยัง 0 ชั่วคราว เพื่อแสดงใน UI
        onUpdateQuantity(productId, 0, true); // ส่ง `isTyping: true`
    } else {
        const newQuantity = parseInt(value, 10);
        if (isNaN(newQuantity) || newQuantity < 0) return; // ไม่ทำอะไรถ้าไม่ใช่ตัวเลขหรือติดลบ

        // คำนวณความแตกต่าง (change) จากค่าเดิมเพื่อส่งไปยัง Logic หลัก
        const change = newQuantity - currentItem.quantity;
        
        // ส่งค่าใหม่ (change) ไปให้ SalesPage จัดการ
        onUpdateQuantity(productId, change, true); // ส่ง `isTyping: true`
    }
  };

  // 🆕 FIXED: จัดการเมื่อ Focus หลุด (ตรวจสอบ/ปรับแก้ค่าสุดท้าย)
  const handleInputBlur = (productId) => {
    const item = cartItems.find(i => i.product._id === productId);
    if (!item) return;

    const currentQuantity = item.quantity;
    const availableStock = getAvailableStock(item.product);
    
    if (currentQuantity < 1) {
        // ถ้าค่าเป็น 0 หรือว่างเปล่าหลังจากที่พิมพ์เสร็จแล้ว
        if (availableStock > 0) {
            // ปรับกลับไปที่ 1 (ถ้ามีสต็อกเหลือ)
            const change = 1 - currentQuantity;
            onUpdateQuantity(productId, change); 
        } else {
            // ลบสินค้าออกถ้าไม่มีสต็อกและผู้ใช้ต้องการลบหมด
            onRemoveItem(productId);
        }
    } else if (currentQuantity > availableStock) {
        // ถ้าจำนวนเกินสต็อก ให้ปรับเป็นจำนวนสต็อกสูงสุด
        const change = availableStock - currentQuantity;
        onUpdateQuantity(productId, change); 
    } else {
         // ถ้าค่าถูกต้องและไม่ได้อยู่ในสถานะ typing ให้ปรับสถานะ isTyping เป็น false
         onUpdateQuantity(productId, 0); // ส่ง change = 0 เพื่ออัพเดท isTyping: false
    }
    // หากค่าถูกต้อง (1-availableStock) และไม่มีการเปลี่ยนแปลง quantity ไม่ต้องทำอะไร
  };

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
            
            // ใช้ค่า Quantity ที่ถูกต้อง ถ้าไม่ได้อยู่ในโหมด Typing
            const displayQuantity = item.isTyping && item.quantity === 0 ? '' : item.quantity;

            return (
              <div key={item.product._id} className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm transition-shadow duration-200 hover:shadow-md">
                <div className="w-10 h-10 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.product.image ? (
                    <img 
                      src={`http://localhost:3000/uploads/${item.product.image}`}
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
                      onClick={() => onUpdateQuantity(item.product._id, -1)}
                      disabled={isLoading || item.quantity <= 1}
                    >
                      -
                    </button>
                    
                    {/* Input Field พร้อม Logic แก้บั๊ก */}
                    <input 
                        type="number"
                        min="0" // อนุญาตให้ input เป็น 0 ชั่วคราว แต่จะถูกปรับเป็น 1 ใน onBlur
                        max={availableStock}
                        value={displayQuantity}
                        onChange={(e) => handleInputChange(item.product._id, e)}
                        onBlur={() => handleInputBlur(item.product._id)}
                        className="w-8 text-sm font-semibold text-center border-none bg-transparent focus:outline-none focus:ring-0 p-0 m-0"
                        disabled={isLoading}
                    />
                    
                    <button 
                      className="w-6 h-6 rounded-r-lg bg-gray-100 text-gray-700 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => onUpdateQuantity(item.product._id, 1)}
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

// ====================================================================
// --- 6. Main Sales Page Component (Logic from SalesView) ---
// ====================================================================

const SalesPage = ({ navigateTo }) => {
    // --- State and Handlers from SalesView Logic ---
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [checkoutMessage, setCheckoutMessage] = useState(null); 
    const [activeItem, setActiveItem] = useState('home');
    const [viewMode, setViewMode] = useState('grid');
    
    // 💡 Categories List
    const allCategories = useMemo(() => {
        const productCategories = products.map(p => p.category).filter(Boolean);
        return ['All', ...new Set(productCategories)];
    }, [products]);

    // 1. ฟังก์ชันดึงข้อมูลสินค้า (Fetch Products)
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3000/api/products');
            const result = await response.json();
            
            if (response.ok) {
                setProducts(result.data.map(p => ({
                  ...p,
                  // Ensure price is a number for calculation
                  price: parseFloat(p.price) 
                })));
            } else {
                setError('Failed to fetch products: ' + result.error); 
            }
        } catch (err) {
            setError('Network error or server is down.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // 🚀 FIXED LOGIC 1: Stock คงเหลือที่พร้อมขาย
    const getAvailableStock = useCallback((product) => {
        const totalRemainingStock = (product.stock || 0) - (product.sold_count || 0);
        return Math.max(0, totalRemainingStock); 
    }, []);

    // 🚩 FIXED LOGIC 2: Logic การเพิ่มสินค้าลงตะกร้า (addToCart)
    const addToCart = useCallback((product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product._id === product._id);
            
            const totalAvailableStock = getAvailableStock(product);
            const quantityInCart = existingItem ? existingItem.quantity : 0;
            
            if (quantityInCart + 1 > totalAvailableStock) {
                 console.warn(`Cannot add more: ${product.product_name} is out of stock (Max: ${totalAvailableStock}).`);
                 // Display a temporary message to the user
                 setCheckoutMessage(`⚠ ${product.product_name}: เหลือเพียง ${totalAvailableStock} ชิ้นเท่านั้น`);
                 setTimeout(() => setCheckoutMessage(null), 2000);
                 return prevCart;
            }

            if (existingItem) {
                return prevCart.map(item => 
                    item.product._id === product._id 
                        ? { ...item, quantity: item.quantity + 1, isTyping: false }
                        : item
                );
            } else {
                return [...prevCart, { product, quantity: 1, isTyping: false }];
            }
        });
    }, [getAvailableStock]);

    // 🆕 FIXED: อัปเดตจำนวนสินค้า (รองรับการตั้งค่าใหม่ชั่วคราวขณะพิมพ์)
    const updateQuantity = useCallback((productId, change, isTyping = false) => {
        setCart(prevCart => {
            return prevCart.flatMap(item => {
                if (item.product._id === productId) {
                    const totalAvailableStock = getAvailableStock(item.product);
                    let newQuantity = item.quantity + change;
                    
                    if (isTyping) {
                        if (newQuantity < 0) newQuantity = 0; 
                        
                        if (newQuantity > totalAvailableStock) {
                            newQuantity = totalAvailableStock;
                            setCheckoutMessage(`⚠ ${item.product.product_name}: สต็อกสูงสุดคือ ${totalAvailableStock} ชิ้น`);
                            setTimeout(() => setCheckoutMessage(null), 2000);
                        }
                        return [{ ...item, quantity: newQuantity, isTyping: true }];
                    }

                    if (change === 0) {
                        return [{ ...item, quantity: item.quantity, isTyping: false }];
                    }

                    if (newQuantity <= 0) {
                        return []; // ลบออกจากตะกร้า
                    }
                    
                    if (newQuantity > totalAvailableStock) {
                        setCheckoutMessage(`⚠ ${item.product.product_name}: เหลือเพียง ${totalAvailableStock} ชิ้นเท่านั้น`);
                        setTimeout(() => setCheckoutMessage(null), 2000);
                        newQuantity = totalAvailableStock; 
                    }
                    
                    return [{ ...item, quantity: newQuantity, isTyping: false }];
                }
                return [item];
            });
        });
    }, [getAvailableStock]);
    
    // 🆕 NEW FUNCTION 4: ฟังก์ชันเติม Stock (อัปเดต State ชั่วคราวเท่านั้น)
    const refillStock = useCallback(async (productId, amount) => {
        try {
            const res = await fetch(
                `http://localhost:3000/api/products/restock/${productId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount })
                }
            );

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'เติม Stock ไม่สำเร็จ');
            }

            // อัปเดต product ใน state ด้วยข้อมูลล่าสุดจาก DB
            setProducts(prev =>
                prev.map(p =>
                    p._id === productId ? result.data : p
                )
            );

            setCheckoutMessage(`✅ ${result.message}`);
            setTimeout(() => setCheckoutMessage(null), 2000);

        } catch (err) {
            setCheckoutMessage(`❌ ${err.message}`);
            setTimeout(() => setCheckoutMessage(null), 3000);
        }
    }, []);



    // 🆕 NEW FUNCTION 2: ลบสินค้าออกทั้งหมด (ลบออกจาก Product List ใน State ชั่วคราว)
    const removeAllOfProduct = useCallback(async (productId) => {
        try {
            const res = await fetch(
                `http://localhost:3000/api/products/permanent/${productId}`,
                { method: 'DELETE' }
            );

            if (!res.ok && res.status !== 204) {
                const result = await res.json();
                throw new Error(result.error || 'ลบสินค้าไม่สำเร็จ');
            }

            // ลบออกจาก UI หลังจาก DB ลบสำเร็จ
            setProducts(prev => prev.filter(p => p._id !== productId));
            setCart(prev => prev.filter(item => item.product._id !== productId));

            setCheckoutMessage('🗑️ สินค้าถูกลบถาวรแล้ว');
            setTimeout(() => setCheckoutMessage(null), 2000);

        } catch (err) {
            setCheckoutMessage(`❌ ${err.message}`);
            setTimeout(() => setCheckoutMessage(null), 3000);
        }
    }, []);


    // 🆕 NEW FUNCTION 3: ลบสินค้าทั้งหมดในตะกร้า (Clear Cart)
    const clearCart = useCallback(() => {
        setCart([]);
        setCheckoutMessage('ตะกร้าสินค้าถูกล้างแล้ว');
        setTimeout(() => setCheckoutMessage(null), 2000);
    }, []);


    // 🚀 FIXED LOGIC 3: ฟังก์ชันจัดการ Checkout
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        setCheckoutMessage(null);

        const orderData = cart.map(item => ({
            productId: item.product._id,
            quantity: item.quantity,
        }));

        try {
            const response = await fetch('http://localhost:3000/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: orderData, totalAmount: total.toFixed(2) }),
            });

            if (response.ok) {
                setCheckoutMessage(`✅ การขายสำเร็จ! (ยอดรวม: ${total.toFixed(2)} THB)`);
                setCart([]);
                await fetchProducts();
            } else {
                const errorResult = await response.json();
                setCheckoutMessage(`❌ การขายไม่สำเร็จ: ${errorResult.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์'}`);
            }

        } catch (error) {
            setCheckoutMessage('❌ Network Error: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อทำรายการได้');
        } finally {
            setLoading(false);
            setTimeout(() => setCheckoutMessage(null), 5000);
        }
    };
    // -------------------------------------------------------------
    
    // --- Cart Calculations (useMemo for performance) ---
    const { subtotal, discount, serviceCharge, tax, total } = useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
        const disc = 0; 
        const serv = 0; 
        const tx = sub * 0.07;
        const tot = sub - disc + serv + tx;
        return { subtotal: sub, discount: disc, serviceCharge: serv, tax: tx, total: tot };
    }, [cart]);


    // --- Product Filtering (useMemo for performance) ---
    const filteredProducts = useMemo(() => {
        let result = products;

        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            result = result.filter(p => 
                p.product_name.toLowerCase().includes(lowerCaseSearch) ||
                p.category.toLowerCase().includes(lowerCaseSearch) ||
                p._id.includes(lowerCaseSearch)
            );
        }

        return result;
    }, [products, selectedCategory, searchTerm]);
    
    // --- Render Main UI ---
    return (
        <div className="flex">
            <Sidebar 
                activeItem={activeItem} 
                onNavigate={setActiveItem} 
            />

            <div className="flex-1 min-h-screen bg-white ml-[80px] p-10 pr-[300px]">
                <Header 
                    searchQuery={searchTerm}
                    onSearchChange={setSearchTerm}
                    categories={allCategories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    onAddProduct={() => navigateTo('add_product')}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                <ProductGrid 
                    products={filteredProducts}
                    onAddToCart={addToCart}
                    isLoading={loading}
                    viewMode={viewMode}
                    getAvailableStock={getAvailableStock}
                    cartItems={cart}
                    onRemoveAll={removeAllOfProduct}
                    onRefillStock={refillStock} // 🆕 ส่งฟังก์ชันเติม Stock
                    navigateTo={navigateTo}
                />
            </div>

            <Cart 
                cartItems={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={(productId) => updateQuantity(productId, -cart.find(i => i.product._id === productId).quantity)}
                onCheckout={handleCheckout}
                subtotal={subtotal}
                tax={tax}
                serviceCharge={serviceCharge}
                discount={discount}
                total={total}
                isLoading={loading}
                checkoutMessage={checkoutMessage}
                clearCart={clearCart}
                getAvailableStock={getAvailableStock}
            />

        </div>
    );
}

export default SalesPage;