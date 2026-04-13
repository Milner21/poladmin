import { useQuery } from "@tanstack/react-query";
import { simpatizantesService } from "@services/simpatizantes.service";

export const useSimpatizantes = (soloPropios?: boolean) => {
  return useQuery({
    queryKey: ["simpatizantes", soloPropios ? "propios" : "red"],
    queryFn: () => simpatizantesService.getAll(soloPropios),
    staleTime: 0,
  });
};