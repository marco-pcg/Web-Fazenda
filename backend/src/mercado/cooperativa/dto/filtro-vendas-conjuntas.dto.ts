import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';

export class FiltroVendasConjuntasDto extends PaginacaoDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  produto_id?: string;

  @ApiPropertyOptional({
    enum: ['ABERTA', 'AGUARDANDO_DISTRIBUICAO', 'DISTRIBUIDA', 'CANCELADA'],
  })
  @IsOptional()
  @IsIn(['ABERTA', 'AGUARDANDO_DISTRIBUICAO', 'DISTRIBUIDA', 'CANCELADA'])
  status?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  turma_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  temporada?: number;
}
