import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';
import { StatusTemporada } from '../../../common/enums/enums';

export class QueryTemporadaDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Filtrar pela turma (UUID)' })
  @IsOptional()
  @IsUUID('all', { message: 'O turma_id deve ser um UUID válido.' })
  turma_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar pelo status',
    enum: StatusTemporada,
  })
  @IsOptional()
  @IsEnum(StatusTemporada, {
    message: 'O status deve ser PLANEJADA, ATIVA, PROCESSANDO ou ENCERRADA.',
  })
  status?: StatusTemporada;
}
