import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class ActualizarPerfilDto {
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
  username_manual?: boolean;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}