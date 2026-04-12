import { IsString, IsUUID, IsDateString, IsOptional, MinLength } from 'class-validator';

export class RegistrarPasajeroDto {
  @IsUUID()
  transportista_id: string;

  @IsString()
  @MinLength(3, { message: 'El documento debe tener al menos 3 caracteres' })
  documento: string; // CI a buscar en padrón/simpatizantes

  @IsDateString()
  @IsOptional()
  hora_recogida?: string; // Hora estimada de recogida
}