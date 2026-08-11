import { createContext } from 'react';

export type ColorTheme = 'green' | 'red' | 'blue' | 'orange';
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  color: ColorTheme;
  mode: ThemeMode;
}

interface ThemeContextType {
  theme: ThemeConfig;
  setColorTheme: (color: ColorTheme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  // Para compatibilidad con código existente
  darkMode: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: { color: 'green', mode: 'light' },
  setColorTheme: () => {},
  setThemeMode: () => {},
  toggleMode: () => {},
  darkMode: false,
  toggleTheme: () => {},
});