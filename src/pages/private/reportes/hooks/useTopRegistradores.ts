import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@services/reportes.service';
import type { FiltrosReporte } from '@dto/reportes.types';

export const useTopRegistradores = (filtros: FiltrosReporte) => {
  return useQuery({
    queryKey: ['top-registradores', filtros],
    queryFn: () => reportesService.getTopRegistradores(filtros),
    enabled: !!filtros.campana_id,
    staleTime: 1000 * 60 * 5,
  });
};