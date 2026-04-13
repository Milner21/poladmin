import { useQuery } from '@tanstack/react-query';
import { transportesService } from '@services/transportes.service';

export const useEstadoConfirmacion = (transportistaId: string | null, enabled = true) => {
  return useQuery({
    queryKey: ['estado-confirmacion', transportistaId],
    queryFn: () => {
      if (!transportistaId) throw new Error('ID de transportista requerido');
      return transportesService.obtenerEstadoConfirmacion(transportistaId);
    },
    enabled: enabled && !!transportistaId,
    refetchInterval: false, // No refetch automático, lo controlamos manualmente
    staleTime: 0, // Siempre considerar datos obsoletos para refetch manual
  });
};