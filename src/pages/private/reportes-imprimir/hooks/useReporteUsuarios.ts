import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@services/reportes.service';
import type { FiltrosReporte } from '@dto/reportes.types';

export const useReporteUsuarios = (filtros: FiltrosReporte) => {
  return useQuery({
    queryKey: ['reporte-usuarios', filtros],
    queryFn: () => reportesService.getUsuarios(filtros),
    enabled: !!filtros.campana_id,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};