import React from 'react';

const Sidebar = ({ activeItem, onNavigate }) => {
  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'analytics', icon: '📊', label: 'Analytics' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  const handleItemClick = (id) => {
    if (id === 'settings') {
      onNavigate('settings');
    } else {
      onNavigate(id);
    }
  };

  return (
    <div className="fixed left-0 top-0 w-[80px] h-screen bg-gray-100 flex flex-col items-center pt-5 pb-5 space-y-5 shadow-lg z-20">
      {menuItems.map(item => (
        <div 
          key={item.id}
          className={`w-[50px] h-[50px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 
            ${activeItem === item.id ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-200 hover:scale-110 active:scale-95'}`
          }
          onClick={() => handleItemClick(item.id)}
          title={item.label}
        >
          <span className="text-2xl">{item.icon}</span>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;