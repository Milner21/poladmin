import axiosInstance from '@api/axios.config';
import type { Partido, CreatePartidoDto, UpdatePartidoDto } from '@dto/partido.types';

export const partidosService = {
  getAll: async (): Promise<Partido[]> => {
    const response = await axiosInstance.get('/partidos');
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<Partido> => {
    const response = await axiosInstance.get(`/partidos/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: CreatePartidoDto): Promise<Partido> => {
    const response = await axiosInstance.post('/partidos', data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: UpdatePartidoDto): Promise<Partido> => {
    const response = await axiosInstance.put(`/partidos/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/partidos/${id}`);
  },
};