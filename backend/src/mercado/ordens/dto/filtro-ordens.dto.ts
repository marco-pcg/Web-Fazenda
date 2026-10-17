import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';

export class FiltroOrdensDto extends PaginacaoDto {
  @ApiPropertyOptional({ enum: ['VENDA', 'COMPRA'] })
  @IsOptional()
  @IsIn(['VENDA', 'COMPRA'])
  tipo?: 'VENDA' | 'COMPRA';

  @ApiPropertyOptional({ enum: ['ABERTA', 'EXECUTADA', 'CANCELADA'] })
  @IsOptional()
  @IsIn(['ABERTA', 'EXECUTADA', 'CANCELADA'])
  status?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  produto_id?: string;

  @ApiPropertyOptional({ enum: ['AVULSA', 'CONJUNTA'] })
  @IsOptional()
  @IsIn(['AVULSA', 'CONJUNTA'])
  modalidade?: string;
}
