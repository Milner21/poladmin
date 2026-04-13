import { useQuery } from '@tanstack/react-query';
import { nivelesService } from '@services/niveles.service';

export const useNiveles = () => {
  return useQuery({
    queryKey: ['niveles'],
    queryFn: nivelesService.getAll,
    staleTime: 0,
  });
};