import axiosInstance from '@api/axios.config';
import type { Seguimiento, CrearSeguimientoDto, EstadisticasSeguimiento } from '@dto/seguimiento.types';

export const seguimientosService = {
  crear: async (data: CrearSeguimientoDto): Promise<Seguimiento> => {
    const response = await axiosInstance.post('/seguimientos', data);
    return response.data;
  },

  obtenerPorSimpatizante: async (simpatizanteId: string): Promise<Seguimiento[]> => {
    const response = await axiosInstance.get(`/seguimientos/simpatizante/${simpatizanteId}`);
    return response.data;
  },

  obtenerEstadisticas: async (campanaId: string): Promise<EstadisticasSeguimiento> => {
    const response = await axiosInstance.get(`/seguimientos/estadisticas?campana_id=${campanaId}`);
    return response.data;
  },
};