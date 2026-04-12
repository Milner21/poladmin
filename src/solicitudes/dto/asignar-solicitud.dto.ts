import { IsUUID, IsOptional, IsString } from 'class-validator';

export class AsignarSolicitudDto {
  @IsUUID()
  asignado_a_id: string;

  @IsString()
  @IsOptional()
  comentario?: string;
}