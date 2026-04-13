export interface Nivel {
  id: string;
  nombre: string;
  orden: number;
  descripcion?: string;
  permite_operadores: boolean;
  exclusivo_root: boolean; // ← AGREGAR
  estado: boolean;
  creado_por_id?: string | null;
  fecha_registro?: string;
  fecha_actualizacion?: string;
}

export interface CreateNivelDto {
  nombre: string;
  orden: number;
  descripcion?: string;
  permite_operadores?: boolean;
  exclusivo_root?: boolean; // ← AGREGAR
}

export interface UpdateNivelDto {
  nombre?: string;
  orden?: number;
  descripcion?: string;
  permite_operadores?: boolean;
  exclusivo_root?: boolean; // ← AGREGAR
  estado?: boolean;
}