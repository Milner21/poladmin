import { IsString, IsNotEmpty, IsIn, IsOptional, IsUUID } from 'class-validator';

export class CargaPadronDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['INTERNO', 'GENERAL'])
  tipo: 'INTERNO' | 'GENERAL';

  @IsUUID()
  @IsOptional()
  partido_id?: string;
}

export class ResultadoPadronDto {
  ci: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string | null;
  departamento: string | null;
  distrito: string | null;
  seccional: string | null;
  local_votacion: string | null;
  mesa: string | null;
  orden: string | null;
  es_afiliado: boolean;
}