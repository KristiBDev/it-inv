import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Initialize state from localStorage or default to false (light mode)
  const [isNightMode, setIsNightMode] = useState(() => {
    const savedTheme = localStorage.getItem('isNightMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Update body class and localStorage whenever isNightMode changes
  useEffect(() => {
    // Update localStorage
    localStorage.setItem('isNightMode', JSON.stringify(isNightMode));
    
    // Update HTML element for CSS variables
    document.documentElement.setAttribute('data-theme', isNightMode ? 'dark' : 'light');
    
    // Keep body class for backwards compatibility
    document.body.classList.toggle('dark-mode', isNightMode);
  }, [isNightMode]);

  const toggleNightMode = () => {
    setIsNightMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isNightMode, toggleNightMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
