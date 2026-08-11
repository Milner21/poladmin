//src/pages/private/solidaridad/hooks/useMisRegistrosSolidaridad.ts
import { useQuery } from "@tanstack/react-query";
import { solidaridadService } from "@services/solidaridad.service";

export const useMisRegistrosSolidaridad = () => {
  return useQuery({
    queryKey: ["solidaridad", "mis-registros"],
    queryFn: () => solidaridadService.getMisRegistros(),
  });
};