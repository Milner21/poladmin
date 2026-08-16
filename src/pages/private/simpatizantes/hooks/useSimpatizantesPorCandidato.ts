// src/pages/private/simpatizantes/hooks/useSimpatizantesPorCandidato.ts

import { useQuery } from "@tanstack/react-query";
import { simpatizantesService } from "@services/simpatizantes.service";

export const useSimpatizantesPorCandidato = (candidatoId: string | null) => {
  return useQuery({
    queryKey: ["simpatizantes", "por-candidato", candidatoId],
    queryFn: () => simpatizantesService.getByCandidato(candidatoId!),
    enabled: !!candidatoId,
    staleTime: 0,
  });
};