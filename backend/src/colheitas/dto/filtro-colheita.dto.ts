import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroColheitaDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Id da fazenda' })
  @IsOptional()
  @IsUUID()
  fazenda_id?: string;

  @ApiPropertyOptional({ description: 'Id da cultura' })
  @IsOptional()
  @IsUUID()
  cultura_id?: string;

  @ApiPropertyOptional({ description: 'Número da temporada' })
  @IsOptional()
  @IsInt()
  temporada?: number;

  @ApiPropertyOptional({ description: 'true ou false' })
  @IsOptional()
  @IsIn(['true', 'false'])
  antecipada?: string;
}
