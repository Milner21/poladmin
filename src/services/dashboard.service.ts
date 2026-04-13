// src/services/dashboard.service.ts

import axiosInstance from "../api/axios.config";
import type {
  AsistenciasPorEvento,
  DashboardEstadisticas,
  DistribucionRed,
  EventoReciente,
  IntencionVotoDashboard,
  SimpatizantesEvolucion,
  SimpatizantesEvolucionDiaria,
  TopUsuario,
} from "../types/dashboard.types";

export const dashboardService = {
  getEstadisticas: async (): Promise<DashboardEstadisticas> => {
    const response = await axiosInstance.get("/dashboard/estadisticas");
    return response.data.data;
  },

  getSimpatizantesEvolucion: async (
    meses: number = 6,
  ): Promise<SimpatizantesEvolucion[]> => {
    const response = await axiosInstance.get(
      "/dashboard/simpatizantes-evolucion",
      {
        params: { meses },
      },
    );
    return response.data.data;
  },

  getSimpatizantesEvolucionDiaria: async (
    dias: number = 7,
  ): Promise<SimpatizantesEvolucionDiaria[]> => {
    const response = await axiosInstance.get(
      "/dashboard/simpatizantes-evolucion-diaria",
      {
        params: { dias: dias },
      },
    );
    return response.data.data;
  },

  getAsistenciasPorEvento: async (
    limit: number = 10,
  ): Promise<AsistenciasPorEvento[]> => {
    const response = await axiosInstance.get(
      "/dashboard/asistencias-por-evento",
      {
        params: { limit },
      },
    );
    return response.data.data;
  },

  getDistribucionRed: async (): Promise<DistribucionRed[]> => {
    const response = await axiosInstance.get("/dashboard/distribucion-red");
    return response.data.data;
  },

  getEventosRecientes: async (limit: number = 5): Promise<EventoReciente[]> => {
    const response = await axiosInstance.get("/dashboard/eventos-recientes", {
      params: { limit },
    });
    return response.data.data;
  },

  getTop10Registros: async (): Promise<TopUsuario[]> => {
    const response = await axiosInstance.get("/dashboard/top10-registros");
    return response.data.data;
  },

  getIntencionVoto: async (): Promise<IntencionVotoDashboard> => {
    const response = await axiosInstance.get("/dashboard/intencion-voto");
    return response.data.data;
  },
};
