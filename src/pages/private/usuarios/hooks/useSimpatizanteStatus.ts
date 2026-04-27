import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@api/axios.config";
import type { EstadoSimpatizanteResponse } from "@dto/usuario.types";
import toast from "react-hot-toast";

export const useSimpatizanteStatus = (usuarioId: string | undefined) => {
  const queryClient = useQueryClient();

  const { data: estadoSimpatizante, isLoading: cargandoEstado } =
    useQuery<EstadoSimpatizanteResponse>({
      queryKey: ["usuario-simpatizante-status", usuarioId],
      queryFn: async () => {
        const response = await axiosInstance.get(
          `/usuarios/${usuarioId}/simpatizante-status`,
        );
        return response.data;
      },
      enabled: !!usuarioId && usuarioId !== undefined,
    });

  const reactivarMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.post(
        `/usuarios/${id}/reactivar-simpatizante`,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Simpatizante reactivado correctamente");
      queryClient.invalidateQueries({
        queryKey: ["usuario-simpatizante-status", usuarioId],
      });
    },
    onError: (error: unknown) => {
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      const mensaje =
        errorResponse.response?.data?.message ||
        "Error al reactivar simpatizante";
      toast.error(mensaje);
    },
  });

  return {
    estadoSimpatizante,
    cargandoEstado,
    reactivarSimpatizante: reactivarMutation.mutate,
    reactivandoSimpatizante: reactivarMutation.isPending,
  };
};
