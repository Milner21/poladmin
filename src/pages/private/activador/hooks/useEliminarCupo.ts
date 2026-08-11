import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activadorService } from "@services/activador.service";
import toast from "react-hot-toast";

export const useEliminarCupo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cupoId: string) => activadorService.eliminarCupo(cupoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activador", "cupos"] });
      toast.success("Cupo eliminado correctamente");
    },
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Error al eliminar el cupo");
      } else {
        toast.error("Error al eliminar el cupo");
      }
    },
  });
};