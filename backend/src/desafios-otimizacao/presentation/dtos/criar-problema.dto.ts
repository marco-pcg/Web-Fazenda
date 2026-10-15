import { IsString, IsNotEmpty, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoObjetivo } from '../../domain/entities/problema.entity.js';

export class CoeficienteDto {
  @IsString()
  @IsNotEmpty()
  variavelId: string;

  @IsNumber()
  coeficiente: number;
}

export class CriarProblemaDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  nivel: number;

  @IsEnum(TipoObjetivo)
  tipo: TipoObjetivo;

  @IsDateString()
  prazoLimite: string;

  @IsNumber()
  limiteTentativas: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoeficienteDto)
  funcaoObjetivo: CoeficienteDto[];

  @IsNumber()
  valorOtimoZ: number;
}
