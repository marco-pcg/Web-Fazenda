import { IsDateString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';

export class FiltroTransacoesDto extends PaginacaoDto {
  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @ApiPropertyOptional({ format: 'date' })
  @IsOptional()
  @IsDateString()
  data_fim?: string;

  @ApiPropertyOptional({
    enum: ['COMPRA_AVULSA', 'COMPRA_CONJUNTA', 'REPASSE', 'TAXA'],
  })
  @IsOptional()
  @IsIn(['COMPRA_AVULSA', 'COMPRA_CONJUNTA', 'REPASSE', 'TAXA'])
  tipo?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  venda_conjunta_id?: string;
}
