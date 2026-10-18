import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';

export class QueryProducaoDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Filtrar por parte do produto' })
  @IsOptional()
  @IsString()
  produto?: string;

  @ApiPropertyOptional({ description: 'Data inicial (AAAA-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'A data inicial deve ser uma data válida.' })
  data_inicio?: string;

  @ApiPropertyOptional({ description: 'Data final (AAAA-MM-DD)' })
  @IsOptional()
  @IsDateString({}, { message: 'A data final deve ser uma data válida.' })
  data_fim?: string;

  @ApiPropertyOptional({ description: 'Filtrar pelo rebanho (UUID)' })
  @IsOptional()
  @IsUUID('all', { message: 'O rebanho_id deve ser um UUID válido.' })
  rebanho_id?: string;

  @ApiPropertyOptional({ description: 'Filtrar pela temporada (UUID)' })
  @IsOptional()
  @IsUUID('all', { message: 'O temporada_id deve ser um UUID válido.' })
  temporada_id?: string;

  @ApiPropertyOptional({ description: 'Filtrar pela fazenda (UUID)' })
  @IsOptional()
  @IsUUID('all', { message: 'O fazenda_id deve ser um UUID válido.' })
  fazenda_id?: string;
}
