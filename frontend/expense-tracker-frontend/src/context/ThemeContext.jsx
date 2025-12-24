import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleDark = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
};