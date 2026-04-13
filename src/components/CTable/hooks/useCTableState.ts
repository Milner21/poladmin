import { useState } from 'react';
import type { ColumnDef, SortDirection } from '../CTable.types';

export const useCTableState = (
  defaultSortColumn?: string,
  defaultSortDirection: SortDirection = 'desc'
) => {
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    defaultSortColumn ? defaultSortDirection : null
  );
  const [filterColumn, setFilterColumn] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const handleSort = <T,>(column: ColumnDef<T>) => {
    if (!column.sortable) return;

    if (sortColumn === column.key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column.key);
      setSortDirection('asc');
    }
  };

  const handleFilterToggle = (columnKey: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[columnKey] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return { ...prev, [columnKey]: updated };
    });
  };

  const clearFilters = (columnKey: string) => {
    setSelectedFilters(prev => {
      const updated = { ...prev };
      delete updated[columnKey];
      return updated;
    });
  };

  return {
    sortColumn,
    sortDirection,
    filterColumn,
    selectedFilters,
    handleSort,
    handleFilterToggle,
    clearFilters,
    setFilterColumn,
  };
};