export interface Partido {
  id: string;
  nombre: string;
  sigla: string;
  descripcion: string | null;
  estado: boolean;
  fecha_registro: string;
  _count?: {
    campanas: number;
    padron_interno: number;
  };
  [key: string]: unknown;
}

export interface CreatePartidoDto {
  nombre: string;
  sigla: string;
  descripcion?: string;
}

export interface UpdatePartidoDto {
  nombre?: string;
  sigla?: string;
  descripcion?: string;
  estado?: boolean;
}