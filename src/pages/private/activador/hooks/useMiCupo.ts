import { useQuery } from "@tanstack/react-query";
import { activadorService } from "@services/activador.service";

export const useMiCupo = () => {
  return useQuery({
    queryKey: ["activador", "mi-cupo"],
    queryFn: () => activadorService.getMiCupo(),
  });
};