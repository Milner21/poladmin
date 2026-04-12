import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateImpresoraDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  ubicacion?: string;
}