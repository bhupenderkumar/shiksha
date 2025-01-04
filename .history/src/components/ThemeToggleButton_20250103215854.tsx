import React from 'react';
import { useTheme } from './providers/theme-provider';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggleButton: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100"
    >
      {theme === 'light' ? <Moon className="w-5 h-5 mr-3" /> : <Sun className="w-5 h-5 mr-3" />}
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </button>
