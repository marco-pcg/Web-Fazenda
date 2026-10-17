import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroTalhaoDto extends PaginacaoDto {
  @ApiPropertyOptional({ example: '48ad956a-2b13-4ca9-a2e5-147b9ac129a0' })
  @IsOptional()
  @IsUUID()
  fazenda_id?: string;

  @ApiPropertyOptional({ example: 'livre' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  codigo?: string;
}
