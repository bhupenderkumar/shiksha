import React from 'react';
import { useTheme } from './theme-provider';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';

export const ThemeToggleButton: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className="text-default hover:bg-secondary"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
      <span className="ml-2">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
    </Button>
  );
};
