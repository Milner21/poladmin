import axiosInstance from '@api/axios.config';
import type { FiltrosReporte, ReporteCaptacion, ReporteMapaCalor, TopRegistrador } from '@dto/reportes.types';

export const reportesService = {
  getCaptacion: async (filtros: FiltrosReporte): Promise<ReporteCaptacion> => {
    const params = new URLSearchParams();
    
    if (filtros.campana_id) params.append('campana_id', filtros.campana_id);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
    if (filtros.departamento) params.append('departamento', filtros.departamento);
    if (filtros.distrito) params.append('distrito', filtros.distrito);
    if (filtros.barrio) params.append('barrio', filtros.barrio);
    if (filtros.candidato_id) params.append('candidato_id', filtros.candidato_id);
    if (filtros.lider_id) params.append('lider_id', filtros.lider_id);
    if (filtros.agrupacion) params.append('agrupacion', filtros.agrupacion);

    const response = await axiosInstance.get(`/reportes/captacion?${params.toString()}`);
    return response.data;
  },

  getMapaCalor: async (filtros: FiltrosReporte): Promise<ReporteMapaCalor> => {
    const params = new URLSearchParams();
    
    if (filtros.campana_id) params.append('campana_id', filtros.campana_id);
    if (filtros.departamento) params.append('departamento', filtros.departamento);
    if (filtros.distrito) params.append('distrito', filtros.distrito);
    if (filtros.barrio) params.append('barrio', filtros.barrio);

    const response = await axiosInstance.get(`/reportes/mapa-calor?${params.toString()}`);
    return response.data;
  },

  getTopRegistradores: async (filtros: FiltrosReporte): Promise<TopRegistrador[]> => {
    const params = new URLSearchParams();
    
    if (filtros.campana_id) params.append('campana_id', filtros.campana_id);
    if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);

    const response = await axiosInstance.get(`/reportes/top-registradores?${params.toString()}`);
    return response.data;
  },
};