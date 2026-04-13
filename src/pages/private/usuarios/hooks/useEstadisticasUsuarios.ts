import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '@services/usuarios.service';

export const useEstadisticasUsuarios = (campanaId: string | undefined) => {
  return useQuery({
    queryKey: ['estadisticas-usuarios', campanaId],
    queryFn: () => usuariosService.getEstadisticas(campanaId!),
    enabled: !!campanaId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};