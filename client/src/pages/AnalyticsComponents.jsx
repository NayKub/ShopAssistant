import React from 'react';
export const AnalyticsSidebar = ({ activeItem, onNavigate, navigateTo }) => {
  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Home', action: () => navigateTo('sales') },
    { id: 'analytics', icon: '📊', label: 'Analytics', active: true },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <div className="fixed left-0 top-0 w-[80px] h-screen bg-gray-100 dark:bg-[#121212] flex flex-col items-center pt-5 pb-5 space-y-5 shadow-lg z-20 border-r border-gray-200 dark:border-gray-800 transition-colors duration-300">
      {menuItems.map(item => (
        <div
          key={item.id}
          className={`w-[50px] h-[50px] rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200
            ${item.active
              ? 'bg-blue-500 text-white shadow-md'
              : 'hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
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

export const StatCard = ({ label, value, unit = '', className = '', isDarkMode = false }) => (
  <div className={`p-4 rounded-lg shadow-sm border transition-colors duration-300
    ${isDarkMode
      ? 'bg-[#1e1e1e] border-gray-800 text-white'
      : 'bg-white border-gray-200 text-gray-800'
    } ${className}`}>
    <div className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{value}{unit}</div>
  </div>
);

export const FilterButtonGroup = ({ options, activeOption, onOptionChange, disabledOptions = [], isDarkMode = false }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(option => {
        const isDisabled = disabledOptions.includes(option);
        return (
          <button
            key={option}
            disabled={isDisabled}
            onClick={() => !isDisabled && onOptionChange(option)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
              ${activeOption === option
                ? 'bg-green-600 text-white'
                : isDarkMode
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
              ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
            `}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export const InfoInputField = ({ label, value, onChange, type = 'text', placeholder = '', labelWidth = 'w-32', isDarkMode = false }) => (
  <div className="flex items-center gap-4">
    <label className={`text-lg font-medium ${labelWidth} ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      {label} :
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`flex-1 px-4 py-2 border-b-2 outline-none bg-transparent text-lg transition-colors duration-300
        ${isDarkMode
          ? 'border-gray-700 focus:border-blue-400 text-white placeholder-gray-600'
          : 'border-gray-300 focus:border-blue-500 text-gray-800'
        }`}
      placeholder={placeholder}
    />
  </div>
);

export const LineChart = ({ data, color = '#22c55e', className = '', title = '', height = 'h-80', isDarkMode = false }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const maxValue = Math.max(...data, 1);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (value / maxValue) * 75;
    return `${x},${y}`;
  }).join(' ');

  const chartHeight = height === 'h-96' ? 'h-72' : 'h-48';

  return (
    <div className={`relative ${height} ${className}`}>
      {title && (
        <div className="absolute top-4 left-8 flex items-center gap-2 z-10">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{title}</span>
        </div>
      )}
      <div className={`relative ${chartHeight} mt-12 mx-12`}>
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[0, 25, 50, 75, 100].map(y => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke={isDarkMode ? '#374151' : '#e5e7eb'} strokeWidth="0.5" />
          ))}
          <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          {data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (value / maxValue) * 75;
            return <circle key={index} cx={x} cy={y} r="4" fill={color} vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
        <div className={`absolute left-0 top-0 h-full flex flex-col justify-between text-sm -ml-10 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
      </div>
      <div className={`flex justify-between mt-4 text-sm mx-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
        {months.map(month => <span key={month}>{month}</span>)}
      </div>
    </div>
  );
};

export const GraphTypeSelector = ({ options, activeType, onTypeChange, orientation = 'vertical', isDarkMode = false }) => (
  <div className={`border rounded-lg p-3 flex gap-2 transition-colors duration-300
    ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}
    ${isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
    <div className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>Graph</div>
    {options.map(type => (
      <button
        key={type}
        onClick={() => onTypeChange(type)}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200
          ${activeType === type
            ? isDarkMode
              ? 'bg-gray-700 text-white shadow-sm'
              : 'bg-white text-gray-800 shadow-sm border border-gray-200'
            : isDarkMode
              ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
          }`}
      >
        {type}
      </button>
    ))}
  </div>
);

export const AnalyticsContainer = ({ children, className = '', isDarkMode = false }) => (
  <div className={`flex-1 min-h-screen ml-[80px] p-8 transition-colors duration-300
    ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-800'} ${className}`}>
    {children}
  </div>
);

export const AnalyticsGrid = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 h-full ${className}`}>
    {children}
  </div>
);

export const AnalyticsSection = ({ title, children, className = '', titleClassName = '', isDarkMode = false }) => (
  <div className={`rounded-[20px] shadow-sm border p-6 transition-colors duration-300
    ${isDarkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'} ${className}`}>
    {title && (
      <h2 className={`text-3xl font-bold mb-6 ${titleClassName || (isDarkMode ? 'text-white' : 'text-gray-800')}`}>
        {title}
      </h2>
    )}
    {children}
  </div>
);