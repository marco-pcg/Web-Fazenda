import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroPlantioDto extends PaginacaoDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  fazenda_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  cultura_id?: number;

  @ApiPropertyOptional({ example: 'em_crescimento' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  temporada?: number;
}
