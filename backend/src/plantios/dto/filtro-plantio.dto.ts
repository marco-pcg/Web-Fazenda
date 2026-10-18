import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroPlantioDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Id da fazenda' })
  @IsOptional()
  @IsUUID()
  fazenda_id?: string;

  @ApiPropertyOptional({ description: 'Id da cultura' })
  @IsOptional()
  @IsUUID()
  cultura_id?: string;

  @ApiPropertyOptional({ description: 'em_crescimento, pronto ou colhido' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Número da temporada' })
  @IsOptional()
  @IsInt()
  temporada?: number;
}
