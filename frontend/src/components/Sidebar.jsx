import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AiOutlineDashboard, AiOutlineUnorderedList, AiOutlinePlus, AiOutlineBell, AiOutlineClockCircle } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa'; // Add this import for the activity icon
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const { isNightMode } = useTheme();
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <AiOutlineDashboard /> },
    { path: '/inventory', label: 'Inventory List', icon: <AiOutlineUnorderedList /> },
    { path: '/items/create', label: 'Add Item', icon: <AiOutlinePlus /> },
    { path: '/reminders', label: 'Reminders', icon: <AiOutlineBell /> },
    { path: '/activity', label: 'Activity Log', icon: <FaHistory /> }
  ];

  return (
    <div className={`sidebar transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} h-screen fixed top-0 left-0 overflow-y-auto`}>
      <div className="p-4 flex items-center justify-between">
        {!collapsed && <h2 className="text-xl font-bold">IT Inventory</h2>}
        <button 
          onClick={toggleSidebar} 
          className="app-btn app-btn-secondary p-1"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className="mt-8">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({isActive}) => `
              flex items-center px-4 py-3 transition-colors
              ${isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
              ${collapsed ? 'justify-center' : 'gap-3'}
            `}
          >
            <span className="text-xl">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
