import { useQuery } from '@tanstack/react-query';
import { partidosService } from '@services/partidos.service';

export const usePartido = (id: string) => {
  return useQuery({
    queryKey: ['partidos', id],
    queryFn: () => partidosService.getById(id),
    enabled: !!id,
  });
};