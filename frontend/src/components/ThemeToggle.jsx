import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeToggle = () => {
  const { isNightMode, toggleNightMode } = useTheme();

  return (
    <div className="flex items-center">
      <span className="mr-2 text-lg font-medium">
        {isNightMode ? <FaMoon className="text-yellow-300" /> : <FaSun className="text-yellow-500" />}
      </span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isNightMode}
          onChange={toggleNightMode}
          className="toggle-checkbox"
        />
        <span className="sr-only">Dark Mode</span>
      </label>
    </div>
  );
};

export default ThemeToggle;
