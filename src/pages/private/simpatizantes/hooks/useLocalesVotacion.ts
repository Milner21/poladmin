import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@services/reportes.service';
import type { FiltrosLocalesVotacion } from '@dto/reportes.types';

export const useLocalesVotacion = (filtros: FiltrosLocalesVotacion) => {
  return useQuery({
    queryKey: ['locales-votacion', filtros],
    queryFn: () => reportesService.getLocalesVotacion(filtros),
    enabled: !!filtros.campana_id,
    staleTime: 1000 * 60 * 2,
  });
};