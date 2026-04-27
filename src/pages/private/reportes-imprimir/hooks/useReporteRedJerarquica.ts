import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@services/reportes.service';
import type { FiltrosReporte } from '@dto/reportes.types';

export const useReporteRedJerarquica = (filtros: FiltrosReporte) => {
  return useQuery({
    queryKey: ['reporte-red-jerarquica', filtros],
    queryFn: () => reportesService.getRedJerarquica(filtros),
    enabled: !!filtros.campana_id,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};