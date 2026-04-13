import { useQuery } from '@tanstack/react-query';
import { impresorasService } from '@services/impresoras.service';

export const useMiImpresora = () => {
  return useQuery({
    queryKey: ['mi-impresora'],
    queryFn: () => impresorasService.getMiImpresora(),
  });
};