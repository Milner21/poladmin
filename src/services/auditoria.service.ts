import axiosInstance from '@api/axios.config';
import type { AuditoriaLog, FiltrosAuditoria } from '@dto/auditoria.types';

export const auditoriaService = {
  getLogs: async (filtros?: FiltrosAuditoria): Promise<AuditoriaLog[]> => {
    const params = new URLSearchParams();
    
    if (filtros?.modulo) params.append('modulo', filtros.modulo);
    if (filtros?.accion) params.append('accion', filtros.accion);
    if (filtros?.fechaDesde) params.append('fechaDesde', filtros.fechaDesde.toISOString());
    if (filtros?.fechaHasta) params.append('fechaHasta', filtros.fechaHasta.toISOString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    const response = await axiosInstance.get(`/auditoria/logs?${params.toString()}`);
    return response.data;
  },
};