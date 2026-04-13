export type ModoEleccion = 'INTERNAS' | 'GENERALES';
export type NivelCampana = 'PAIS' | 'DEPARTAMENTO' | 'DISTRITO';
export type TipoCampana = 'PARTIDO' | 'MOVIMIENTO';

export interface PartidoResumen {
  id: string;
  nombre: string;
  sigla: string;
}

export interface ConfiguracionCampana {
  id: string;
  campana_id: string;
  modo_eleccion: ModoEleccion;
  permitir_duplicados_simpatizantes: boolean;
  permitir_registro_manual_fuera_padron: boolean;
}

export interface Campana {
  id: string;
  nombre: string;
  nivel_campana: NivelCampana;
  departamento: string | null;
  distrito: string | null;
  estado: boolean;
  fecha_registro: string;
  tipo_campana: TipoCampana;
  partido_id: string | null;
  configuracion: ConfiguracionCampana | null;
  partido: PartidoResumen | null;
  _count?: {
    usuarios: number;
    simpatizantes: number;
  };
  [key: string]: unknown;
}

export interface CreateCampanaDto {
  nombre: string;
  nivel_campana: NivelCampana;
  departamento?: string;
  distrito?: string;
  tipo_campana: TipoCampana;
  partido_id?: string;
  modo_eleccion?: ModoEleccion;
}

export interface UpdateCampanaDto {
  nombre?: string;
  nivel_campana?: NivelCampana;
  departamento?: string;
  distrito?: string;
  estado?: boolean;
  tipo_campana?: TipoCampana;
  partido_id?: string;
  modo_eleccion?: ModoEleccion;
}