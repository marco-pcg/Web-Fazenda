import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroPlantioDto extends PaginacaoDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  fazendaId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  culturaId?: string;

  @ApiPropertyOptional({ enum: ['em_crescimento', 'pronto', 'colhido'] })
  @IsOptional()
  @IsIn(['em_crescimento', 'pronto', 'colhido'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  temporada?: number;
}
