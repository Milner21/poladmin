import { useMutation, useQueryClient } from "@tanstack/react-query";
import { simpatizantesService } from "@services/simpatizantes.service";
import type { CreateSimpatizanteDto } from "@dto/simpatizante.types";
import toast from "react-hot-toast";

interface CrearParaTerceroParams {
  paraUsuarioId: string;
  datos: CreateSimpatizanteDto;
}

export const useCrearSimpatizanteParaTercero = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paraUsuarioId, datos }: CrearParaTerceroParams) => {
      return simpatizantesService.crearParaTercero(paraUsuarioId, datos);
    },
    onSuccess: (data) => {
      // Verificar si es una respuesta de duplicado
      if (data && typeof data === "object" && "duplicado_registrado" in data) {
        const respuestaDuplicado = data as {
          duplicado_registrado: boolean;
          mensaje: string;
        };
        if (respuestaDuplicado.duplicado_registrado) {
          toast.success(respuestaDuplicado.mensaje);
          return;
        }
      }

      // Si no es duplicado, es un simpatizante creado exitosamente
      toast.success("Simpatizante registrado correctamente");

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["simpatizantes"] });
      queryClient.invalidateQueries({
        queryKey: ["usuarios", "red-simpatizantes"],
      });
    },
    onError: (error: unknown) => {
      const errorTyped = error as {
        response?: { data?: { message?: string } };
      };
      const mensaje =
        errorTyped?.response?.data?.message ||
        "Error al registrar simpatizante";
      toast.error(mensaje);
    },
  });
};
