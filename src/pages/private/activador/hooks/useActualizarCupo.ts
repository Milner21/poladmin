import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activadorService } from "@services/activador.service";
import type { ActualizarCupoDto } from "@dto/activador.types";
import toast from "react-hot-toast";

export const useActualizarCupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cupoId, data }: { cupoId: string; data: ActualizarCupoDto }) =>
      activadorService.actualizarCupo(cupoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activador", "cupos"] });
      toast.success("Cupo actualizado correctamente");
    },
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Error al actualizar el cupo");
      } else {
        toast.error("Error al actualizar el cupo");
      }
    },
  });
};