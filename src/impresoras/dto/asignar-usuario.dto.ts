import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class AsignarUsuarioDto {
  @IsString()
  usuario_id: string;

  @IsString()
  impresora_id: string;

  @IsBoolean()
  @IsOptional()
  es_principal?: boolean;
}