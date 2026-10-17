import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroColheitaDto extends PaginacaoDto {
  @ApiPropertyOptional({ example: '48ad956a-2b13-4ca9-a2e5-147b9ac129a0' })
  @IsOptional()
  @IsUUID()
  fazenda_id?: string;

  @ApiPropertyOptional({ example: 'eea2c902-498b-43c5-9c81-d140e6f66e4d' })
  @IsOptional()
  @IsUUID()
  cultura_id?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  temporada?: number;

  @ApiPropertyOptional({ example: 'true' })
  @IsOptional()
  @IsIn(['true', 'false'])
  antecipada?: string;
}
