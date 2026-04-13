import { useQuery } from '@tanstack/react-query';
import { seguimientosService } from '@services/seguimientos.service';

export const useSeguimientos = (simpatizanteId: string | undefined) => {
  return useQuery({
    queryKey: ['seguimientos', simpatizanteId],
    queryFn: () => seguimientosService.obtenerPorSimpatizante(simpatizanteId!),
    enabled: !!simpatizanteId,
    staleTime: 0,
  });
};