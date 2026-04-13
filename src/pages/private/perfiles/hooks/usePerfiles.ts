import { useQuery } from '@tanstack/react-query';
import { perfilesService } from '@services/perfiles.service';

export const usePerfiles = () => {
  return useQuery({
    queryKey: ['perfiles'],
    queryFn: perfilesService.getAll,
    staleTime: 0,
  });
};