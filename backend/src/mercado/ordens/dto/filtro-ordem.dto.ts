import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';

export class FiltroOrdemDto extends PaginacaoDto {
  @ApiPropertyOptional({ enum: ['VENDA', 'COMPRA'] })
  @IsOptional()
  @IsIn(['VENDA', 'COMPRA'])
  tipo?: string;

  @ApiPropertyOptional({ enum: ['ABERTA', 'EXECUTADA', 'CANCELADA'] })
  @IsOptional()
  @IsIn(['ABERTA', 'EXECUTADA', 'CANCELADA'])
  status?: string;

  @ApiPropertyOptional({ enum: ['AVULSA', 'CONJUNTA'] })
  @IsOptional()
  @IsIn(['AVULSA', 'CONJUNTA'])
  modalidade?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  produtoId?: string;
}
