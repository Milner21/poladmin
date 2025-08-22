import { useContext, type FC } from "react";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import ThemeContext from "@context/ThemeContext";

// Imports locales
import {
  FloatingContainer,
  StyledSwitch,
} from "./ThemeToggleSwitch.styles";

const ThemeToggleSwitch: FC = () => {
  const context = useContext(ThemeContext);
  const { darkMode, toggleDarkMode } = context;

  return (
    <FloatingContainer>
      <StyledSwitch
        checked={darkMode}
        onChange={toggleDarkMode}
        checkedChildren={<SunOutlined />}
        unCheckedChildren={<MoonOutlined />}
        size="default"
      />
    </FloatingContainer>
  );
};

export default ThemeToggleSwitch;