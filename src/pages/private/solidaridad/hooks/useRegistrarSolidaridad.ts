//src/pages/private/solidaridad/hooks/useRegistrarSolidaridad.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { solidaridadService } from "@services/solidaridad.service";
import type { RegistrarSolidaridadDto } from "@dto/solidaridad.types";
import toast from "react-hot-toast";

export const useRegistrarSolidaridad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegistrarSolidaridadDto) => solidaridadService.registrarSolidaridad(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solidaridad", "mis-registros"] });
      toast.success("Solidaridad registrada correctamente");
    },
    onError: (error: unknown) => {
      if (error && typeof error === "object" && "response" in error) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Error al registrar solidaridad");
      } else {
        toast.error("Error al registrar solidaridad");
      }
    },
  });
};