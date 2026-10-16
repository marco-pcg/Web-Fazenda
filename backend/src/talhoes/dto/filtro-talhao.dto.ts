import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroTalhaoDto extends PaginacaoDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  fazenda_id?: number;

  @ApiPropertyOptional({ example: 'livre' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  codigo?: string;
}
