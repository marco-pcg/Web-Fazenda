import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';
import { ESTACOES } from './create-cultura.dto';

export class FiltroCulturaDto extends PaginacaoDto {
  @ApiPropertyOptional({ example: 'verao' })
  @IsOptional()
  @IsIn(ESTACOES)
  estacao?: string;

  @ApiPropertyOptional({ description: 'Dias de crescimento no máximo' })
  @IsOptional()
  @IsInt()
  diasMaximo?: number;
}
