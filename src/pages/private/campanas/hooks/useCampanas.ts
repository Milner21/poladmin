import { useQuery } from '@tanstack/react-query';
import { campanasService } from '@services/campanas.service';

export const useCampanas = () => {
  return useQuery({
    queryKey: ['campanas'],
    queryFn: campanasService.getAll,
    staleTime: 0,
  });
};