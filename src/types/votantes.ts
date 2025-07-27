export interface Lider {
  id: string;
  ci: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  candidato: string;
  activo: boolean;
}

export interface VoterData {
  ci: string;
  nombre: string;
  apellido: string;
  telefono: string;
  sexo: 'masculino' | 'femenino' | 'indefinido';
  edad: number;
  barrio: string;
  lider_id: string; // ← Cambio de nombre
}

export interface FormattedVoterData {
  ci: string;
  nombre: string;
  apellido: string;
  telefono: string;
  sexo: string;
  edad: number;
  barrio: string;
  lider_id: string; // ← Cambio de nombre
}

// Nuevo: Tipo para el votante guardado en la BD
export interface SavedVoterData extends FormattedVoterData {
  id: string;
  created_at: string;
  registered_by: string; // Usuario que registró el votante
  updated_at?: string; // Fecha de última actualización (para futuras mejoras)
  updated_by?: string; // Usuario que actualizó el votante (para futuras mejoras)
}

// Nuevo: Respuesta de la función de Supabase
export interface VoterResponse {
  success: boolean;
  data?: SavedVoterData;
  error?: string;
}

// Nuevo: Respuesta del service
export interface CreateVoterResult {
  success: boolean;
  data?: SavedVoterData;
  error?: string;
  message?: string;
}