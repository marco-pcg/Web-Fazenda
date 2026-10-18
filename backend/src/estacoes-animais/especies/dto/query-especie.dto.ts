import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';

export class QueryEspecieDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Filtrar por parte do nome' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ description: 'Filtrar por parte do produto' })
  @IsOptional()
  @IsString()
  produto?: string;
}
