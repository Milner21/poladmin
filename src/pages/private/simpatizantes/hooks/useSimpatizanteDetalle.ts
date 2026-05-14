import { useQuery } from "@tanstack/react-query";
import { simpatizantesService } from "@services/simpatizantes.service";

export const useSimpatizanteDetalle = (id: string | null) => {
  return useQuery({
    queryKey: ["simpatizante-detalle", id],
    queryFn: () => simpatizantesService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};