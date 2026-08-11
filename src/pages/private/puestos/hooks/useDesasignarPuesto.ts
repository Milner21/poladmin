import { useMutation } from "@tanstack/react-query";
import { puestosService } from "@services/puestos.service";
import toast from "react-hot-toast";

export const useDesasignarPuesto = () => {
  return useMutation({
    mutationFn: ({ puestoId, usuarioId }: { puestoId: string; usuarioId: string }) =>
      puestosService.desasignarUsuario(puestoId, usuarioId),
    onSuccess: () => {
      toast.success("Usuario desasignado exitosamente");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const mensaje =
        error.response?.data?.message || "Error al desasignar usuario";
      toast.error(mensaje);
    },
  });
};