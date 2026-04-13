// src/pages/private/dashboard/hooks/useDashboard.ts

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "../../../../services/dashboard.service";
import type { TopUsuario } from "@dto/dashboard.types";
import { useContext, useEffect } from "react";
import { AuthContext } from "@context/AuthContext";

export const useDashboard = () => {
  const queryClient = useQueryClient();
  const { usuario } = useContext(AuthContext) ?? {};
  const userId = usuario?.id;

  // Invalida consultas cuando cambia el userId
  useEffect(() => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } else {
      // Cancela todas las consultas de dashboard al desloguearse
      queryClient.cancelQueries({ queryKey: ["dashboard"] });
      // Limpia los datos de dashboard
      queryClient.removeQueries({ queryKey: ["dashboard"] });
    }
  }, [userId, queryClient]);

  const estadisticas = useQuery({
    queryKey: ["dashboard", "estadisticas", userId],
    queryFn: dashboardService.getEstadisticas,
    staleTime: 10 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Auto-refresh cada 10 minutos
    refetchOnWindowFocus: true, // Refresca cuando vuelves a la pestaña
  });

  const simpatizantesEvolucion = useQuery({
    queryKey: ["dashboard", "simpatizantes-evolucion", userId],
    queryFn: () => dashboardService.getSimpatizantesEvolucion(6),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const simpatizantesEvolucionDiaria = useQuery({
    queryKey: ["dashboard", "simpatizantes-evolucion-diaria", userId],
    queryFn: () => dashboardService.getSimpatizantesEvolucionDiaria(7),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const asistenciasPorEvento = useQuery({
    queryKey: ["dashboard", "asistencias-por-evento", userId],
    queryFn: () => dashboardService.getAsistenciasPorEvento(10),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const distribucionRed = useQuery({
    queryKey: ["dashboard", "distribucion-red", userId],
    queryFn: dashboardService.getDistribucionRed,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const eventosRecientes = useQuery({
    queryKey: ["dashboard", "eventos-recientes", userId],
    queryFn: () => dashboardService.getEventosRecientes(5),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const top10Registros = useQuery<TopUsuario[]>({
    queryKey: ["dashboard", "top10-registros", userId],
    queryFn: () => dashboardService.getTop10Registros(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const intencionVoto = useQuery({
    queryKey: ["dashboard", "intencion-voto", userId],
    queryFn: dashboardService.getIntencionVoto,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const isLoading =
    estadisticas.isLoading ||
    simpatizantesEvolucion.isLoading ||
    simpatizantesEvolucionDiaria.isLoading ||
    asistenciasPorEvento.isLoading ||
    distribucionRed.isLoading ||
    eventosRecientes.isLoading ||
    top10Registros.isLoading ||
    intencionVoto.isLoading;

  const isError =
    estadisticas.isError ||
    simpatizantesEvolucion.isError ||
    simpatizantesEvolucionDiaria.isError ||
    asistenciasPorEvento.isError ||
    distribucionRed.isError ||
    eventosRecientes.isError ||
    top10Registros.isError ||
    intencionVoto.isError;

  const isRefetching =
    estadisticas.isFetching ||
    simpatizantesEvolucion.isFetching ||
    simpatizantesEvolucionDiaria.isFetching ||
    asistenciasPorEvento.isFetching ||
    distribucionRed.isFetching ||
    eventosRecientes.isFetching ||
    top10Registros.isFetching ||
    intencionVoto.isFetching;

  const refetchAll = async () => {
    await Promise.all([
      estadisticas.refetch(),
      simpatizantesEvolucion.refetch(),
      simpatizantesEvolucionDiaria.refetch(),
      asistenciasPorEvento.refetch(),
      distribucionRed.refetch(),
      eventosRecientes.refetch(),
      top10Registros.refetch(),
      intencionVoto.refetch(),
    ]);
  };

  return {
    estadisticas: estadisticas.data,
    simpatizantesEvolucion: simpatizantesEvolucion.data,
    simpatizantesEvolucionDiaria: simpatizantesEvolucionDiaria.data,
    asistenciasPorEvento: asistenciasPorEvento.data,
    distribucionRed: distribucionRed.data,
    eventosRecientes: eventosRecientes.data,
    top10Registros: top10Registros.data,
    intencionVoto: intencionVoto.data,
    isLoading,
    isError,
    isRefetching,
    refetch: refetchAll,
  };
};
