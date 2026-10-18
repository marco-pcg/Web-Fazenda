import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NomeEstacao } from '../../../common/enums/enums';

export class CreateEstacaoDto {
  @ApiProperty({
    description: 'Nome da estação',
    enum: NomeEstacao,
    example: NomeEstacao.PRIMAVERA,
  })
  @IsEnum(NomeEstacao, {
    message: 'O nome deve ser PRIMAVERA, VERAO, OUTONO ou INVERNO.',
  })
  nome: NomeEstacao;

  @ApiProperty({ description: 'Ordem da estação no ano', example: 1 })
  @IsInt({ message: 'A ordem deve ser um número inteiro.' })
  @Min(1, { message: 'A ordem mínima permitida é 1.' })
  ordem: number;

  @ApiPropertyOptional({
    description: 'Multiplicador da produção na estação',
    example: 1.1,
    default: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O fator de produtividade deve ser um número.' })
  @IsPositive({ message: 'O fator de produtividade deve ser maior que zero.' })
  fator_produtividade?: number;

  @ApiPropertyOptional({
    description: 'Multiplicador do consumo de água na estação',
    example: 1.3,
    default: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O fator de água deve ser um número.' })
  @IsPositive({ message: 'O fator de água deve ser maior que zero.' })
  fator_agua?: number;
}
