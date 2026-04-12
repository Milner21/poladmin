import { IsString, IsUUID, IsEnum, IsInt, IsOptional, MinLength, Min } from 'class-validator';

export enum TipoVehiculo {
  AUTO = 'AUTO',
  SUV = 'SUV',
  FURGON = 'FURGON',
  OMNIBUS = 'OMNIBUS',
  OTRO = 'OTRO',
}

export class CreateTransportistaDto {
  @IsUUID()
  @IsOptional()
  usuario_id?: string; // Si es un usuario del sistema con perfil TRANSPORTISTA

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  apellido: string;

  @IsString()
  @MinLength(3, { message: 'El documento debe tener al menos 3 caracteres' })
  documento: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsEnum(TipoVehiculo)
  tipo_vehiculo: TipoVehiculo;

  @IsString()
  @IsOptional()
  marca_vehiculo?: string;

  @IsString()
  @MinLength(3, { message: 'La chapa del vehículo debe tener al menos 3 caracteres' })
  chapa_vehiculo: string;

  @IsInt()
  @Min(1, { message: 'La capacidad debe ser al menos 1 pasajero' })
  capacidad_pasajeros: number;
}