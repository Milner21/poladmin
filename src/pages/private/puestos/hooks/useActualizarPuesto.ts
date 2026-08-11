import { useMutation, useQueryClient } from "@tanstack/react-query";
import { puestosService } from "@services/puestos.service";
import toast from "react-hot-toast";

export const useActualizarPuesto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { descripcion?: string; activo?: boolean } }) =>
      puestosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["puestos"] });
      queryClient.invalidateQueries({ queryKey: ["puesto"] });
      toast.success("Puesto actualizado exitosamente");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const mensaje =
        error.response?.data?.message || "Error al actualizar el puesto";
      toast.error(mensaje);
    },
  });
};