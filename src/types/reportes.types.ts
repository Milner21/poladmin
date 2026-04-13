export interface FiltrosReporte {
  campana_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  departamento?: string;
  distrito?: string;
  barrio?: string;
  candidato_id?: string;
  lider_id?: string;
  agrupacion?: 'dia' | 'semana' | 'mes';
}

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