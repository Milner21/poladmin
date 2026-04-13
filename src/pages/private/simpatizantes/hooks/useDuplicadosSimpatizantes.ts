import { useQuery } from '@tanstack/react-query';
import { simpatizantesService } from '@services/simpatizantes.service';

export const useDuplicadosSimpatizantes = () => {
  return useQuery({
    queryKey: ['duplicados-simpatizantes'],
    queryFn: simpatizantesService.getDuplicados,
    staleTime: 0,
  });
};