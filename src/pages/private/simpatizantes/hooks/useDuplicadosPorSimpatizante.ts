import { useQuery } from '@tanstack/react-query';
import { simpatizantesService } from '@services/simpatizantes.service';

export const useDuplicadosPorSimpatizante = (simpatizanteId: string | null) => {
  return useQuery({
    queryKey: ['duplicados-por-simpatizante', simpatizanteId],
    queryFn: () => simpatizantesService.getDuplicadosPorSimpatizante(simpatizanteId!),
    enabled: !!simpatizanteId,
    staleTime: 0,
  });
};