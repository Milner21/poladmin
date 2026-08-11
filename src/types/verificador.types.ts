export interface VerificacionAsistencia extends Record<string, unknown> {
  id: string;
  campana_id: string;
  simpatizante_id: string;
  verificado_por_id: string;
  puesto_id: string | null;
  metodo: "PIN" | "QR";
  modo_eleccion: "INTERNAS" | "GENERALES";
  fecha_verificacion: string;

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

export interface ResultadoVerificacion {
  verificacion_id: string;
  fecha_verificacion: string;
  metodo: "PIN" | "QR";
  modo_eleccion: "INTERNAS" | "GENERALES";
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

export interface VerificarAsistenciaDto {
  pin: string;
  metodo?: "PIN" | "QR";
}