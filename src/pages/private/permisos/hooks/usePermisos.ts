import { useQuery } from '@tanstack/react-query';
import { permisosService } from '@services/permisos.service';

export const usePermisos = () => {
  return useQuery({
    queryKey: ['permisos'],
    queryFn: permisosService.getAll,
    staleTime: 0,
  });
};