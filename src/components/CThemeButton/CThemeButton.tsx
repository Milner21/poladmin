import { Moon, Sun } from "lucide-react";
import { useContext, type FC } from "react";
import { ThemeContext } from "@context/ThemeContext";

const CThemeButton: FC = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="
        relative w-12 h-6 rounded-full
        bg-bg-base hover:bg-bg-hover border border-border
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary/50
        flex items-center shrink-0
        group
      "
      title={darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
    >
      {/* Track background */}
      <div className={`
        absolute inset-0.5 rounded-full transition-colors duration-200
        ${darkMode ? 'bg-slate-700' : 'bg-amber-100'}
      `} />
      
      {/* Slider */}
      <div className={`
        relative w-5 h-5 rounded-full 
        bg-bg-content border border-border shadow-sm
        transition-all duration-200 z-10
        flex items-center justify-center
        ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}
        group-hover:shadow-md
      `}>
        {/* Iconos con animación */}
        <Sun 
          size={10} 
          className={`
            absolute transition-all duration-200
            ${darkMode 
              ? 'scale-0 opacity-0 rotate-90' 
              : 'scale-100 opacity-100 rotate-0'
            }
            text-amber-500
          `} 
        />
        
        <Moon 
          size={10} 
          className={`
            absolute transition-all duration-200
            ${!darkMode 
              ? 'scale-0 opacity-0 -rotate-90' 
              : 'scale-100 opacity-100 rotate-0'
            }
            text-slate-400
          `} 
        />
      </div>

      {/* Indicadores de fondo (opcional) */}
      <Sun 
        size={8} 
        className={`
          absolute left-1 top-1/2 -translate-y-1/2 z-0
          transition-opacity duration-200
          ${darkMode ? 'opacity-30' : 'opacity-60'}
          text-amber-400
        `} 
      />
      
      <Moon 
        size={8} 
        className={`
          absolute right-1 top-1/2 -translate-y-1/2 z-0
          transition-opacity duration-200
          ${!darkMode ? 'opacity-30' : 'opacity-60'}
          text-slate-400
        `} 
      />
    </button>
  );
};

export default CThemeButton;