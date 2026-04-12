import { IsString, IsEnum, IsInt, IsOptional, IsBoolean, MinLength, Min } from 'class-validator';
import { TipoVehiculo } from './create-transportista.dto';

export class UpdateTransportistaDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @IsOptional()
  nombre?: string;

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEnum(TipoVehiculo)
  @IsOptional()
  tipo_vehiculo?: TipoVehiculo;

  @IsString()
  @IsOptional()
  marca_vehiculo?: string;

  @IsString()
  @MinLength(3, { message: 'La chapa del vehículo debe tener al menos 3 caracteres' })
  @IsOptional()
  chapa_vehiculo?: string;

  @IsInt()
  @Min(1, { message: 'La capacidad debe ser al menos 1 pasajero' })
  @IsOptional()
  capacidad_pasajeros?: number;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}