import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activadorService } from "@services/activador.service";
import type { AsignarCupoDto } from "@dto/activador.types";
import toast from "react-hot-toast";

export const useAsignarCupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AsignarCupoDto) => activadorService.asignarCupo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activador", "cupos"] });
      queryClient.invalidateQueries({ queryKey: ["activador", "mi-cupo"] });
      toast.success("Cupo asignado correctamente");
    },
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Error al asignar el cupo");
      } else {
        toast.error("Error al asignar el cupo");
      }
    },
  });
};