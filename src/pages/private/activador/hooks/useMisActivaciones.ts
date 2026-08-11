import { useQuery } from "@tanstack/react-query";
import { activadorService } from "@services/activador.service";

export const useMisActivaciones = () => {
  return useQuery({
    queryKey: ["activador", "mis-activaciones"],
    queryFn: () => activadorService.getMisActivaciones(),
  });
};