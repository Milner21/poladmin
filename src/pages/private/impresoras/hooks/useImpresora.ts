import { useQuery } from '@tanstack/react-query';
import { impresorasService } from '@services/impresoras.service';

export const useImpresora = (id: string) => {
  return useQuery({
    queryKey: ['impresora', id],
    queryFn: () => impresorasService.getById(id),
    enabled: !!id,
  });
};