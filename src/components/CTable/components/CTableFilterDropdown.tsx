//src/components/CTable/components/CTableFilterDropdown.tsx

import { Filter, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ColumnDef } from '../CTable.types';

interface CTableFilterDropdownProps<T> {
  column: ColumnDef<T>;
  isOpen: boolean;
  selectedFilters: string[];
  isMobile: boolean;
  onToggle: () => void;
  onFilterToggle: (value: string) => void;
  onClear: () => void;
}

export function CTableFilterDropdown<T>({
  column,
  isOpen,
  selectedFilters,
  isMobile,
  onToggle,
  onFilterToggle,
  onClear,
}: CTableFilterDropdownProps<T>) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onToggle();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div ref={dropdownRef} className="relative">
      <Filter
        size={isMobile ? 14 : 16}
        onClick={onToggle}
        className={`
          cursor-pointer transition-all
          ${selectedFilters.length > 0 
            ? 'opacity-100 text-primary' 
            : 'opacity-40 hover:opacity-60'
          }
        `}
      />

      {isOpen && (
        <div className="
          absolute top-full right-0 mt-1
          bg-bg-content border border-border rounded-md shadow-lg
          min-w-37.5 py-2 z-10
        ">
          {/* Header */}
          <div className="flex justify-between items-center px-3 pb-2 mb-2 border-b border-border">
            <span className="text-xs font-semibold text-text-primary">Filtrar</span>
            {selectedFilters.length > 0 && (
              <X
                size={14}
                onClick={onClear}
                className="cursor-pointer text-text-secondary hover:text-text-primary"
              />
            )}
          </div>

          {/* Options */}
          {column.filters?.map(filter => (
            <label 
              key={filter.value} 
              className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-bg-base text-sm text-text-primary"
            >
              <input
                type="checkbox"
                checked={selectedFilters.includes(filter.value)}
                onChange={() => onFilterToggle(filter.value)}
                className="cursor-pointer accent-primary"
              />
              <span>{filter.text}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}