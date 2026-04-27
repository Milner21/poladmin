import axiosInstance from "@api/axios.config";
import type {
  FiltrosLocalesVotacion,
  FiltrosReporte,
  LocalesVotacionResponse,
  ReporteCaptacion,
  ReporteMapaCalor,
  ReporteRedJerarquicaResponse,
  ReporteSimpatizantesResponse,
  ReporteUsuariosResponse,
  TopRegistrador,
} from "@dto/reportes.types";

export const reportesService = {
  getCaptacion: async (filtros: FiltrosReporte): Promise<ReporteCaptacion> => {
    console.log("🔍 Llamando getCaptacion con filtros:", filtros);
    const params = new URLSearchParams();

    if (filtros.campana_id) params.append("campana_id", filtros.campana_id);
    if (filtros.fecha_desde) params.append("fecha_desde", filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append("fecha_hasta", filtros.fecha_hasta);
    if (filtros.departamento)
      params.append("departamento", filtros.departamento);
    if (filtros.distrito) params.append("distrito", filtros.distrito);
    if (filtros.barrio) params.append("barrio", filtros.barrio);
    if (filtros.candidato_id)
      params.append("candidato_id", filtros.candidato_id);
    if (filtros.lider_id) params.append("lider_id", filtros.lider_id);
    if (filtros.agrupacion) params.append("agrupacion", filtros.agrupacion);

    console.log("🔍 URL final:", `/reportes/captacion?${params.toString()}`);

    const response = await axiosInstance.get(
      `/reportes/captacion?${params.toString()}`,
    );
    return response.data;
  },

  getMapaCalor: async (filtros: FiltrosReporte): Promise<ReporteMapaCalor> => {
    const params = new URLSearchParams();

    if (filtros.campana_id) params.append("campana_id", filtros.campana_id);
    if (filtros.departamento)
      params.append("departamento", filtros.departamento);
    if (filtros.distrito) params.append("distrito", filtros.distrito);
    if (filtros.barrio) params.append("barrio", filtros.barrio);

    const response = await axiosInstance.get(
      `/reportes/mapa-calor?${params.toString()}`,
    );
    return response.data;
  },

  getTopRegistradores: async (
    filtros: FiltrosReporte,
  ): Promise<TopRegistrador[]> => {
    const params = new URLSearchParams();

    if (filtros.campana_id) params.append("campana_id", filtros.campana_id);
    if (filtros.fecha_desde) params.append("fecha_desde", filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append("fecha_hasta", filtros.fecha_hasta);

    const response = await axiosInstance.get(
      `/reportes/top-registradores?${params.toString()}`,
    );
    return response.data;
  },

  getUsuarios: async (
    filtros: FiltrosReporte,
  ): Promise<ReporteUsuariosResponse> => {
    const params = new URLSearchParams();

    if (filtros.campana_id) params.append("campana_id", filtros.campana_id);
    if (filtros.perfil_id) params.append("perfil_id", filtros.perfil_id);
    if (filtros.nivel_id) params.append("nivel_id", filtros.nivel_id);
    if (filtros.estado !== undefined)
      params.append("estado", String(filtros.estado));
    if (filtros.candidato_superior_id)
      params.append("candidato_superior_id", filtros.candidato_superior_id);
    if (filtros.fecha_registro_desde)
      params.append("fecha_registro_desde", filtros.fecha_registro_desde);
    if (filtros.fecha_registro_hasta)
      params.append("fecha_registro_hasta", filtros.fecha_registro_hasta);
    if (filtros.tiene_telefono !== undefined)
      params.append("tiene_telefono", String(filtros.tiene_telefono));
    if (filtros.tiene_nivel !== undefined)
      params.append("tiene_nivel", String(filtros.tiene_nivel));

    const response = await axiosInstance.get(
      `/reportes/usuarios?${params.toString()}`,
    );
    return response.data;
  },

  getSimpatizantes: async (
    filtros: FiltrosReporte,
  ): Promise<ReporteSimpatizantesResponse> => {
    const params = new URLSearchParams();

    if (filtros.campana_id) params.append("campana_id", filtros.campana_id);
    if (filtros.candidato_id)
      params.append("candidato_id", filtros.candidato_id);
    if (filtros.departamento)
      params.append("departamento", filtros.departamento);
    if (filtros.distrito) params.append("distrito", filtros.distrito);
    if (filtros.barrio) params.append("barrio", filtros.barrio);
    if (filtros.fecha_desde) params.append("fecha_desde", filtros.fecha_desde);
    if (filtros.fecha_hasta) params.append("fecha_hasta", filtros.fecha_hasta);
    if (filtros.intencion_voto)
      params.append("intencion_voto", filtros.intencion_voto);
    if (filtros.es_afiliado !== undefined)
      params.append("es_afiliado", String(filtros.es_afiliado));
    if (filtros.necesita_transporte !== undefined)
      params.append("necesita_transporte", String(filtros.necesita_transporte));
    if (filtros.origen_registro)
      params.append("origen_registro", filtros.origen_registro);

    const response = await axiosInstance.get(
      `/reportes/simpatizantes?${params.toString()}`,
    );
    return response.data;
  },

  getRedJerarquica: async (
    filtros: FiltrosReporte,
  ): Promise<ReporteRedJerarquicaResponse> => {
    const params = new URLSearchParams();

    if (filtros.campana_id) params.append("campana_id", filtros.campana_id);

    const response = await axiosInstance.get(
      `/reportes/usuarios-red?${params.toString()}`,
    );
    return response.data;
  },

  getLocalesVotacion: async (
    filtros: FiltrosLocalesVotacion,
  ): Promise<LocalesVotacionResponse> => {
    const params = new URLSearchParams();

    if (filtros.campana_id) params.append("campana_id", filtros.campana_id);
    if (filtros.candidato_id)
      params.append("candidato_id", filtros.candidato_id);

    const response = await axiosInstance.get(
      `/reportes/locales-votacion?${params.toString()}`,
    );
    return response.data;
  },
};
