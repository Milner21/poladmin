import { useQuery } from "@tanstack/react-query";
import { puestosService } from "@services/puestos.service";

export const usePuestos = () => {
  return useQuery({
    queryKey: ["puestos"],
    queryFn: () => puestosService.getAll(),
  });
};