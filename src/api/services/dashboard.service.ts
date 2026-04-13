import axiosInstance from "../axios.config";

export const dashboardService = {
  getStats: async () => {
    // Por ahora simulamos, luego conectamos con endpoints reales
    return {
      total_usuarios: 0,
      total_eventos: 0,
      total_simpatizantes: 0,
      eventos_proximos: 0,
    };
  },

  getEventosProximos: async () => {
    const response = await axiosInstance.get('/eventos/proximos');
    return response.data;
  },
};