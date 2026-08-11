import { useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type ThemeConfig, type ColorTheme, type ThemeMode } from '@context/ThemeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

const DEFAULT_THEME: ThemeConfig = {
  color: 'green',
  mode: 'light'
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      try {
        return JSON.parse(savedTheme);
      } catch {
        // Si hay error, usar tema por defecto
      }
    }

    // Compatibilidad: si existe darkMode previo, migrar
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode);
      localStorage.removeItem('darkMode'); // Limpiar valor anterior
      return {
        color: 'green',
        mode: isDark ? 'dark' : 'light'
      };
    }

    return DEFAULT_THEME;
  });

  // Aplicar tema al DOM
  useEffect(() => {
    const themeAttr = `${theme.mode}-${theme.color}`;
    document.documentElement.setAttribute('data-theme', themeAttr);
    localStorage.setItem('app-theme', JSON.stringify(theme));
  }, [theme]);

  const setColorTheme = (color: ColorTheme) => {
    setTheme(prev => ({ ...prev, color }));
  };

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(prev => ({ ...prev, mode }));
  };

  const toggleMode = () => {
    setTheme(prev => ({ 
      ...prev, 
      mode: prev.mode === 'light' ? 'dark' : 'light' 
    }));
  };

  // Compatibilidad con código existente
  const darkMode = theme.mode === 'dark';
  const toggleTheme = toggleMode;

  return (
    <ThemeContext.Provider value={{
      theme,
      setColorTheme,
      setThemeMode,
      toggleMode,
      darkMode,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};