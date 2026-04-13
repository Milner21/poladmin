import axiosInstance from "@api/axios.config";
import type {
  ConfiguracionTransporte,
  ConfirmarPasajeroDto,
  CreateTransportistaDto,
  EstadoConfirmacion,
  LoteConfirmacion,
  LoteConfirmado,
  PasajeroTransporte,
  RegistrarPasajeroDto,
  ResolverVerificacionDto,
  ResultadoConfirmacionLote,
  SolicitarVerificacionDto,
  TicketTransporte,
  Transportista,
  UpdateConfiguracionTransporteDto,
  UpdateTransportistaDto,
  VerificacionTransporte,
} from "@dto/transporte.types";

export const transportesService = {
  // ==========================================
  // TRANSPORTISTAS
  // ==========================================
  getAllTransportistas: async (): Promise<Transportista[]> => {
    const response = await axiosInstance.get("/transportes/transportistas");
    return response.data.data || response.data;
  },

  getTransportistaById: async (id: string): Promise<Transportista> => {
    const response = await axiosInstance.get(
      `/transportes/transportistas/${id}`,
    );
    return response.data.data || response.data;
  },

  crearTransportista: async (
    data: CreateTransportistaDto,
  ): Promise<Transportista> => {
    const response = await axiosInstance.post(
      "/transportes/transportistas",
      data,
    );
    return response.data.data || response.data;
  },

  actualizarTransportista: async (
    id: string,
    data: UpdateTransportistaDto,
  ): Promise<Transportista> => {
    const response = await axiosInstance.patch(
      `/transportes/transportistas/${id}`,
      data,
    );
    return response.data.data || response.data;
  },

  eliminarTransportista: async (id: string): Promise<Transportista> => {
    const response = await axiosInstance.delete(
      `/transportes/transportistas/${id}`,
    );
    return response.data.data || response.data;
  },

  // ==========================================
  // PASAJEROS
  // ==========================================
  getAllPasajeros: async (
    transportistaId?: string,
  ): Promise<PasajeroTransporte[]> => {
    const params = transportistaId ? { transportista_id: transportistaId } : {};
    const response = await axiosInstance.get("/transportes/pasajeros", {
      params,
    });
    return response.data.data || response.data;
  },

  registrarPasajero: async (
    data: RegistrarPasajeroDto,
  ): Promise<PasajeroTransporte> => {
    const response = await axiosInstance.post("/transportes/pasajeros", data);
    return response.data.data || response.data;
  },

  confirmarPasajero: async (
    data: ConfirmarPasajeroDto,
  ): Promise<PasajeroTransporte> => {
    const response = await axiosInstance.patch(
      "/transportes/pasajeros/confirmar",
      data,
    );
    return response.data.data || response.data;
  },

  getTicketPasajero: async (id: string): Promise<TicketTransporte> => {
    const response = await axiosInstance.get(
      `/transportes/pasajeros/${id}/ticket`,
    );
    return response.data.data || response.data;
  },

  getPasajerosAtrasados: async (): Promise<PasajeroTransporte[]> => {
    const response = await axiosInstance.get(
      "/transportes/pasajeros-atrasados",
    );
    return response.data.data || response.data;
  },

  eliminarPasajero: async (
    pasajeroId: string,
  ): Promise<{ mensaje: string }> => {
    const response = await axiosInstance.delete(
      `/transportes/pasajeros/${pasajeroId}`,
    );
    return response.data;
  },

  // ==========================================
  // VERIFICACIONES
  // ==========================================
  getAllVerificaciones: async (
    estado?: string,
  ): Promise<VerificacionTransporte[]> => {
    const params = estado ? { estado } : {};
    const response = await axiosInstance.get("/transportes/verificaciones", {
      params,
    });
    return response.data.data || response.data;
  },

  solicitarVerificacion: async (
    data: SolicitarVerificacionDto,
  ): Promise<VerificacionTransporte> => {
    const response = await axiosInstance.post(
      "/transportes/verificaciones",
      data,
    );
    return response.data.data || response.data;
  },

  resolverVerificacion: async (
    id: string,
    data: ResolverVerificacionDto,
  ): Promise<VerificacionTransporte> => {
    const response = await axiosInstance.patch(
      `/transportes/verificaciones/${id}/resolver`,
      data,
    );
    return response.data.data || response.data;
  },

  // ==========================================
  // CONFIRMACIÓN MASIVA DE VIAJE (CON LOTES)
  // ==========================================
  generarLoteConfirmacion: async (
    transportistaId: string,
  ): Promise<LoteConfirmacion> => {
    const response = await axiosInstance.post(
      "/transportes/generar-lote-confirmacion",
      {
        transportista_id: transportistaId,
      },
    );
    return response.data.data || response.data;
  },

  confirmarLote: async (
    hashLote: string,
  ): Promise<ResultadoConfirmacionLote> => {
    const response = await axiosInstance.patch(
      `/transportes/confirmar-lote/${hashLote}`,
    );
    return response.data.data || response.data;
  },

  obtenerEstadoConfirmacion: async (
    transportistaId: string,
  ): Promise<EstadoConfirmacion> => {
    const response = await axiosInstance.get(
      `/transportes/transportistas/${transportistaId}/estado-confirmacion`,
    );
    return response.data.data || response.data;
  },

  // ==========================================
  // CONFIGURACIÓN
  // ==========================================
  getConfiguracion: async (): Promise<ConfiguracionTransporte> => {
    const response = await axiosInstance.get("/transportes/configuracion");
    return response.data.data || response.data;
  },

  actualizarConfiguracion: async (
    data: UpdateConfiguracionTransporteDto,
  ): Promise<ConfiguracionTransporte> => {
    const response = await axiosInstance.patch(
      "/transportes/configuracion",
      data,
    );
    return response.data.data || response.data;
  },

  getMiTransportista: async (): Promise<Transportista> => {
    const response = await axiosInstance.get("/transportes/mi-transportista");
    return response.data.data || response.data;
  },

  getMisConfirmaciones: async (): Promise<LoteConfirmado[]> => {
    const response = await axiosInstance.get("/transportes/mis-confirmaciones");
    return response.data.data || response.data;
  },
};
