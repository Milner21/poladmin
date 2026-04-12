export class ResultadoPadronDto {
  ci: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  departamento: string | null;
  distrito: string | null;
  seccional: string | null; // solo en padrón interno
  local_votacion: string | null;
  mesa: string | null;
  orden: string | null;
  es_afiliado: boolean; // true si viene de padron_interno
}