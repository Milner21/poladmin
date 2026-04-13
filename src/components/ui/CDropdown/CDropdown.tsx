import { useEffect, useRef, useState, type FC, type ReactNode } from 'react';

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick?: () => void;
  type?: 'divider';
}

interface CDropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const CDropdown: FC<CDropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const placementClasses = {
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
  };

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

  const handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute ${placementClasses[placement]}
            bg-bg-content border border-border rounded-lg shadow-lg
            min-w-[180px] py-1 z-50
            animate-in fade-in-0 zoom-in-95 duration-200
          `}
        >
          {items.map((item) => {
            if (item.type === 'divider') {
              return (
                <hr key={item.key} className="my-1 border-border" />
              );
            }

            return (
              <button
                key={item.key}
                onClick={() => handleItemClick(item)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 text-left text-sm
                  transition-colors
                  ${item.danger 
                    ? 'text-danger hover:bg-danger/10' 
                    : 'text-text-primary hover:bg-bg-base'
                  }
                `}
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};