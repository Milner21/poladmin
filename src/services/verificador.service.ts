import axiosInstance from "@api/axios.config";
import type {
  VerificacionAsistencia,
  ResultadoVerificacion,
  VerificarAsistenciaDto,
} from "@dto/verificador.types";

export const verificadorService = {
  verificarAsistencia: async (data: VerificarAsistenciaDto): Promise<ResultadoVerificacion> => {
    const response = await axiosInstance.post("/verificador/verificar", data);
    return response.data.data || response.data;
  },

  getMisVerificaciones: async (): Promise<VerificacionAsistencia[]> => {
    const response = await axiosInstance.get("/verificador/mis-verificaciones");
    return response.data.data || response.data;
  },
};