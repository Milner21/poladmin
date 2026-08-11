import { useQuery } from "@tanstack/react-query";
import { puestosService } from "@services/puestos.service";

export const usePuesto = (id: string) => {
  return useQuery({
    queryKey: ["puesto", id],
    queryFn: () => puestosService.getById(id),
    enabled: !!id,
  });
};