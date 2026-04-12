import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class ActualizarPermisoDto  {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsUUID()
  @IsOptional()
  nivel_id?: string;

  @IsBoolean()
  @IsOptional()
  es_operativo?: boolean;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}