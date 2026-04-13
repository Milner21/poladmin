import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '@services/usuarios.service';

export const useCandidatosSuperiores = (campanaId: string, nivelOrden: number) => {
  return useQuery({
    queryKey: ['candidatos-superiores', campanaId, nivelOrden],
    queryFn: () => usuariosService.getCandidatosSuperiores(campanaId, nivelOrden),
    enabled: !!campanaId && nivelOrden > 1, // Solo buscar si hay campaña y nivel > 1
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};