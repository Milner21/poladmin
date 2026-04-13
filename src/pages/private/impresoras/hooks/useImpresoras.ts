import { useQuery } from '@tanstack/react-query';
import { impresorasService } from '@services/impresoras.service';

export const useImpresoras = () => {
  return useQuery({
    queryKey: ['impresoras'],
    queryFn: () => impresorasService.getAll(),
  });
};