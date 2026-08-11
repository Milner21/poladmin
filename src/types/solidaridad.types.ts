export interface RegistroSolidaridad extends Record<string, unknown> {
  id: string;
  campana_id: string;
  simpatizante_id: string;
  registrado_por_id: string;
  puesto_id: string | null;
  metodo: "PIN" | "QR";
  modo_eleccion: "INTERNAS" | "GENERALES";
  fecha_registro: string;
  tenia_verificacion: boolean;
  tenia_activacion: boolean;

  simpatizante?: {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
  };
  puesto?: {
    id: string;
    codigo: string;
    descripcion: string | null;
  };
}

export interface ResultadoSolidaridad {
  solidaridad_id: string;
  fecha_registro: string;
  metodo: "PIN" | "QR";
  modo_eleccion: "INTERNAS" | "GENERALES";
  tenia_activacion: boolean;
  tenia_verificacion: boolean;
  puesto: {
    id: string;
    codigo: string;
    descripcion: string | null;
  };
  simpatizante: {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
    local_votacion: string | null;
    mesa_votacion: string | null;
    orden_votacion: string | null;
  };
}

export interface RegistrarSolidaridadDto {
  pin: string;
  metodo?: "PIN" | "QR";
}