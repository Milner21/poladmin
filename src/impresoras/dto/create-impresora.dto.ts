import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class CreateImpresoraDto {
  @IsString()
  @MaxLength(20)
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'El código solo puede contener letras mayúsculas, números y guiones',
  })
  codigo: string;

  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  ubicacion?: string;
}