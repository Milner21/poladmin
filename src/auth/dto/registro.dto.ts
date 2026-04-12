import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class RegistroDto {
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
  @IsNotEmpty()
  password: string;

  @IsUUID()
  @IsNotEmpty()
  perfil_id: string;

  @IsUUID()
  @IsOptional()
  candidato_superior_id?: string;
}