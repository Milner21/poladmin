import { useRef, useState } from "react";
import type { CTableProps } from "./CTable.types";
import { useCTableState } from "./hooks/useCTableState";
import { useCTableData } from "./hooks/useCTableData";
import { useCTablePagination } from "./hooks/useCTablePagination";
import { CTableHeader } from "./components/CTableHeader";
import { CTableBody } from "./components/CTableBody";
import { CTablePagination } from "./components/CTablePagination";
import { CSpinner } from "@components/ui";
import { Search } from "lucide-react";

export function CTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  title,
  subTitle,
  rowKey,
  defaultSortColumn,
  defaultSortDirection = "desc",
  onRowDoubleClick,
  searchable = false,
  searchColumn,
  searchValue,
  onSearchChange,
  pagination = true,
  defaultPageSize = 10,
}: CTableProps<T>) {
  const isMobile = window.innerWidth < 768;

  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const {
    sortColumn,
    sortDirection,
    filterColumn,
    selectedFilters,
    handleSort,
    handleFilterToggle,
    clearFilters,
    setFilterColumn,
  } = useCTableState(defaultSortColumn, defaultSortDirection);

  // Filtrado por búsqueda
  const filteredData = data.filter((item) => {
    if (!searchable || !searchValue) return true;

    if (searchColumn) {
      const value = item[searchColumn as keyof T];
      return String(value).toLowerCase().includes(searchValue.toLowerCase());
    } else {
      return Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchValue.toLowerCase())
      );
    }
  });

  const sortedAndFilteredData = useCTableData(
    filteredData,
    columns,
    sortColumn,
    sortDirection,
    selectedFilters
  );

  // Paginación
  const { paginationConfig, paginatedRange, handlePageChange } =
    useCTablePagination(
      sortedAndFilteredData.length,
      pagination,
      defaultPageSize
    );

  // Datos paginados
  const paginatedData = paginationConfig
    ? sortedAndFilteredData.slice(paginatedRange.start, paginatedRange.end)
    : sortedAndFilteredData;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tableWrapperRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tableWrapperRef.current.offsetLeft);
    setStartY(e.pageY - tableWrapperRef.current.offsetTop);
    setScrollLeft(tableWrapperRef.current.scrollLeft);
    setScrollTop(tableWrapperRef.current.scrollTop);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableWrapperRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableWrapperRef.current.offsetLeft;
    const y = e.pageY - tableWrapperRef.current.offsetTop;
    const walkX = (x - startX) * 2;
    const walkY = (y - startY) * 2;
    tableWrapperRef.current.scrollLeft = scrollLeft - walkX;
    tableWrapperRef.current.scrollTop = scrollTop - walkY;
  };

  if (loading) {
    return (
      <div className="h-full w-full p-3 bg-bg-content rounded-lg border border-border shadow-sm flex flex-col overflow-hidden">
        {title && <h3 className="text-lg font-semibold text-text-primary mb-3">{title}</h3>}
        <div className="flex justify-center items-center py-10">
          <CSpinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-3 bg-bg-content rounded-lg border border-border shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          {title && <h3 className="text-lg font-semibold text-text-primary m-0">{title}</h3>}
          {subTitle && <p className="text-sm text-text-tertiary font-bold m-0">{subTitle}</p>}
        </div>
      </div>

      {/* Search */}
      {searchable && (
        <div className="mb-4">
          <div className="relative w-75">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2
                bg-bg-content border border-border rounded-lg
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-primary
              "
            />
          </div>
        </div>
      )}

      {/* Table Wrapper (drag-to-scroll) */}
      <div
        ref={tableWrapperRef}
        className={`
          flex-1 overflow-auto
          ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
          ${isMobile ? 'max-h-87.5' : 'max-h-82.5'}
        `}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <table className="w-full border-collapse text-sm select-none">
          <CTableHeader
            columns={columns}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            filterColumn={filterColumn}
            selectedFilters={selectedFilters}
            isMobile={isMobile}
            onSort={handleSort}
            onFilterToggle={handleFilterToggle}
            onClearFilters={clearFilters}
            onFilterColumnChange={setFilterColumn}
          />

          <CTableBody
            data={paginatedData}
            columns={columns}
            rowKey={rowKey}
            onRowDoubleClick={onRowDoubleClick}
          />
        </table>
      </div>

      {/* Pagination */}
      {paginationConfig && (
        <CTablePagination
          config={paginationConfig}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
}