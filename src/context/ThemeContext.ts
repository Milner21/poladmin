import { createContext} from 'react';

export type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("toggleDarkMode llamado sin ThemeProvider");
    }
  },
});

export default ThemeContext;