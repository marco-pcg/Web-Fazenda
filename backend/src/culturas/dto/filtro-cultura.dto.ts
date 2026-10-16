import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroCulturaDto extends PaginacaoDto {
  @ApiPropertyOptional({ example: 'mil' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: 'verao' })
  @IsOptional()
  @IsString()
  estacao?: string;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsInt()
  dias_maximo?: number;
}
