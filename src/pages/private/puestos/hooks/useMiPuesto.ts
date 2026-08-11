import { useQuery } from "@tanstack/react-query";
import { puestosService } from "@services/puestos.service";

export const useMiPuesto = () => {
  return useQuery({
    queryKey: ["mi-puesto"],
    queryFn: () => puestosService.getMiPuesto(),
  });
};