import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div 
        className={`transition-all duration-300 w-full ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <main className="w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
