import { IsUUID, IsNotEmpty } from 'class-validator';

export class AsignarPermisoPersonalizadoDto {
  @IsUUID()
  @IsNotEmpty()
  usuario_id: string;

  @IsUUID()
  @IsNotEmpty()
  permiso_id: string;
}