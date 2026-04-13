import axiosInstance from '@api/axios.config';
import type { Nivel, CreateNivelDto, UpdateNivelDto } from '@dto/nivel.types';

export const nivelesService = {
  getAll: async (): Promise<Nivel[]> => {
    const response = await axiosInstance.get('/niveles');
    return response.data;
  },

  getById: async (id: string): Promise<Nivel> => {
    const response = await axiosInstance.get(`/niveles/${id}`);
    return response.data;
  },

  create: async (data: CreateNivelDto): Promise<Nivel> => {
    const response = await axiosInstance.post('/niveles', data);
    return response.data;
  },

  update: async (id: string, data: UpdateNivelDto): Promise<Nivel> => {
    const response = await axiosInstance.put(`/niveles/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/niveles/${id}`);
  },
};