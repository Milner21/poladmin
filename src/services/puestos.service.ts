import axiosInstance from "@api/axios.config";
import type {
  PuestoControl,
  CreatePuestoDto,
  UpdatePuestoDto,
  AsignarUsuarioPuestoDto,
} from "@dto/puesto.types";

export const puestosService = {
  getAll: async (): Promise<PuestoControl[]> => {
    const response = await axiosInstance.get("/puestos");
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<PuestoControl> => {
    const response = await axiosInstance.get(`/puestos/${id}`);
    return response.data.data || response.data;
  },

  getMiPuesto: async (): Promise<PuestoControl | null> => {
    const response = await axiosInstance.get("/puestos/mi-puesto");
    return response.data.data || response.data || null;
  },

  create: async (data: CreatePuestoDto): Promise<PuestoControl> => {
    const response = await axiosInstance.post("/puestos", data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: UpdatePuestoDto): Promise<PuestoControl> => {
    const response = await axiosInstance.patch(`/puestos/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<PuestoControl> => {
    const response = await axiosInstance.delete(`/puestos/${id}`);
    return response.data.data || response.data;
  },

  asignarUsuario: async (
    puestoId: string,
    data: AsignarUsuarioPuestoDto,
  ): Promise<unknown> => {
    const response = await axiosInstance.post(
      `/puestos/${puestoId}/asignar`,
      data,
    );
    return response.data.data || response.data;
  },

  desasignarUsuario: async (
    puestoId: string,
    usuarioId: string,
  ): Promise<unknown> => {
    const response = await axiosInstance.delete(
      `/puestos/${puestoId}/asignar/${usuarioId}`,
    );
    return response.data.data || response.data;
  },
};