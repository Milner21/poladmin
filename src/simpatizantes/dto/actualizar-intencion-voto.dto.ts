import { IsString, IsIn } from 'class-validator';

export class ActualizarIntencionVotoDto {
  @IsString()
  @IsIn(['SEGURO', 'PROBABLE', 'INDECISO', 'CONTRARIO'])
  intencion_voto: 'SEGURO' | 'PROBABLE' | 'INDECISO' | 'CONTRARIO';
}