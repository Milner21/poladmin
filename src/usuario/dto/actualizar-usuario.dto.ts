import { IsString, IsOptional, IsBoolean, IsUUID, IsArray } from 'class-validator';

export class ActualizarUsuarioDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsUUID()
  @IsOptional()
  perfil_id?: string;

  @IsUUID()
  @IsOptional()
  nivel_id?: string;

  @IsUUID()
  @IsOptional()
  candidato_superior_id?: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  permisos_ids?: string[];
}