import { useContext } from 'react';
import ThemeContext, { type ThemeContextType } from '../context/ThemeContext';

const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
};

export default useTheme;