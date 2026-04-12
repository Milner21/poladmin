import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn } from 'class-validator';

export class CrearSeguimientoDto {
  @IsUUID()
  @IsNotEmpty()
  simpatizante_id: string;

  @IsString()
  @IsIn(['LLAMADA', 'VISITA', 'WHATSAPP', 'EVENTO'])
  tipo_contacto: 'LLAMADA' | 'VISITA' | 'WHATSAPP' | 'EVENTO';

  @IsString()
  @IsIn(['EXITOSO', 'NO_CONTESTA', 'RECHAZA', 'PENDIENTE'])
  resultado: 'EXITOSO' | 'NO_CONTESTA' | 'RECHAZA' | 'PENDIENTE';

  @IsString()
  @IsOptional()
  @IsIn(['SEGURO', 'PROBABLE', 'INDECISO', 'CONTRARIO'])
  intencion_voto?: 'SEGURO' | 'PROBABLE' | 'INDECISO' | 'CONTRARIO';

  @IsString()
  @IsOptional()
  observaciones?: string;
}