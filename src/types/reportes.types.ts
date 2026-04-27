export interface FiltrosReporte {
  campana_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  departamento?: string;
  distrito?: string;
  barrio?: string;
  candidato_id?: string;
  lider_id?: string;
  agrupacion?: "dia" | "semana" | "mes";
  // Nuevos campos para reporte de usuarios
  perfil_id?: string;
  nivel_id?: string;
  estado?: boolean | string;
  candidato_superior_id?: string;
}

// El resto de interfaces quedan igual...
export interface PeriodoReporte {
  fecha: string;
  cantidad: number;
}

export interface ReporteCaptacion {
  periodo: PeriodoReporte[];
  total_periodo: number;
  total_afiliados: number;
  total_seguros: number;
  porcentaje_afiliados: string;
  porcentaje_seguros: string;
}

export interface PuntoMapa {
  id: string;
  nombre: string;
  apellido: string;
  latitud: number;
  longitud: number;
  barrio: string | null;
  intencion_voto: string;
  es_afiliado: boolean;
  necesita_transporte: boolean;
}

export interface DensidadBarrio {
  barrio: string | null;
  cantidad: number;
}

export interface ReporteMapaCalor {
  puntos: PuntoMapa[];
  densidad_por_barrio: DensidadBarrio[];
  estadisticas: {
    total: number;
    con_gps: number;
    sin_gps: number;
    porcentaje_con_gps: string;
  };
}

export interface TopRegistrador {
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    username: string;
    perfil: {
      nombre: string;
    };
    nivel: {
      nombre: string;
      orden: number;
    } | null;
  } | null;
  cantidad: number;
}

// ==========================================
// REPORTE DE USUARIOS
// ==========================================

export interface UsuarioReporte {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  documento: string;
  telefono: string | null;
  perfil: string;
  es_operativo: boolean;
  nivel: string | null;
  nivel_orden: number | null;
  candidato_superior: string | null;
  estado: boolean;
  fecha_registro: string;
  total_simpatizantes: number;
  total_simpatizantes_red: number;
}

export interface ReporteUsuariosResponse {
  usuarios: UsuarioReporte[];
  total: number;
  filtros_aplicados: {
    perfil?: string;
    nivel?: string;
    estado?: boolean | string;
    candidato_superior?: string;
  };
}

export interface FiltrosReporteUsuarios {
  campana_id: string;
  perfil_id?: string;
  nivel_id?: string;
  estado?: boolean | string;
  candidato_superior_id?: string;
}

export interface ColumnaReporte {
  key: string;
  label: string;
  enabled: boolean;
}

// ==========================================
// REPORTE DE SIMPATIZANTES
// ==========================================

export interface SimpatizanteReporte {
  id: string;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string | null;
  departamento: string | null;
  distrito: string | null;
  barrio: string | null;
  intencion_voto: string;
  es_afiliado: boolean;
  necesita_transporte: boolean;
  origen_registro: string;
  fecha_registro: string;
  candidato: string | null;
  candidato_username: string | null;
  registrado_por: string | null;
  registrado_por_username: string | null;
  latitud: number | null;
  longitud: number | null;
  tiene_gps: boolean;
}

export interface ReporteSimpatizantesResponse {
  simpatizantes: SimpatizanteReporte[];
  total: number;
  filtros_aplicados: {
    candidato?: string;
    departamento?: string;
    distrito?: string;
    barrio?: string;
    intencion_voto?: string;
    es_afiliado?: boolean | string;
    necesita_transporte?: boolean | string;
    origen_registro?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  };
}

// Actualizar FiltrosReporte para incluir los nuevos campos
export interface FiltrosReporte {
  campana_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  departamento?: string;
  distrito?: string;
  barrio?: string;
  candidato_id?: string;
  lider_id?: string;
  agrupacion?: "dia" | "semana" | "mes";
  // Campos para usuarios
  perfil_id?: string;
  nivel_id?: string;
  estado?: boolean | string;
  candidato_superior_id?: string;
  // Nuevos campos para simpatizantes
  intencion_voto?: string;
  es_afiliado?: boolean | string;
  necesita_transporte?: boolean | string;
  origen_registro?: string;
  tiene_telefono?: boolean | string;
  tiene_nivel?: boolean | string;
  fecha_registro_desde?: string;
  fecha_registro_hasta?: string;
}

// ==========================================
// REPORTE RED JERÁRQUICA
// ==========================================

export interface UsuarioJerarquico {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  estado: boolean;
  perfil: {
    nombre: string;
    es_operativo: boolean;
  };
  nivel: {
    id: string;
    nombre: string;
    orden: number;
  } | null;
  candidato_superior: {
    id: string;
    nombre: string;
    apellido: string;
    username: string;
    nivel: {
      id: string;
      nombre: string;
      orden: number;
    } | null;
  } | null;
  subordinados_directos: UsuarioJerarquico[];
  total_simpatizantes: number;
}

export interface EstadisticaNivel {
  nivel: string;
  total: number;
  activos: number;
  inactivos: number;
  orden: number;
}

export interface ReporteRedJerarquicaResponse {
  arbol_jerarquico: UsuarioJerarquico[];
  estadisticas_por_nivel: EstadisticaNivel[];
  total_usuarios: number;
  total_niveles: number;
}

// ==========================================
// REPORTE RED JERÁRQUICA
// ==========================================

export interface UsuarioJerarquico {
  id: string;
  nombre: string;
  apellido: string;
  username: string;
  estado: boolean;
  perfil: {
    nombre: string;
    es_operativo: boolean;
  };
  nivel: {
    id: string;
    nombre: string;
    orden: number;
  } | null;
  candidato_superior: {
    id: string;
    nombre: string;
    apellido: string;
    username: string;
    nivel: {
      id: string;
      nombre: string;
      orden: number;
    } | null;
  } | null;
  subordinados_directos: UsuarioJerarquico[];
}

export interface EstadisticaNivel {
  nivel: string;
  total: number;
  activos: number;
  inactivos: number;
  orden: number;
}

export interface ReporteRedJerarquicaResponse {
  arbol_jerarquico: UsuarioJerarquico[];
  estadisticas_por_nivel: EstadisticaNivel[];
  total_usuarios: number;
  total_niveles: number;
}

// ==========================================
// LOCALES DE VOTACION
// ==========================================

export interface MesaVotacion {
  mesa: string;
  total: number;
  seguros: number;
  probables: number;
  indecisos: number;
}

export interface LocalVotacion {
  local: string;
  total: number;
  seguros: number;
  probables: number;
  indecisos: number;
  total_mesas: number;
  mesas: MesaVotacion[];
}

export interface LocalesVotacionResponse {
  modo_eleccion: string;
  total_simpatizantes: number;
  total_con_local: number;
  total_sin_local: number;
  total_locales: number;
  locales: LocalVotacion[];
}

export interface FiltrosLocalesVotacion {
  campana_id: string;
  candidato_id?: string;
}
