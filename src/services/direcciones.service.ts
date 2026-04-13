import axiosInstance from '@api/axios.config';
import type { Direccion } from '@dto/simpatizante.types';

export const direccionesService = {
  buscarBarrios: async (departamento: string, ciudad: string, busqueda?: string): Promise<Direccion[]> => {
    const params = new URLSearchParams({
      departamento,
      ciudad,
      ...(busqueda && { q: busqueda }),
    });
    
    const response = await axiosInstance.get(`/direcciones/buscar?${params}`);
    return response.data;
  },

  crear: async (departamento: string, ciudad: string, barrio: string): Promise<Direccion> => {
    const response = await axiosInstance.post('/direcciones', {
      departamento,
      ciudad,
      barrio,
    });
    return response.data;
  },
};