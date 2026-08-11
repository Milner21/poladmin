import axiosInstance from "@api/axios.config";
import type {
  CupoActivador,
  ActivacionTicket,
  MiCupoResponse,
  ResultadoActivacion,
  ActivarTicketDto,
  AsignarCupoDto,
  ActualizarCupoDto,
} from "@dto/activador.types";

export const activadorService = {
  // ==========================================
  // ENDPOINTS DEL ACTIVADOR (uso operativo)
  // ==========================================

  getMiCupo: async (): Promise<MiCupoResponse> => {
    const response = await axiosInstance.get("/activador/mi-cupo");
    return response.data.data || response.data;
  },

  activarTicket: async (data: ActivarTicketDto): Promise<ResultadoActivacion> => {
    const response = await axiosInstance.post("/activador/activar", data);
    return response.data.data || response.data;
  },

  getMisActivaciones: async (): Promise<ActivacionTicket[]> => {
    const response = await axiosInstance.get("/activador/mis-activaciones");
    return response.data.data || response.data;
  },

  // ==========================================
  // ENDPOINTS DE GESTION DE CUPOS
  // ==========================================

  getCupos: async (): Promise<CupoActivador[]> => {
    const response = await axiosInstance.get("/activador/cupos");
    return response.data.data || response.data;
  },

  asignarCupo: async (data: AsignarCupoDto): Promise<CupoActivador> => {
    const response = await axiosInstance.post("/activador/cupos", data);
    return response.data.data || response.data;
  },

  actualizarCupo: async (
    cupoId: string,
    data: ActualizarCupoDto,
  ): Promise<CupoActivador> => {
    const response = await axiosInstance.patch(
      `/activador/cupos/${cupoId}`,
      data,
    );
    return response.data.data || response.data;
  },

  eliminarCupo: async (cupoId: string): Promise<void> => {
    await axiosInstance.delete(`/activador/cupos/${cupoId}`);
  },
};