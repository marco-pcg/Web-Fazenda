import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';

const STATUS = [
  'ABERTA',
  'AGUARDANDO_DISTRIBUICAO',
  'DISTRIBUIDA',
  'CANCELADA',
];

export class FiltroVendaConjuntaDto extends PaginacaoDto {
  @ApiPropertyOptional({ enum: STATUS })
  @IsOptional()
  @IsIn(STATUS)
  status?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  produtoId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  turmaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt({ message: dtoErrors().isNotInt() })
  temporada?: number;
}
