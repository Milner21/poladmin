// src/pages/private/dashboard/hooks/useDashboard.ts

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "../../../../services/dashboard.service";
import type { ComparativaModos, TopUsuario } from "@dto/dashboard.types";
import { useContext, useEffect } from "react";
import { AuthContext } from "@context/AuthContext";

export const useDashboard = () => {
  const queryClient = useQueryClient();
  const { usuario } = useContext(AuthContext) ?? {};
  const userId = usuario?.id;

  // Campana seleccionada para ROOT
  const campanaSeleccionada =
    localStorage.getItem("campana_seleccionada_root") ?? undefined;

  // Invalida consultas cuando cambia el userId o la campana seleccionada
  useEffect(() => {
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } else {
      queryClient.cancelQueries({ queryKey: ["dashboard"] });
      queryClient.removeQueries({ queryKey: ["dashboard"] });
    }
  }, [userId, campanaSeleccionada, queryClient]);

  const estadisticas = useQuery({
    queryKey: ["dashboard", "estadisticas", userId, campanaSeleccionada],
    queryFn: dashboardService.getEstadisticas,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const simpatizantesEvolucion = useQuery({
    queryKey: [
      "dashboard",
      "simpatizantes-evolucion",
      userId,
      campanaSeleccionada,
    ],
    queryFn: () => dashboardService.getSimpatizantesEvolucion(6),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const simpatizantesEvolucionDiaria = useQuery({
    queryKey: [
      "dashboard",
      "simpatizantes-evolucion-diaria",
      userId,
      campanaSeleccionada,
    ],
    queryFn: () => dashboardService.getSimpatizantesEvolucionDiaria(7),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const asistenciasPorEvento = useQuery({
    queryKey: [
      "dashboard",
      "asistencias-por-evento",
      userId,
      campanaSeleccionada,
    ],
    queryFn: () => dashboardService.getAsistenciasPorEvento(10),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const distribucionRed = useQuery({
    queryKey: ["dashboard", "distribucion-red", userId, campanaSeleccionada],
    queryFn: dashboardService.getDistribucionRed,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const eventosRecientes = useQuery({
    queryKey: ["dashboard", "eventos-recientes", userId, campanaSeleccionada],
    queryFn: () => dashboardService.getEventosRecientes(5),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const top10Registros = useQuery<TopUsuario[]>({
    queryKey: ["dashboard", "top10-registros", userId, campanaSeleccionada],
    queryFn: () => dashboardService.getTop10Registros(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const intencionVoto = useQuery({
    queryKey: ["dashboard", "intencion-voto", userId, campanaSeleccionada],
    queryFn: dashboardService.getIntencionVoto,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const comparativaModos = useQuery<ComparativaModos>({
    queryKey: ["dashboard", "comparativa-modos", userId, campanaSeleccionada],
    queryFn: dashboardService.getComparativaModos,
    staleTime: 10 * 60 * 1000,
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
      comparativaModos.refetch(),
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
    comparativaModos: comparativaModos.data,
    isLoading,
    isError,
    isRefetching,
    refetch: refetchAll,
  };
};
