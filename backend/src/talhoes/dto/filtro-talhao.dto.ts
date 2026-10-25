import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroTalhaoDto extends PaginacaoDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  fazendaId?: string;

  @ApiPropertyOptional({ enum: ['livre', 'plantado'] })
  @IsOptional()
  @IsIn(['livre', 'plantado'])
  status?: string;
}
