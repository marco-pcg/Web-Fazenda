import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FilterTurmaDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Filtrar por nome da turma', example: 'Agropecuária' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ description: 'Filtrar por ano', example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  ano?: number;
}