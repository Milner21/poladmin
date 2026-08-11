//src/pages/private/verificador/hooks/useVerificarAsistencia.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verificadorService } from "@services/verificador.service";
import type { VerificarAsistenciaDto } from "@dto/verificador.types";
import toast from "react-hot-toast";

export const useVerificarAsistencia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerificarAsistenciaDto) => verificadorService.verificarAsistencia(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verificador", "mis-verificaciones"] });
      toast.success("Asistencia verificada correctamente");
    },
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Error al verificar asistencia");
      } else {
        toast.error("Error al verificar asistencia");
      }
    },
  });
};