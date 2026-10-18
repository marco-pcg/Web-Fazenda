import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';
import { NomeEstacao } from '../../../common/enums/enums';

export class QueryEstacaoDto extends PaginacaoDto {
  @ApiPropertyOptional({
    description: 'Filtrar pelo nome da estação',
    enum: NomeEstacao,
  })
  @IsOptional()
  @IsEnum(NomeEstacao, {
    message: 'O nome deve ser PRIMAVERA, VERAO, OUTONO ou INVERNO.',
  })
  nome?: NomeEstacao;

  @ApiPropertyOptional({ description: 'Filtrar pela ordem' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A ordem deve ser um número inteiro.' })
  ordem?: number;
}
