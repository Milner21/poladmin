export type TipoContacto = 'LLAMADA' | 'VISITA' | 'WHATSAPP' | 'EVENTO';
export type ResultadoContacto = 'EXITOSO' | 'NO_CONTESTA' | 'RECHAZA' | 'PENDIENTE';
export type IntencionVoto = 'SEGURO' | 'PROBABLE' | 'INDECISO' | 'CONTRARIO';

export interface Seguimiento {
  id: string;
  simpatizante_id: string;
  usuario_id: string;
  tipo_contacto: TipoContacto;
  resultado: ResultadoContacto;
  intencion_voto: IntencionVoto | null;
  observaciones: string | null;
  fecha_contacto: string;
  usuario: {
    id: string;
    nombre: string;
    apellido: string;
    username: string;
  } | null;
}

export interface CrearSeguimientoDto {
  simpatizante_id: string;
  tipo_contacto: TipoContacto;
  resultado: ResultadoContacto;
  intencion_voto?: IntencionVoto;
  observaciones?: string;
}

export interface EstadisticasSeguimiento {
  total_simpatizantes: number;
  total_contactados: number;
  pendientes_contacto: number;
  seguimientos_hoy: number;
  por_resultado: Array<{
    resultado: string;
    cantidad: number;
  }>;
}