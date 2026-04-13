import { useQuery } from "@tanstack/react-query";
import { simpatizantesService } from "@services/simpatizantes.service";

export const useSimpatizantesPorUsuario = (usuarioId: string | null) => {
  return useQuery({
    queryKey: ["simpatizantes", "por-usuario", usuarioId],
    queryFn: () => simpatizantesService.getByUsuario(usuarioId!),
    enabled: !!usuarioId,
    staleTime: 0,
  });
};