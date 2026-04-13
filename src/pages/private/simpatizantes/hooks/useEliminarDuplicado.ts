import { useMutation, useQueryClient } from "@tanstack/react-query";
import { simpatizantesService } from "@services/simpatizantes.service";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

export const useEliminarDuplicado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (duplicadoId: string) =>
      simpatizantesService.eliminarDuplicado(duplicadoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simpatizantes"] });
      queryClient.invalidateQueries({ queryKey: ["duplicados-simpatizantes"] });
      toast("Duplicado eliminado correctamente", { icon: "✅" });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      if (error?.response?.data?.message) {
        toast(error.response.data.message, { icon: "❌" });
      } else {
        toast("Error al eliminar duplicado", { icon: "❌" });
      }
    },
  });
};
