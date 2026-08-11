import axiosInstance from "@api/axios.config";
import type {
  Campana,
  ConfiguracionCampana,
  CreateCampanaDto,
  UpdateCampanaDto,
} from "@dto/campana.types";

export const campanasService = {
  getAll: async (): Promise<Campana[]> => {
    const response = await axiosInstance.get("/campanas");
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<Campana> => {
    const response = await axiosInstance.get(`/campanas/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateCampanaDto): Promise<Campana> => {
    const response = await axiosInstance.post("/campanas", data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: UpdateCampanaDto): Promise<Campana> => {
    const response = await axiosInstance.put(`/campanas/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/campanas/${id}`);
  },

  actualizarConfiguracion: async (
    id: string,
    data: {
      permitir_duplicados_simpatizantes?: boolean;
      permitir_registro_manual_fuera_padron?: boolean;
      ticket_header_imagen?: string | null;
      ticket_header_linea1?: string | null;
      ticket_header_linea2?: string | null;
      ticket_header_linea3?: string | null;
      usar_activador_ticket?: boolean;
      usar_verificador_asistencia?: boolean;
      usar_solidaridad?: boolean;
      metodo_verificacion?: "PIN" | "QR";
    },
  ): Promise<ConfiguracionCampana> => {
    const response = await axiosInstance.patch(
      `/campanas/${id}/configuracion`,
      data,
    );
    return response.data.data || response.data;
  },
};
