// src/components/CTable/CTable.types.ts
import type { ReactNode } from "react";

export interface FilterOption {
  text: string;
  value: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface TagConfig<T> {
  key: keyof T;
   render: (value: T[keyof T], record: T) => { text: string; color: string }; 
}

export interface ColumnDef<T> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (record: T, index: number) => ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sorter?: (a: T, b: T) => number;
  filterable?: boolean;
  filters?: FilterOption[];
  onFilter?: (value: string, record: T) => boolean;
  ellipsis?: boolean;
  searchable?: boolean;
  tag?: TagConfig<T>; // <-- Nuevo: configuración de tag
}

export interface TableState {
  sortColumn: string | null;
  sortDirection: SortDirection;
  filterColumn: string | null;
  selectedFilters: Record<string, string[]>;
}

export interface CTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  title?: string;
  subTitle?: string;
  rowKey: keyof T | ((record: T) => string);
  containerHeight?: number;
  defaultSortColumn?: string;
  defaultSortDirection?: SortDirection;
  onRowDoubleClick?: (record: T) => void;
  searchable?: boolean;
  searchColumn?: keyof T;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  pagination: boolean;
  defaultPageSize: number;
}
export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showTotal?: boolean;
}