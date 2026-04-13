import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '@services/usuarios.service';

export const useUsuarios = (campanaId?: string) => {
  return useQuery({
    queryKey: ['usuarios', campanaId ?? 'all'],
    queryFn: () => usuariosService.getAll(campanaId),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
};