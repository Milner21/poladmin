import { useState, type FC, type ReactNode } from "react";
import { App, ConfigProvider, theme as antdTheme } from "antd";
import ThemeContext, { type ThemeContextType } from "../context/ThemeContext";
import { THEME_COLORS } from "../themes/color";

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const themeConfig = darkMode
    ? antdTheme.darkAlgorithm
    : antdTheme.defaultAlgorithm;

  const contextValue: ThemeContextType = {
    darkMode,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider
        theme={{
          algorithm: themeConfig,
          token: {
            colorPrimary: darkMode
              ? THEME_COLORS.dark.primary
              : THEME_COLORS.light.primary,
            colorBgBase: darkMode
              ? THEME_COLORS.dark.backgoundBase
              : THEME_COLORS.light.backgroundContent,
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
