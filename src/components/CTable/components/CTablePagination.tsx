//src/components/CTable/components/CTablePagination.tsx

import type { FC } from 'react';
import { CPagination } from '@components/ui';
import type { PaginationConfig } from '../CTable.types';

interface CTablePaginationProps {
  config: PaginationConfig;
  onChange: (page: number, pageSize?: number) => void;
}

export const CTablePagination: FC<CTablePaginationProps> = ({
  config,
  onChange,
}) => {
  return (
    <div className="flex justify-end pt-4 mt-4">
      <CPagination
        current={config.current}
        pageSize={config.pageSize}
        total={config.total}
        showSizeChanger={config.showSizeChanger}
        pageSizeOptions={config.pageSizeOptions}
        showTotal={config.showTotal}
        onChange={onChange}
      />
    </div>
  );
};