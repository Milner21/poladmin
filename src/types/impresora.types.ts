export interface Impresora extends Record<string, unknown> {
  id: string;
  campana_id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  ubicacion: string | null;
  estado: "CONECTADA" | "DESCONECTADA";
  ip_ultima: string | null;
  hostname_ultimo: string | null;
  ultima_conexion: string | null;
  creado_en: string;
  creado_por_id: string;

  campana?: {
    id: string;
    nombre: string;
  };
  creado_por?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  usuarios?: UsuarioImpresora[];
  trabajos?: TrabajoImpresion[];
  _count?: {
    trabajos: number;
  };
}

export interface UsuarioImpresora extends Record<string, unknown> {
  id: string;
  usuario_id: string;
  impresora_id: string;
  es_principal: boolean;
  creado_en: string;

  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
    username: string;
  };
  impresora?: Impresora;
}

export interface TrabajoImpresion extends Record<string, unknown> {
  id: string;
  impresora_id: string;
  usuario_id: string;
  tipo: "TICKET_TRANSPORTE" | "TICKET_PADRON" | "REPORTE";
  datos: Record<string, unknown>;
  estado: "PENDIENTE" | "ENVIADO" | "COMPLETADO" | "FALLIDO";
  error: string | null;
  creado_en: string;
  procesado_en: string | null;

  impresora?: Impresora;
  usuario?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface CreateImpresoraDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
}

export interface UpdateImpresoraDto {
  nombre?: string;
  descripcion?: string;
  ubicacion?: string;
}

export interface AsignarUsuarioDto {
  usuario_id: string;
  impresora_id: string;
  es_principal?: boolean;
}

export interface CrearTrabajoDto {
  tipo: string;
  datos: Record<string, unknown>;
}

export interface EstadisticasImpresionesDto {
  total_impresiones_hoy: number;
  total_impresiones_acumulado: number;
  total_ticket_padron: number;
  total_ticket_transporte: number;
}

export interface ReporteUsuarioImpresion extends Record<string, unknown> {
  usuario_id: string;
  nombre: string;
  apellido: string;
  perfil: string;
  total_ticket_padron: number;
  total_ticket_transporte: number;
  total_impresiones: number;
  ultima_impresion: string | null;
}

export interface ImprimirLoteFiltros {
  candidato_id?: string;
  lider_id?: string;
  registrado_por_id?: string;
  barrio?: string;
  local_votacion?: string;
  solo_pendientes?: boolean;
  modo_eleccion?: 'INTERNAS' | 'GENERALES';
}

export interface SimpatizantePreviewLote {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  barrio: string | null;
  local_votacion: string | null;
  mesa: string | null;
  orden: string | null;
  ticket_impreso: boolean;
  candidato: string | null;
}

export interface LotePreviewResponse {
  total: number;
  modo_eleccion: 'INTERNAS' | 'GENERALES';
  simpatizantes: SimpatizantePreviewLote[];
}

export interface ImprimirLoteResponse {
  total: number;
  exitosos: number;
  fallidos: number;
  mensaje: string;
}