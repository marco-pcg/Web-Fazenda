import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';

export class FiltroTransacaoDto extends PaginacaoDto {
  @ApiPropertyOptional({
    enum: ['COMPRA_AVULSA', 'COMPRA_CONJUNTA', 'REPASSE', 'TAXA'],
  })
  @IsOptional()
  @IsIn(['COMPRA_AVULSA', 'COMPRA_CONJUNTA', 'REPASSE', 'TAXA'])
  tipo?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  vendaConjuntaId?: string;

  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional({ example: '2026-10-31' })
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
