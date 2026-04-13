import { useMutation, useQueryClient } from "@tanstack/react-query";
import { simpatizantesService } from "@services/simpatizantes.service";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export const useRevertirResolucion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (duplicadoId: string) => simpatizantesService.revertirResolucion(duplicadoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simpatizantes"] });
      queryClient.invalidateQueries({ queryKey: ["duplicados-simpatizantes"] });
      toast("Resolución revertida correctamente", { icon: "✅" });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      if (error?.response?.data?.message) {
        toast(error.response.data.message, { icon: "❌" });
      } else {
        toast("Error al revertir resolución", { icon: "❌" });
      }
    },
  });
};