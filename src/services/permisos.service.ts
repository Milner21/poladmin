import axiosInstance from '@api/axios.config';
import type { 
  Permiso, 
  CreatePermisoDto, 
  UpdatePermisoDto 
} from '@dto/permiso.types';

export const permisosService = {
  getAll: async (): Promise<Permiso[]> => {
    const response = await axiosInstance.get('/permisos');
    return response.data;
  },

  getById: async (id: string): Promise<Permiso> => {
    const response = await axiosInstance.get(`/permisos/${id}`);
    return response.data;
  },

  getByModulo: async (modulo: string): Promise<Permiso[]> => {
    const response = await axiosInstance.get('/permisos', {
      params: { modulo },
    });
    return response.data;
  },

  create: async (data: CreatePermisoDto): Promise<Permiso> => {
    const response = await axiosInstance.post('/permisos', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePermisoDto): Promise<Permiso> => {
    const response = await axiosInstance.put(`/permisos/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/permisos/${id}`);
  },
};