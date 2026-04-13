import axiosInstance from "@api/axios.config";
import type {
  Impresora,
  CreateImpresoraDto,
  UpdateImpresoraDto,
  AsignarUsuarioDto,
  CrearTrabajoDto,
} from "@dto/impresora.types";

export const impresorasService = {
  getAll: async (): Promise<Impresora[]> => {
    const response = await axiosInstance.get("/impresoras");
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<Impresora> => {
    const response = await axiosInstance.get(`/impresoras/${id}`);
    return response.data.data || response.data;
  },

  getMiImpresora: async (): Promise<Impresora | null> => {
    const response = await axiosInstance.get("/impresoras/mi-impresora");
    return response.data.data || response.data || null;
  },

  create: async (data: CreateImpresoraDto): Promise<Impresora> => {
    const response = await axiosInstance.post("/impresoras", data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: UpdateImpresoraDto): Promise<Impresora> => {
    const response = await axiosInstance.patch(`/impresoras/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<Impresora> => {
    const response = await axiosInstance.delete(`/impresoras/${id}`);
    return response.data.data || response.data;
  },

  asignarUsuario: async (data: AsignarUsuarioDto): Promise<unknown> => {
    const response = await axiosInstance.post(
      "/impresoras/asignar-usuario",
      data,
    );
    return response.data.data || response.data;
  },

  desasignarUsuario: async (
    usuarioId: string,
    impresoraId: string,
  ): Promise<unknown> => {
    const response = await axiosInstance.delete(
      `/impresoras/desasignar-usuario/${usuarioId}/${impresoraId}`,
    );
    return response.data.data || response.data;
  },

  crearTrabajo: async (data: CrearTrabajoDto): Promise<unknown> => {
    const response = await axiosInstance.post(
      "/impresoras/crear-trabajo",
      data,
    );
    return response.data.data || response.data;
  },

  verificarAgente: async (): Promise<{
    conectada: boolean;
    impresora: string | null;
  }> => {
    try {
      const response = await axiosInstance.get("/impresoras/mi-impresora");
      const impresora = response.data.data || response.data;

      if (!impresora) {
        return { conectada: false, impresora: null };
      }

      return {
        conectada: impresora.estado === "CONECTADA",
        impresora: impresora.nombre,
      };
    } catch {
      return { conectada: false, impresora: null };
    }
  },

  imprimirTickets: async (
    pasajerosIds: string[],
  ): Promise<{
    exitosos: number;
    fallidos: number;
    mensaje: string;
  }> => {
    const response = await axiosInstance.post("/impresoras/imprimir-tickets", {
      pasajeros_ids: pasajerosIds,
    });
    return response.data.data || response.data;
  },
};
