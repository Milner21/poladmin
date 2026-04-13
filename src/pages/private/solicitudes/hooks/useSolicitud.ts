import { useQuery } from "@tanstack/react-query";
import { solicitudesService } from "@services/solicitudes.service";

export const useSolicitud = (id: string) => {
  return useQuery({
    queryKey: ["solicitud", id],
    queryFn: () => solicitudesService.getById(id),
    enabled: !!id,
  });
};