import { IsString, IsNotEmpty, IsOptional, IsUUID, MinLength, IsArray } from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsNotEmpty()
  documento: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsUUID()
  @IsNotEmpty()
  perfil_id: string;

  @IsUUID()
  @IsOptional()
  nivel_id?: string;

  @IsUUID()
  @IsOptional()
  candidato_superior_id?: string;

  @IsUUID()
  @IsOptional()
  campana_id?: string; 

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  permisos_ids?: string[]; 
}