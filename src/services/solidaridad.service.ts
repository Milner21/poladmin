import axiosInstance from "@api/axios.config";
import type {
  RegistroSolidaridad,
  ResultadoSolidaridad,
  RegistrarSolidaridadDto,
} from "@dto/solidaridad.types";

export const solidaridadService = {
  registrarSolidaridad: async (data: RegistrarSolidaridadDto): Promise<ResultadoSolidaridad> => {
    const response = await axiosInstance.post("/solidaridad/registrar", data);
    return response.data.data || response.data;
  },

  getMisRegistros: async (): Promise<RegistroSolidaridad[]> => {
    const response = await axiosInstance.get("/solidaridad/mis-registros");
    return response.data.data || response.data;
  },
};