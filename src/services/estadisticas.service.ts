// src/services/estadisticas.service.ts

import axiosInstance from "@api/axios.config";
import type { RespuestaApiDiaD } from "@dto/estadisticas.types";

export const estadisticasService = {
  obtenerDiaD: async (): Promise<RespuestaApiDiaD> => {
    const respuesta = await axiosInstance.get<RespuestaApiDiaD>(
      "/estadisticas/dia-d"
    );
    return respuesta.data;
  },
};