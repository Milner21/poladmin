import { useQuery } from '@tanstack/react-query';
import { padronService } from '@services/padron.service';

export const useStatsPadron = () => {
  return useQuery({
    queryKey: ['padron', 'stats'],
    queryFn: () => padronService.obtenerStats(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};