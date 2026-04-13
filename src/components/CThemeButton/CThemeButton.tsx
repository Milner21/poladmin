import { Moon, Sun, SunMoon } from "lucide-react";
import { useContext, useState, useEffect, useRef, type FC } from "react";
import { ThemeContext } from "@context/ThemeContext";
import type { DropdownItem } from "@components/ui";

const CThemeButton: FC = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const menuItems: DropdownItem[] = [
    {
      key: "claro",
      label: "Claro",
      icon: <Sun size={16} />,
      onClick: () => {
        if (darkMode) toggleTheme();
        setIsOpen(false);
      },
    },
    {
      key: "oscuro",
      label: "Oscuro",
      icon: <Moon size={16} />,
      onClick: () => {
        if (!darkMode) toggleTheme();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-10 h-10 rounded-full 
          bg-primary hover:bg-primary-hover active:bg-primary-active
          text-white
          flex items-center justify-center
          transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        "
        title="Tema"
      >
        <SunMoon size={20} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute top-full right-0 mt-2
            bg-bg-content border border-border rounded-lg shadow-lg
            min-w-37.5 py-1 z-50
            animate-in fade-in-0 zoom-in-95 duration-200
          "
        >
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={item.onClick}
              className="
                w-full flex items-center gap-3 px-4 py-2 text-left text-sm
                text-text-primary hover:bg-bg-base
                transition-colors
              "
            >
              {item.icon && <span className="text-lg">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CThemeButton;