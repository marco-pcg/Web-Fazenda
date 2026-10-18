import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OperadorRestricao } from '../../domain/entities/restricao.entity.js';

class CoeficienteRestricaoDto {
  @IsString()
  @IsNotEmpty()
  variavelId: string;

  @IsNumber()
  coeficiente: number;
}

export class CriarRestricaoDto {
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoeficienteRestricaoDto)
  coeficientes: CoeficienteRestricaoDto[];

  @IsEnum(OperadorRestricao)
  operador: OperadorRestricao;

  @IsNumber()
  limite: number;
}