import axiosInstance from '@api/axios.config';
import type {
  Solicitud,
  CreateSolicitudDto,
  UpdateSolicitudDto,
  AsignarSolicitudDto,
  CambiarEstadoSolicitudDto,
  AgendarSolicitudDto,
  MovimientoSolicitud,
  DashboardSolicitudes,
} from '@dto/solicitud.types';

export const solicitudesService = {
  // Listado y detalle
  getAll: async (): Promise<Solicitud[]> => {
    const response = await axiosInstance.get('/solicitudes');
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<Solicitud> => {
    const response = await axiosInstance.get(`/solicitudes/${id}`);
    return response.data.data || response.data;
  },

  getDashboard: async (): Promise<DashboardSolicitudes> => {
    const response = await axiosInstance.get('/solicitudes/dashboard');
    return response.data.data || response.data;
  },

  // CRUD
  crear: async (data: CreateSolicitudDto): Promise<Solicitud> => {
    const response = await axiosInstance.post('/solicitudes', data);
    return response.data.data || response.data;
  },

  actualizar: async (id: string, data: UpdateSolicitudDto): Promise<Solicitud> => {
    const response = await axiosInstance.patch(`/solicitudes/${id}`, data);
    return response.data.data || response.data;
  },

  eliminar: async (id: string): Promise<Solicitud> => {
    const response = await axiosInstance.delete(`/solicitudes/${id}`);
    return response.data.data || response.data;
  },

  // Gestión de estados y asignación
  asignar: async (id: string, data: AsignarSolicitudDto): Promise<Solicitud> => {
    const response = await axiosInstance.patch(`/solicitudes/${id}/asignar`, data);
    return response.data.data || response.data;
  },

  cambiarEstado: async (id: string, data: CambiarEstadoSolicitudDto): Promise<Solicitud> => {
    const response = await axiosInstance.patch(`/solicitudes/${id}/estado`, data);
    return response.data.data || response.data;
  },

  agendar: async (id: string, data: AgendarSolicitudDto): Promise<Solicitud> => {
    const response = await axiosInstance.patch(`/solicitudes/${id}/agendar`, data);
    return response.data.data || response.data;
  },

  // Historial
  getMovimientos: async (id: string): Promise<MovimientoSolicitud[]> => {
    const response = await axiosInstance.get(`/solicitudes/${id}/movimientos`);
    return response.data.data || response.data;
  },
};