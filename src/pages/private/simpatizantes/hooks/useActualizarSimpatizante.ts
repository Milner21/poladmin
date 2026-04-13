import { useMutation, useQueryClient } from "@tanstack/react-query";
import { simpatizantesService } from "@services/simpatizantes.service";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

interface ActualizarSimpatizanteParams {
  id: string;
  data: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    fecha_nacimiento?: string;
    departamento?: string;
    distrito?: string;
    barrio?: string;
    seccional_interna?: string;
    local_votacion_interna?: string;
    mesa_votacion_interna?: string;
    orden_votacion_interna?: string;
    local_votacion_general?: string;
    mesa_votacion_general?: string;
    orden_votacion_general?: string;
    es_afiliado?: boolean;
    intencion_voto?: string;
    observaciones?: string;
    necesita_transporte?: boolean;
    latitud?: number | null;
    longitud?: number | null;
  };
}

export const useActualizarSimpatizante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: ActualizarSimpatizanteParams) =>
      simpatizantesService.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simpatizantes"] });
      toast("Simpatizante actualizado correctamente", { icon: "✅" });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      if (error?.response?.data?.message) {
        toast(error.response.data.message, { icon: "❌" });
      } else {
        toast("Error al actualizar simpatizante", { icon: "❌" });
      }
    },
  });
};