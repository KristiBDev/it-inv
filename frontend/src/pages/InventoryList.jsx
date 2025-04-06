import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import ItemList from '../components/ItemList';

const InventoryList = () => {
  const [refresh, setRefresh] = useState(false);
  const { isNightMode } = useTheme();

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold tracking-wide">Inventory List</h1>
        <ThemeToggle />
      </div>
      
      <div className="mb-6">
        <p className="text-secondary">
          View, search, filter, and manage all inventory items. Use the search box to find items by name or ID, 
          and filter by department using the dropdown menu.
        </p>
      </div>
      
      <ItemList refreshTrigger={refresh} />
    </div>
  );
};

export default InventoryList;
