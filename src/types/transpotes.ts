import type { VoterData } from "./votantes";

export interface Candidato {
  id: string;
  nombre: string;
  apellido: string;
  partido: string;
  activo: boolean;
}

// Para el manejo interno del componente
export interface FormattedVoterData extends Omit<VoterData, 'sexo'> {
  sexo: string; // En mayúsculas para mostrar en tabla
}

export interface TransporteData {
  // Paso 1: Líder/Candidato
  tipo_contrato: 'lider' | 'candidato';
  lider_id?: string;
  candidato_id?: string;
  
  // Paso 2: Datos personales y vehículo
  conductor_ci: string;
  conductor_nombre: string;
  conductor_apellido: string;
  conductor_telefono: string;
  vehiculo_tipo: 'carro' | 'moto' | 'autobus' | 'camioneta';
  vehiculo_placa: string;
  vehiculo_marca: string;
  vehiculo_modelo: string;
  vehiculo_color: string;
  capacidad_pasajeros: number;
  
  // Paso 3: Votantes (se llena automáticamente)
  votantes: VoterData[];
}

export interface SavedTransporteData extends Omit<TransporteData, 'votantes'> {
  id: string;
  created_at: string;
  registered_by: string;
  updated_at?: string;
  updated_by?: string;
  total_votantes: number;
}