import { useQuery } from "@tanstack/react-query";
import { activadorService } from "@services/activador.service";

export const useCuposActivador = () => {
  return useQuery({
    queryKey: ["activador", "cupos"],
    queryFn: () => activadorService.getCupos(),
  });
};