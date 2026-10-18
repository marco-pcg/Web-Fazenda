import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';
import { StatusEvento, TipoEvento } from '../../../common/enums/enums';

export class QueryEventoClimaticoDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Filtrar pelo tipo', enum: TipoEvento })
  @IsOptional()
  @IsEnum(TipoEvento, {
    message:
      'O tipo deve ser SECA, CHUVA_FORTE, GEADA, ONDA_CALOR ou BOA_SAFRA.',
  })
  tipo?: TipoEvento;

  @ApiPropertyOptional({ description: 'Filtrar pela temporada (UUID)' })
  @IsOptional()
  @IsUUID('all', { message: 'O temporada_id deve ser um UUID válido.' })
  temporada_id?: string;

  @ApiPropertyOptional({ description: 'Filtrar pela turma (UUID)' })
  @IsOptional()
  @IsUUID('all', { message: 'O turma_id deve ser um UUID válido.' })
  turma_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar pelo status',
    enum: StatusEvento,
  })
  @IsOptional()
  @IsEnum(StatusEvento, { message: 'O status deve ser ATIVO ou ENCERRADO.' })
  status?: StatusEvento;
}
