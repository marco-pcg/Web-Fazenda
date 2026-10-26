import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';

export class FiltroEstoqueDto extends PaginacaoDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  fazendaId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  turmaId?: string;
}
