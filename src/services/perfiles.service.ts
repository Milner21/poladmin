import axiosInstance from '@api/axios.config';
import type { 
  Perfil, 
  CreatePerfilDto, 
  UpdatePerfilDto 
} from '@dto/perfil.types';

export const perfilesService = {
  getAll: async (): Promise<Perfil[]> => {
    const response = await axiosInstance.get('/perfiles');
    return response.data;
  },

  getById: async (id: string): Promise<Perfil> => {
    const response = await axiosInstance.get(`/perfiles/${id}`);
    return response.data;
  },

  create: async (data: CreatePerfilDto): Promise<Perfil> => {
    const response = await axiosInstance.post('/perfiles', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePerfilDto): Promise<Perfil> => {
    const response = await axiosInstance.put(`/perfiles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/perfiles/${id}`);
  },

  asignarPermisos: async (id: string, permisos_ids: string[]): Promise<Perfil> => {
    const response = await axiosInstance.post(`/perfiles/${id}/permisos`, {
      permisos_ids,
    });
    return response.data;
  },
};