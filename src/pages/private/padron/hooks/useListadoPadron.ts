import { useQuery } from '@tanstack/react-query';
import { padronService } from '@services/padron.service';
import type { TipoPadron } from '@dto/padron.types';

export const useListadoPadron = (tipo: TipoPadron) => {
  return useQuery({
    queryKey: ['padron', 'listado', tipo],
    queryFn: () => padronService.obtenerListado(tipo),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};