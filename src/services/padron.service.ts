import axiosInstance from "@api/axios.config";
import type {
  ResultadoCargaPadron,
  StatsPadron,
  ListadoPadron,
  TipoPadron,
  ResultadoPadronDto,
  ResumenPadron,
  DetallePadronParams,
  DetallePadronResponse,
} from "@dto/padron.types";

export const padronService = {
  cargar: async (
    archivo: File,
    tipo: TipoPadron,
    partido_id?: string,
  ): Promise<ResultadoCargaPadron> => {
    const formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("tipo", tipo);
    if (partido_id) {
      formData.append("partido_id", partido_id);
    }

    const response = await axiosInstance.post("/padron/cargar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  obtenerStats: async (): Promise<StatsPadron> => {
    const response = await axiosInstance.get("/padron/stats");
    return response.data;
  },

  obtenerListado: async (tipo: TipoPadron): Promise<ListadoPadron> => {
    const response = await axiosInstance.get(`/padron/listado/${tipo}`);
    return response.data;
  },

  buscarPorCi: async (ci: string): Promise<ResultadoPadronDto> => {
    const response = await axiosInstance.get(`/padron/buscar/${ci}`);
    return response.data;
  },

  obtenerResumen: async (tipo: TipoPadron): Promise<ResumenPadron> => {
    const response = await axiosInstance.get(`/padron/resumen/${tipo}`);
    return response.data;
  },

  obtenerPorDistrito: async (
    params: DetallePadronParams,
  ): Promise<DetallePadronResponse> => {
    const { tipo, departamento, distrito, pagina, limite, buscar } = params;

    const response = await axiosInstance.get(`/padron/distrito/${tipo}`, {
      params: {
        departamento,
        distrito,
        pagina,
        limite,
        ...(buscar && buscar.trim().length > 0
          ? { buscar: buscar.trim() }
          : {}),
      },
    });
    return response.data;
  },
};
