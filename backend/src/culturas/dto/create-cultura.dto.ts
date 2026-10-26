import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { dtoErrors } from '../../common/errors-handler/dto-errors';

export const ESTACOES = ['primavera', 'verao', 'outono', 'inverno'];

export class CreateCulturaDto {
  @ApiProperty({ example: 'Milho' })
  @IsString({ message: dtoErrors().isNotString() })
  @IsNotEmpty({ message: dtoErrors().isEmpty() })
  nome: string;

  @ApiProperty({ example: ['primavera', 'verao'] })
  @IsArray({ message: dtoErrors().isNotArray() })
  @IsIn(ESTACOES, { each: true })
  estacoes: string[];

  @ApiProperty({ example: 1, description: 'Canteiros por unidade' })
  @IsInt({ message: dtoErrors().isNotInt() })
  @Min(1, { message: dtoErrors().belowTheMin() })
  areaPorUnidade: number;

  @ApiProperty({ example: 1, description: 'Baldes de água por unidade' })
  @IsInt({ message: dtoErrors().isNotInt() })
  @Min(1, { message: dtoErrors().belowTheMin() })
  aguaPorUnidade: number;

  @ApiProperty({ example: 90 })
  @IsInt({ message: dtoErrors().isNotInt() })
  @Min(1, { message: dtoErrors().belowTheMin() })
  diasCrescimento: number;

  @ApiProperty({ example: 120, description: 'Kg colhidos por unidade' })
  @IsNumber()
  rendimentoPorUnidade: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  valorPorUnidade: number;
}
