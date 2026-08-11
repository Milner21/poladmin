import { useMutation } from "@tanstack/react-query";
import { puestosService } from "@services/puestos.service";
import toast from "react-hot-toast";

export const useAsignarPuesto = () => {
  return useMutation({
    mutationFn: ({ puestoId, usuario_id }: { puestoId: string; usuario_id: string }) =>
      puestosService.asignarUsuario(puestoId, { usuario_id }),
    onSuccess: () => {
      toast.success("Usuario asignado exitosamente");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const mensaje =
        error.response?.data?.message || "Error al asignar usuario";
      toast.error(mensaje);
    },
  });
};