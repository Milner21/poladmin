import { useQuery } from '@tanstack/react-query';
import { solicitudesService } from '@services/solicitudes.service';

export const useMovimientosSolicitud = (solicitudId: string | undefined) => {
  return useQuery({
    queryKey: ['movimientos-solicitud', solicitudId],
    queryFn: () => solicitudesService.getMovimientos(solicitudId!),
    enabled: !!solicitudId,
    staleTime: 0,
  });
};