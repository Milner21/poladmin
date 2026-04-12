import { IsUUID, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CrearAsistenciaDto {
  @IsUUID()
  @IsNotEmpty()
  evento_id: string;

  @IsUUID()
  @IsNotEmpty()
  simpatizante_id: string;

  @IsBoolean()
  @IsOptional()
  confirmado_previamente?: boolean;

  @IsBoolean()
  @IsOptional()
  asistio?: boolean;
}