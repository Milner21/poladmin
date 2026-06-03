import { useQuery } from '@tanstack/react-query';
import { padronService } from '@services/padron.service';

export const useConsultaVotante = (ci: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['consulta-votante', ci],
    queryFn: () => padronService.consultarVotante(ci),
    enabled: enabled && ci.length > 0,
    retry: false,
  });
};