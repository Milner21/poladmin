import { useQuery } from "@tanstack/react-query";
import { solicitudesService } from "@services/solicitudes.service";

export const useSolicitudes = () => {
  return useQuery({
    queryKey: ["solicitudes"],
    queryFn: solicitudesService.getAll,
    staleTime: 30000, // 30 segundos
  });
};