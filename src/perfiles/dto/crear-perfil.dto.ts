import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CrearPerfilDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsUUID()
  @IsOptional()
  nivel_id?: string;

  @IsBoolean()
  @IsOptional()
  es_operativo?: boolean;

  @IsBoolean()
  @IsOptional()
  username_manual?: boolean;
}