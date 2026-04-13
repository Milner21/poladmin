import { Moon, Sun } from "lucide-react";
import { useContext, type FC } from "react";
import { ThemeContext } from "@context/ThemeContext";

const ThemeToggleSwitch: FC = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="fixed right-4 bottom-4 z-1000">
      <button
        onClick={toggleTheme}
        className={`
          relative w-14 h-7 rounded-full transition-colors duration-300
          flex items-center px-1
          ${darkMode ? "bg-primary" : "bg-gray-300"}
        `}
        title="Cambiar tema"
      >
        {/* Knob */}
        <span className={`
          absolute w-5 h-5 rounded-full bg-white shadow-md
          flex items-center justify-center
          transition-transform duration-300
          ${darkMode ? "translate-x-7" : "translate-x-0"}
        `}>
          {darkMode 
            ? <Sun size={12} className="text-primary" /> 
            : <Moon size={12} className="text-gray-500" />
          }
        </span>
      </button>
    </div>
  );
};

export default ThemeToggleSwitch;