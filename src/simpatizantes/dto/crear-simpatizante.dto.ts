import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean, IsNumber, IsIn } from 'class-validator';

export class CrearSimpatizanteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  documento: string;

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

  // DATOS POLITICOS
  @IsBoolean()
  @IsOptional()
  es_afiliado?: boolean;

  @IsString()
  @IsOptional()
  intencion_voto?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  // LOGISTICA
  @IsBoolean()
  @IsOptional()
  necesita_transporte?: boolean;

  @IsNumber()
  @IsOptional()
  latitud?: number;

  @IsNumber()
  @IsOptional()
  longitud?: number;

  // JERARQUIA
  @IsUUID()
  @IsOptional()
  lider_id?: string;

  @IsUUID()
  @IsOptional()
  candidato_id?: string;

  // ORIGEN DEL REGISTRO
  @IsString()
  @IsOptional()
  @IsIn(['PADRON_INTERNO', 'PADRON_GENERAL', 'MANUAL'])
  origen_registro?: 'PADRON_INTERNO' | 'PADRON_GENERAL' | 'MANUAL';

  // CONFIRMACION DE DUPLICADO
  @IsBoolean()
  @IsOptional()
  confirmar_duplicado?: boolean;
}