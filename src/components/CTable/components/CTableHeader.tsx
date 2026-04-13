//src/components/CTable/components/CTableHeader.tsx

import type { ColumnDef, SortDirection } from '../CTable.types';
import { CTableSortIcon } from './CTableSortIcon';
import { CTableFilterDropdown } from './CTableFilterDropdown';

interface TableHeaderProps<T> {
  columns: ColumnDef<T>[];
  sortColumn: string | null;
  sortDirection: SortDirection;
  filterColumn: string | null;
  selectedFilters: Record<string, string[]>;
  isMobile: boolean;
  onSort: (column: ColumnDef<T>) => void;
  onFilterToggle: (columnKey: string, value: string) => void;
  onClearFilters: (columnKey: string) => void;
  onFilterColumnChange: (columnKey: string | null) => void;
}

export function CTableHeader<T>({
  columns,
  sortColumn,
  sortDirection,
  filterColumn,
  selectedFilters,
  isMobile,
  onSort,
  onFilterToggle,
  onClearFilters,
  onFilterColumnChange,
}: TableHeaderProps<T>) {
  return (
    <thead className="sticky top-0 bg-bg-title z-10">
      <tr>
        {columns.map(column => (
          <th
            key={column.key}
            style={{ width: column.width }}
            className={`
              px-2 py-2.5 border-b-2 border-border
              font-semibold text-text-primary whitespace-nowrap
              ${isMobile ? 'text-xs px-1 py-1.5' : 'text-sm'}
              ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
              ${column.sortable || column.filterable ? 'cursor-pointer' : ''}
            `}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                onClick={() => column.sortable && onSort(column)}
                className="flex items-center gap-1"
              >
                {column.title}
                {column.sortable && (
                  <CTableSortIcon
                    isActive={sortColumn === column.key}
                    direction={sortColumn === column.key ? sortDirection : null}
                    isMobile={isMobile}
                  />
                )}
              </span>

              {column.filterable && column.filters && (
                <CTableFilterDropdown
                  column={column}
                  isOpen={filterColumn === column.key}
                  selectedFilters={selectedFilters[column.key] || []}
                  isMobile={isMobile}
                  onToggle={() => onFilterColumnChange(filterColumn === column.key ? null : column.key)}
                  onFilterToggle={(value) => onFilterToggle(column.key, value)}
                  onClear={() => onClearFilters(column.key)}
                />
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}