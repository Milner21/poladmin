import { Palette, Moon, Sun } from "lucide-react";
import { useContext, useState, type FC } from "react";
import { ThemeContext, type ColorTheme } from "@context/ThemeContext";

const COLOR_OPTIONS: { value: ColorTheme; label: string; color: string }[] = [
  { value: 'green', label: 'Verde', color: '#2bd98e' },
  { value: 'red', label: 'Rojo', color: '#ef4444' },
  { value: 'blue', label: 'Azul', color: '#3b82f6' },
  { value: 'orange', label: 'Naranja', color: '#f59e0b' },
];

const CThemeSelector: FC = () => {
  const { theme, setColorTheme, toggleMode, darkMode } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleColorChange = (color: ColorTheme) => {
    setColorTheme(color);
    setIsOpen(false);
  };

  const currentColorOption = COLOR_OPTIONS.find(opt => opt.value === theme.color);

  return (
    <div className="relative">
      {/* Botón principal */}
      <div className="flex items-center gap-2">
        {/* Selector de color */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="
              relative w-10 h-10 rounded-lg
              bg-bg-content hover:bg-bg-hover border border-border
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/50
              flex items-center justify-center
              group
            "
            title="Cambiar color del tema"
          >
            <Palette size={18} className="text-text-secondary group-hover:text-primary" />
            {/* Indicador de color actual */}
            <div 
              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-bg-content"
              style={{ backgroundColor: currentColorOption?.color }}
            />
          </button>

          {/* Dropdown de colores */}
          {isOpen && (
            <>
              {/* Overlay */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Menu */}
              <div className="
                absolute right-0 top-12 z-20
                bg-bg-content border border-border rounded-lg shadow-lg
                p-2 min-w-35
                fade-in
              ">
                {COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleColorChange(option.value)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-md
                      hover:bg-bg-hover transition-colors duration-150
                      ${theme.color === option.value ? 'bg-bg-hover' : ''}
                    `}
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ backgroundColor: option.color }}
                    />
                    <span className="text-sm text-text-primary">
                      {option.label}
                    </span>
                    {theme.color === option.value && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Toggle modo oscuro/claro */}
        <button
          onClick={toggleMode}
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
        </button>
      </div>
    </div>
  );
};

export default CThemeSelector;