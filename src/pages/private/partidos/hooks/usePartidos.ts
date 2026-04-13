import { useQuery } from '@tanstack/react-query';
import { partidosService } from '@services/partidos.service';

export const usePartidos = () => {
  return useQuery({
    queryKey: ['partidos'],
    queryFn: () => partidosService.getAll(),
  });
};