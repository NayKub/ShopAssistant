import React from 'react';

// Reusable Sidebar Component for Analytics
export const AnalyticsSidebar = ({ activeItem, onNavigate, navigateTo }) => {
  const menuItems = [
    { 
      id: 'home', 
      icon: '🏠', 
      label: 'Home', 
      action: () => navigateTo('sales')
    },
    { 
      id: 'analytics', 
      icon: '📊', 
      label: 'Analytics', 
      active: true
    },
    { 
      id: 'settings', 
      icon: '⚙️', 
      label: 'Settings'
    }
  ];

  return (
    <div className="fixed left-0 top-0 w-[80px] h-screen bg-gray-100 flex flex-col items-center pt-5 pb-5 space-y-5 shadow-lg z-20">
      {menuItems.map(item => (
        <div 
          key={item.id}
          className={`w-[50px] h-[50px] rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 
            ${item.active ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-200'}`
          }
          onClick={() => {
            if (onNavigate) onNavigate(item.id);
            if (item.action) item.action();
          }}
          title={item.label}
        >
          <span className="text-2xl">{item.icon}</span>
        </div>
      ))}
    </div>
  );
};

// Reusable Stat Card Component
export const StatCard = ({ label, value, unit = '', className = '' }) => (
  <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${className}`}>
    <div className="text-sm text-gray-600 font-medium mb-1">{label}</div>
    <div className="text-2xl font-bold text-gray-800">{value}{unit}</div>
  </div>
);

// Reusable Filter Button Group Component
export const FilterButtonGroup = ({ 
  options, 
  activeOption, 
  onOptionChange, 
  className = '',
  buttonClassName = ''
}) => (
  <div className={`flex gap-2 ${className}`}>
    {options.map(option => (
      <button
        key={option}
        onClick={() => onOptionChange(option)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
          activeOption === option
            ? 'bg-green-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } ${buttonClassName}`}
      >
        {option}
      </button>
    ))}
  </div>
);

// Reusable Input Field Component
export const InfoInputField = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '',
  labelWidth = 'w-32'
}) => (
  <div className="flex items-center gap-4">
    <label className={`text-lg font-medium text-gray-700 ${labelWidth}`}>
      {label} :
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 px-4 py-2 border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent text-lg"
      placeholder={placeholder}
    />
  </div>
);

// Advanced Line Chart Component
export const LineChart = ({ 
  data, 
  color = '#22c55e', 
  className = '',
  title = '',
  height = 'h-80'
}) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxValue = Math.max(...data);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (value / maxValue) * 75; // 75% of height for more padding
    return `${x},${y}`;
  }).join(' ');

  const chartHeight = height === 'h-96' ? 'h-72' : 'h-48';

  return (
    <div className={`relative ${height} ${className}`}>
      {/* Legend - Top Left */}
      {title && (
        <div className="absolute top-4 left-8 flex items-center gap-2 z-10">
          <div className="w-3 h-3 rounded-full" style={{backgroundColor: color}}></div>
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
      )}
      
      <div className={`relative ${chartHeight} mt-12 mx-12`}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Horizontal grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.5"/>
          ))}
          
          {/* Data line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Data points */}
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (value / maxValue) * 75;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-500 -ml-10">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between mt-4 text-sm text-gray-500 mx-12">
        {months.map(month => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </div>
  );
};

// Graph Type Selector Component
export const GraphTypeSelector = ({ 
  options, 
  activeType, 
  onTypeChange, 
  orientation = 'vertical' // 'vertical' or 'horizontal'
}) => (
  <div className={`bg-gray-50 border-2 border-gray-300 rounded-lg p-3 ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} flex gap-2`}>
    <div className="text-sm font-semibold text-gray-700 mb-1">Graph</div>
    {options.map(type => (
      <button
        key={type}
        onClick={() => onTypeChange(type)}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
          activeType === type
            ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
      >
        {type}
      </button>
    ))}
  </div>
);

// Container Components for better layout management
export const AnalyticsContainer = ({ children, className = '' }) => (
  <div className={`flex-1 min-h-screen bg-gray-50 ml-[80px] p-8 ${className}`}>
    {children}
  </div>
);

export const AnalyticsGrid = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 h-full ${className}`}>
    {children}
  </div>
);

export const AnalyticsSection = ({ 
  title, 
  children, 
  className = '', 
  titleClassName = 'text-3xl font-bold text-gray-800 mb-6' 
}) => (
  <div className={`bg-white rounded-[20px] shadow-sm border border-gray-200 p-6 ${className}`}>
    {title && <h2 className={titleClassName}>{title}</h2>}
    {children}
  </div>
);