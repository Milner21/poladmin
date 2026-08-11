// src/hooks/useEstadisticasDiaD.ts

import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "@context/AuthContext";
import { estadisticasService } from "@services/estadisticas.service";
import type { RespuestaDiaD } from "@dto/estadisticas.types";

export const useEstadisticasDiaD = () => {
  const { usuario } = useContext(AuthContext) ?? {};
  const userId = usuario?.id;

  const query = useQuery<RespuestaDiaD>({
    queryKey: ["estadisticas", "dia-d", userId],
    queryFn: async () => {
      const respuesta = await estadisticasService.obtenerDiaD();
      return respuesta.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!userId,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isFetching,
    refetch: query.refetch,
  };
};