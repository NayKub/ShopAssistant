import React from 'react';

const Header = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  onAddProduct,
  viewMode,
  onViewModeChange,
  onManageCategories 
}) => {
  return (
    <div className="mb-8">
      
      {/* Action Buttons: Add Product (First) & Manage Category (Second) */}
      <div className="flex gap-4 mb-6">
        
        <button 
          className="bg-green-600 text-white p-4 rounded-[15px] text-base font-semibold cursor-pointer 
                     flex items-center gap-2 transition-all duration-200 hover:bg-green-700 hover:translate-y-[-1px]" 
          onClick={onAddProduct}
          title="Add New Product"
        >
          <span className="text-lg">🏪</span>
          Add product
        </button>

        <button 
          className="bg-purple-600 text-white p-4 rounded-[15px] text-base font-semibold cursor-pointer 
                     flex items-center gap-2 transition-all duration-200 hover:bg-purple-700 hover:translate-y-[-1px]" 
          onClick={onManageCategories} 
          title="Manage Add and Delete Categories"
        >
          <span className="text-lg">🏷️</span>
          Manage Category
        </button>
        
      </div>
      
      {/* Search Input */}
      <div className="relative mb-5 mr-10">
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
        {/* Category Filter Buttons */}
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
        
        {/* View Mode Buttons */}
        <div className="flex gap-2 bg-gray-200 p-1 rounded-xl mr-12">
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

export default Header;