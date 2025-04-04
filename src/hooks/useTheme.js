import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        handleThemeChange(e.newValue || "light");
      }
    };

    // Set initial theme
    document.documentElement.classList.toggle('dark', theme === 'dark');

    // Listen for theme changes from other tabs/windows
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [handleThemeChange]);

  // Memoized theme classes
  const themeClasses = {
    section: `min-h-screen bg-gradient-to-b ${
      theme === "light" ? "from-primary-50 to-primary-100" : "from-slate-900 to-slate-800"
    } flex flex-col justify-start px-4 sm:px-6 md:px-5 py-12 relative overflow-hidden`,
    heading: `text-2xl md:text-3xl font-bold ${
      theme === "light" ? "text-gray-900" : "text-white"
    }`,
    text: `${theme === "light" ? "text-gray-700" : "text-gray-300"}`,
    background: `${theme === "light" ? "bg-white/90" : "bg-slate-800/90"}`
  };

  return {
    theme,
    setTheme: handleThemeChange,
    themeClasses
  };
}; 