import { IsString, IsUUID, IsOptional, MinLength } from 'class-validator';

export class SolicitarVerificacionDto {
  @IsUUID()
  transportista_id: string;

  @IsString()
  @MinLength(3, { message: 'El documento debe tener al menos 3 caracteres' })
  documento_buscado: string;

  @IsString()
  @IsOptional()
  nombre_referencia?: string; // Lo que dice el transportista

  @IsString()
  @IsOptional()
  apellido_referencia?: string; // Lo que dice el transportista
}