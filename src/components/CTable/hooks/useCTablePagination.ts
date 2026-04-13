// src/components/CTable/hooks/useCTablePagination.ts
import { useState, useMemo } from 'react';
import type { PaginationConfig } from '../CTable.types';

export const useCTablePagination = (
  totalItems: number,
  pagination?: boolean | PaginationConfig,
  defaultPageSize: number = 10
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(
    typeof pagination === 'object' && pagination.pageSize
      ? pagination.pageSize
      : defaultPageSize
  );

  const paginationConfig = useMemo(() => {
    if (pagination === false) return null;

    const baseConfig = {
      current: currentPage,
      pageSize: pageSize,
      total: totalItems,
      showSizeChanger: true,
      pageSizeOptions: [5, 10, 20, 50, 100],
      showTotal: true,
    };

    if (typeof pagination === 'object') {
      return {
        ...baseConfig,
        ...pagination,
        current: currentPage,
        pageSize: pageSize,
        total: totalItems,
      };
    }

    return baseConfig;
  }, [pagination, currentPage, pageSize, totalItems]);

  const paginatedRange = useMemo(() => {
    if (!paginationConfig) {
      return { start: 0, end: totalItems };
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return { start, end };
  }, [currentPage, pageSize, totalItems, paginationConfig]);

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1); // Reset to first page when changing page size
    }
  };

  return {
    paginationConfig,
    paginatedRange,
    handlePageChange,
    currentPage,
    pageSize,
  };
};