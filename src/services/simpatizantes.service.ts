//src/services/simpatizantes.service.ts

import axiosInstance from "@api/axios.config";
import type {
  ResultadoBusquedaInteligente,
  ResultadoPadronDto,
} from "@dto/padron.types";
import type {
  CreateSimpatizanteDto,
  DuplicadoSimpatizante,
  ResultadoDuplicadosPorSimpatizante,
  Simpatizante,
  SimpatizanteDetalle,
} from "@dto/simpatizante.types";

export interface RespuestaDuplicadoRegistrado {
  duplicado_registrado: true;
  simpatizante_id: string;
  mensaje: string;
}

export interface ErrorDuplicado {
  codigo:
    | "SIMPATIZANTE_DUPLICADO_NO_PERMITIDO"
    | "SIMPATIZANTE_DUPLICADO_CONFIRMABLE";
  mensaje: string;
  simpatizante_id: string;
}

export const simpatizantesService = {
  buscarPadron: async (ci: string): Promise<ResultadoPadronDto> => {
    const response = await axiosInstance.get(
      `/simpatizantes/buscar-padron/${ci}`,
    );
    return response.data;
  },

  busquedaInteligente: async (
    ci: string,
  ): Promise<ResultadoBusquedaInteligente> => {
    const response = await axiosInstance.get(
      `/simpatizantes/busqueda-inteligente/${ci}`,
    );
    return response.data;
  },

  crear: async (
    data: CreateSimpatizanteDto,
  ): Promise<Simpatizante | RespuestaDuplicadoRegistrado> => {
    const response = await axiosInstance.post("/simpatizantes", data);
    return response.data.data || response.data;
  },

  crearParaTercero: async (
    paraUsuarioId: string,
    datos: CreateSimpatizanteDto,
  ): Promise<Simpatizante | RespuestaDuplicadoRegistrado> => {
    const response = await axiosInstance.post(
      `/simpatizantes/para/${paraUsuarioId}`,
      datos,
    );
    return response.data.data || response.data;
  },

  actualizar: async (
    id: string,
    data: {
      nombre?: string;
      apellido?: string;
      telefono?: string;
      fecha_nacimiento?: string;
      departamento?: string;
      distrito?: string;
      barrio?: string;
      seccional_interna?: string;
      local_votacion_interna?: string;
      mesa_votacion_interna?: string;
      orden_votacion_interna?: string;
      local_votacion_general?: string;
      mesa_votacion_general?: string;
      orden_votacion_general?: string;
      es_afiliado?: boolean;
      intencion_voto?: string;
      observaciones?: string;
      necesita_transporte?: boolean;
      latitud?: number | null;
      longitud?: number | null;
    },
  ): Promise<{ mensaje: string }> => {
    const response = await axiosInstance.put(`/simpatizantes/${id}`, data);
    return response.data;
  },

  getAll: async (soloPropios?: boolean): Promise<Simpatizante[]> => {
    const params = soloPropios ? "?solo_propios=true" : "";
    const response = await axiosInstance.get(`/simpatizantes${params}`);
    return response.data.data || response.data;
  },

  actualizarIntencionVoto: async (
    id: string,
    intencion_voto: string,
  ): Promise<Simpatizante> => {
    const response = await axiosInstance.patch(
      `/simpatizantes/${id}/intencion-voto`,
      { intencion_voto },
    );
    return response.data;
  },

  getDuplicados: async (): Promise<DuplicadoSimpatizante[]> => {
    const response = await axiosInstance.get("/simpatizantes/duplicados");
    return response.data.data || response.data;
  },
  eliminarDuplicado: async (
    duplicadoId: string,
  ): Promise<{ mensaje: string }> => {
    const response = await axiosInstance.delete(
      `/simpatizantes/duplicados/${duplicadoId}`,
    );
    return response.data;
  },

  resolverDuplicado: async (
    duplicadoId: string,
    forzar?: boolean,
  ): Promise<{ mensaje: string }> => {
    const response = await axiosInstance.patch(
      `/simpatizantes/duplicados/${duplicadoId}/resolver`,
      { forzar: forzar ?? false },
    );
    return response.data;
  },

  revertirResolucion: async (
    duplicadoId: string,
  ): Promise<{ mensaje: string }> => {
    const response = await axiosInstance.patch(
      `/simpatizantes/duplicados/${duplicadoId}/revertir`,
    );
    return response.data;
  },

  getDuplicadosPorSimpatizante: async (
    simpatizanteId: string,
  ): Promise<ResultadoDuplicadosPorSimpatizante> => {
    const response = await axiosInstance.get(
      `/simpatizantes/duplicados/por-simpatizante/${simpatizanteId}`,
    );
    return response.data;
  },

  getById: async (id: string): Promise<SimpatizanteDetalle> => {
    const response = await axiosInstance.get(`/simpatizantes/${id}`);
    return response.data;
  },

  getByUsuario: async (
    usuarioId: string,
  ): Promise<{
    usuario: {
      id: string;
      nombre: string;
      apellido: string;
      username: string;
      nivel: { id: string; nombre: string; orden: number } | null;
      perfil: { id: string; nombre: string; es_operativo: boolean };
    };
    simpatizantes: Simpatizante[];
    total: number;
  }> => {
    const response = await axiosInstance.get(
      `/simpatizantes/por-usuario/${usuarioId}`,
    );
    return response.data;
  },

  getByCandidato: async (
    candidatoId: string,
  ): Promise<{
    usuario: {
      id: string;
      nombre: string;
      apellido: string;
      username: string;
      nivel: { id: string; nombre: string; orden: number } | null;
      perfil: { id: string; nombre: string; es_operativo: boolean };
    };
    simpatizantes: Simpatizante[];
    total: number;
  }> => {
    const response = await axiosInstance.get(
      `/simpatizantes/por-candidato/${candidatoId}`,
    );
    return response.data;
  },

  eliminar: async (id: string): Promise<{ mensaje: string }> => {
    const response = await axiosInstance.delete(`/simpatizantes/${id}`);
    return response.data;
  },

  marcarVoto: async (simpatizanteId: string): Promise<{ mensaje: string }> => {
    const response = await axiosInstance.patch(
      `/simpatizantes/${simpatizanteId}/marcar-voto`,
    );
    return response.data;
  },

  consultarVoto: async (
    ci: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      nombre: string;
      apellido: string;
      documento: string;
      modo_eleccion: "INTERNAS" | "GENERALES";
      voto: boolean;
      fecha_voto: string | null;
      local_votacion: string | null;
      mesa_votacion: string | null;
      orden_votacion: string | null;
      datos_padron_disponibles: boolean;
      mensaje_padron: string | null;
    } | null;
  }> => {
    const response = await axiosInstance.get(
      `/simpatizantes/consulta-voto/${ci}`,
    );
    return response.data;
  },

  // Pegar antes del }; que cierra simpatizantesService

  getEstadisticasVotacion: async (): Promise<{
    success: boolean;
    data: {
      total_simpatizantes: number;
      votantes_internas: number;
      votantes_generales: number;
      votantes_ambas: number;
      pendientes_internas: number;
      pendientes_generales: number;
      votantes_hoy_internas: number;
      votantes_hoy_generales: number;
      porcentaje_participacion_internas: number;
      porcentaje_participacion_generales: number;
      porcentaje_votantes_completos: number;
    };
  }> => {
    const response = await axiosInstance.get(
      "/simpatizantes/estadisticas-votacion",
    );
    return response.data;
  },
};
