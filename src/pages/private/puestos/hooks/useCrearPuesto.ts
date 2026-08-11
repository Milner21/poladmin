import { useMutation, useQueryClient } from "@tanstack/react-query";
import { puestosService } from "@services/puestos.service";
import toast from "react-hot-toast";

export const useCrearPuesto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: puestosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["puestos"] });
      toast.success("Puesto creado exitosamente");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      const mensaje =
        error.response?.data?.message || "Error al crear el puesto";
      toast.error(mensaje);
    },
  });
};