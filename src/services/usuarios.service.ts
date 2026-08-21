//src/services/usuarios.service.ts

import axiosInstance from "@api/axios.config";
import type {
  Usuario,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  CandidatoSuperior,
  EstadisticasUsuarios,
  VerificarUsuarioPorCiResponse,
} from "@dto/usuario.types";

export const usuariosService = {
  getAll: async (campanaId?: string): Promise<Usuario[]> => {
    const params = campanaId ? { campana_id: campanaId } : {};
    const response = await axiosInstance.get("/usuarios", { params });
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<Usuario> => {
    const response = await axiosInstance.get(`/usuarios/${id}`);
    return response.data.data || response.data;
  },

  create: async (data: CreateUsuarioDto): Promise<Usuario> => {
    const response = await axiosInstance.post("/usuarios", data);
    return response.data.data || response.data;
  },

  update: async (id: string, data: UpdateUsuarioDto): Promise<Usuario> => {
    const response = await axiosInstance.put(`/usuarios/${id}`, data);
    return response.data.data || response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/usuarios/${id}`);
  },

  cambiarPassword: async (
    id: string,
    data: { password_nuevo: string; password_actual?: string },
  ): Promise<{ mensaje: string }> => {
    const response = await axiosInstance.post(
      `/usuarios/${id}/cambiar-password`,
      data,
    );
    return response.data;
  },

  getCandidatosSuperiores: async (
    campanaId: string,
    nivelOrden: number,
  ): Promise<CandidatoSuperior[]> => {
    const response = await axiosInstance.get(
      `/usuarios/candidatos-superiores/${campanaId}/${nivelOrden}`,
    );
    return response.data;
  },

  getEstadisticas: async (campanaId: string): Promise<EstadisticasUsuarios> => {
    const response = await axiosInstance.get(
      `/usuarios/estadisticas/${campanaId}`,
    );
    return response.data;
  },

  getRedConSimpatizantes: async (): Promise<
    Array<{
      id: string;
      nombre: string;
      apellido: string;
      username: string;
      telefono: string | null;
      nivel: { id: string; nombre: string; orden: number } | null;
      perfil: {
        id: string;
        nombre: string;
        es_operativo: boolean;
        nivel: { id: string; nombre: string; orden: number } | null;
      };
      estado: boolean;
      total_simpatizantes: number;
    }>
  > => {
    const response = await axiosInstance.get("/usuarios/red/con-simpatizantes");
    return response.data;
  },

  activarParaModo: async (
    id: string,
    activo: boolean,
  ): Promise<{
    mensaje: string;
    usuario: {
      id: string;
      nombre: string;
      apellido: string;
      username: string;
      activo_internas: boolean | null;
      activo_generales: boolean | null;
    };
  }> => {
    const response = await axiosInstance.post(`/usuarios/${id}/activar-modo`, {
      activo,
    });
    return response.data;
  },

  verificarPorCi: async (
    ci: string,
  ): Promise<VerificarUsuarioPorCiResponse> => {
    const response = await axiosInstance.get(
      `/usuarios/verificar-por-ci/${encodeURIComponent(ci)}`,
    );
    return response.data;
  },
};
