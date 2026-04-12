import { IsString, IsOptional, IsUUID, IsBoolean, IsNumber } from 'class-validator';

export class ActualizarSimpatizanteDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  fecha_nacimiento?: string;

  // DATOS ELECTORALES - COMPARTIDOS
  @IsString()
  @IsOptional()
  departamento?: string;

  @IsString()
  @IsOptional()
  distrito?: string;

  @IsString()
  @IsOptional()
  barrio?: string;

  // DATOS ELECTORALES - INTERNAS
  @IsString()
  @IsOptional()
  seccional_interna?: string;

  @IsString()
  @IsOptional()
  local_votacion_interna?: string;

  @IsString()
  @IsOptional()
  mesa_votacion_interna?: string;

  @IsString()
  @IsOptional()
  orden_votacion_interna?: string;

  // DATOS ELECTORALES - GENERALES
  @IsString()
  @IsOptional()
  local_votacion_general?: string;

  @IsString()
  @IsOptional()
  mesa_votacion_general?: string;

  @IsString()
  @IsOptional()
  orden_votacion_general?: string;

  // DATOS POLÍTICOS
  @IsBoolean()
  @IsOptional()
  es_afiliado?: boolean;

  @IsString()
  @IsOptional()
  intencion_voto?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  // LOGÍSTICA
  @IsBoolean()
  @IsOptional()
  necesita_transporte?: boolean;

  @IsNumber()
  @IsOptional()
  latitud?: number;

  @IsNumber()
  @IsOptional()
  longitud?: number;

  // JERARQUÍA
  @IsUUID()
  @IsOptional()
  lider_id?: string;

  @IsUUID()
  @IsOptional()
  candidato_id?: string;
}