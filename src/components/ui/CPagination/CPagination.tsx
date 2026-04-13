import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { FC } from 'react';

interface CPaginationProps {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  showTotal?: boolean;
  onChange: (page: number, pageSize?: number) => void;
}

export const CPagination: FC<CPaginationProps> = ({
  current,
  pageSize,
  total,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  showTotal = true,
  onChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onChange(page, pageSize);
    }
  };

  const handleSizeChange = (newSize: number) => {
    onChange(1, newSize);
  };

  // Generar números de página visibles
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Total de registros */}
      {showTotal && (
        <span className="text-sm text-text-secondary">
          {startItem}-{endItem} de {total} registros
        </span>
      )}

      <div className="flex items-center gap-2">
        {/* Selector de tamaño de página */}
        {showSizeChanger && (
          <select
            value={pageSize}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            className="px-3 py-1 border border-border rounded-lg bg-bg-content text-text-primary text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / página
              </option>
            ))}
          </select>
        )}

        {/* Botón anterior */}
        <button
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1}
          className="p-2 rounded-lg border border-border bg-bg-content text-text-primary
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-bg-base transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-text-tertiary">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                className={`
                  px-3 py-1 rounded-lg text-sm transition-colors
                  ${page === current
                    ? 'bg-primary text-white font-medium'
                    : 'border border-border bg-bg-content text-text-primary hover:bg-bg-base'
                  }
                `}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Botón siguiente */}
        <button
          onClick={() => handlePageChange(current + 1)}
          disabled={current === totalPages}
          className="p-2 rounded-lg border border-border bg-bg-content text-text-primary
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-bg-base transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};