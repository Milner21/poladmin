import { useMemo } from "react";
import type { ColumnDef, SortDirection } from "../CTable.types";

export const useCTableData = <T>(
  data: T[],
  columns: ColumnDef<T>[],
  sortColumn: string | null,
  sortDirection: SortDirection,
  selectedFilters: Record<string, string[]>
) => {
  return useMemo(() => {
    let result = [...data];

    // Aplicar filtros
    Object.entries(selectedFilters).forEach(([columnKey, values]) => {
      if (values.length > 0) {
        const column = columns.find((col) => col.key === columnKey);
        if (column?.onFilter) {
          result = result.filter((record) =>
            values.some((value) => column.onFilter!(value, record))
          );
        }
      }
    });

    // Aplicar ordenamiento
    if (sortColumn && sortDirection) {
      const column = columns.find((col) => col.key === sortColumn);

      if (column) {
        result.sort((a, b) => {
          // Si existe un sorter personalizado, usarlo
          if (column.sorter) {
            const comparison = column.sorter(a, b);
            return sortDirection === "asc" ? comparison : -comparison;
          }

          // Ordenamiento por defecto usando dataIndex
          if (column.dataIndex) {
            const aValue = a[column.dataIndex];
            const bValue = b[column.dataIndex];

            // Manejar null/undefined
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            // Comparar números
            if (typeof aValue === "number" && typeof bValue === "number") {
              return sortDirection === "asc"
                ? aValue - bValue
                : bValue - aValue;
            }

            // Comparar strings (case-insensitive)
            const aStr = String(aValue).toLowerCase();
            const bStr = String(bValue).toLowerCase();

            if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
            if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
            return 0;
          }

          return 0;
        });
      }
    }

    return result;
  }, [data, sortColumn, sortDirection, selectedFilters, columns]);
};
