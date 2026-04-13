import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '@services/usuarios.service';

export const useUsuario = (id: string | undefined) => {
  return useQuery({
    queryKey: ['usuario', id],
    queryFn: () => usuariosService.getById(id!),
    enabled: !!id, // Solo se ejecuta si hay un ID
    staleTime: 0,
  });
};