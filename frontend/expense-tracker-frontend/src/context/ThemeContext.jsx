import React, { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {

    const savedTheme = localStorage.getItem("theme");
    return savedTheme !== null ? savedTheme === "true" : true;
  });

  const toggleDark = () => {
    setIsDark((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", String(newTheme));
      return newTheme;
    });
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark }}>
   
      <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;