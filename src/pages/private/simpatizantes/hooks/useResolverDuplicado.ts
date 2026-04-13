import { useMutation, useQueryClient } from "@tanstack/react-query";
import { simpatizantesService } from "@services/simpatizantes.service";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

interface ResolverDuplicadoParams {
  duplicadoId: string;
  forzar?: boolean;
}

export const useResolverDuplicado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ duplicadoId, forzar }: ResolverDuplicadoParams) =>
      simpatizantesService.resolverDuplicado(duplicadoId, forzar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simpatizantes"] });
      queryClient.invalidateQueries({ queryKey: ["duplicados-simpatizantes"] });
      toast("Duplicado resuelto correctamente", { icon: "✅" });
    },
    onError: (error: AxiosError<{ message: string; codigo?: string }>) => {
      const codigo = error?.response?.data?.codigo;
      if (codigo === "RESOLUCION_FAVORECE_OPERATIVO") return;
      if (error?.response?.data?.message) {
        toast(error.response.data.message, { icon: "❌" });
      } else {
        toast("Error al resolver duplicado", { icon: "❌" });
      }
    },
  });
};