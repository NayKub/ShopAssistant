import React from 'react';
import { useTheme } from '../../context/ThemeContext';

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
  const { isDarkMode } = useTheme();

  return (
    <div className="mb-8">
      <div className="flex gap-4 mb-6">
        <button 
          className="bg-green-600 text-white p-4 rounded-[15px] text-base font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-green-700 hover:translate-y-[-1px]" 
          onClick={onAddProduct}
        >
          <span className="text-lg">🏪</span> Add product
        </button>

        <button 
          className="bg-purple-600 text-white p-4 rounded-[15px] text-base font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-purple-700 hover:translate-y-[-1px]" 
          onClick={onManageCategories} 
        >
          <span className="text-lg">🏷️</span> Manage Category
        </button>
      </div>
      
      <div className="relative mb-5 mr-10">
        <input 
          type="text" 
          placeholder="Search products..." 
          className={`w-full p-5 pl-6 pr-16 border-none rounded-full text-lg outline-none transition-colors duration-200 ${isDarkMode ? 'bg-gray-800 text-white focus:bg-gray-700' : 'bg-gray-200 text-gray-800 focus:bg-gray-300'}`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl">🔍</span>
      </div>
      
      <div className="flex justify-between items-center mb-6 gap-5 flex-wrap">
        <div className="flex gap-4 flex-wrap flex-1">
          {categories.map(category => (
            <button
              key={category}
              className={`py-3 px-7 rounded-full text-base font-medium cursor-pointer transition-all duration-200 whitespace-nowrap 
                ${selectedCategory === category 
                  ? 'bg-blue-500 text-white' 
                  : (isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400')}`
              }
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className={`flex gap-2 p-1 rounded-xl mr-12 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          {['grid', 'table'].map((mode) => (
            <button
              key={mode}
              className={`py-2 px-3 rounded-lg text-lg cursor-pointer transition-all duration-200 ${viewMode === mode ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-300/20'}`}
              onClick={() => onViewModeChange(mode)}
            >
              {mode === 'grid' ? '⊞' : '☰'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Header;