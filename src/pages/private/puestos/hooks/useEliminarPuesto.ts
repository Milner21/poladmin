import { useMutation, useQueryClient } from "@tanstack/react-query";
import { puestosService } from "@services/puestos.service";
import toast from "react-hot-toast";

export const useEliminarPuesto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: puestosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["puestos"] });
      toast.success("Puesto eliminado exitosamente");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const mensaje =
        error.response?.data?.message || "Error al eliminar el puesto";
      toast.error(mensaje);
    },
  });
};