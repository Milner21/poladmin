import { useMutation, useQueryClient } from "@tanstack/react-query";
import { solicitudesService } from "@services/solicitudes.service";
import type { CreateSolicitudDto } from "@dto/solicitud.types";
import toast from "react-hot-toast";

export const useCrearSolicitud = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSolicitudDto) => solicitudesService.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitudes"] });
      toast.success("Solicitud creada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la solicitud");
    },
  });
};