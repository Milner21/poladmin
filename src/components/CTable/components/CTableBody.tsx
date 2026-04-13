// src/components/CTable/components/CTableBody.tsx

import type { ReactNode } from 'react';
import type { ColumnDef } from '../CTable.types';

interface CTableBodyProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: keyof T | ((record: T) => string);
  onRowDoubleClick?: (record: T) => void;
}

export function CTableBody<T extends Record<string, unknown>>({
  data,
  columns,
  rowKey,
  onRowDoubleClick,
}: CTableBodyProps<T>) {
  const getRowKey = (record: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey]);
  };

  const getCellValue = (record: T, column: ColumnDef<T>, index: number): ReactNode => {
    if (column.render) {
      return column.render(record, index);
    }
    if (column.dataIndex) {
      // Aplicar tag si está configurado
      if (column.tag) {
        const tagValue = record[column.dataIndex];
        const tagConfig = column.tag.render(tagValue, record);
        return (
          <span 
            className="inline-block px-2 py-0.5 rounded text-white text-xs"
            style={{ backgroundColor: tagConfig.color }}
          >
            {tagConfig.text}
          </span>
        );
      }
      return record[column.dataIndex] as ReactNode;
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <tbody className="text-text-primary">
        <tr>
          <td 
            colSpan={columns.length} 
            className="p-5 text-center text-text-tertiary"
          >
            No hay datos disponibles
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="text-text-primary">
      {data.map((record, index) => (
        <tr
          key={getRowKey(record)}
          className={`
            border-b border-border
            ${onRowDoubleClick ? 'cursor-pointer hover:bg-bg-base' : ''}
          `}
          onDoubleClick={() => onRowDoubleClick?.(record)}
        >
          {columns.map(column => (
            <td
              key={column.key}
              className={`
                px-1.5 py-1.5 text-text-primary
                ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                ${column.ellipsis ? 'overflow-hidden text-ellipsis whitespace-nowrap' : ''}
              `}
            >
              {getCellValue(record, column, index)}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}