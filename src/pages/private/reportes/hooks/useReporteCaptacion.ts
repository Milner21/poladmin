import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@services/reportes.service';
import type { FiltrosReporte } from '@dto/reportes.types';

export const useReporteCaptacion = (filtros: FiltrosReporte) => {
  return useQuery({
    queryKey: ['reporte-captacion', filtros],
    queryFn: () => reportesService.getCaptacion(filtros),
    enabled: !!filtros.campana_id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};