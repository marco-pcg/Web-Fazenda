import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroTalhaoDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Id da fazenda' })
  @IsOptional()
  @IsUUID()
  fazenda_id?: string;

  @ApiPropertyOptional({ description: 'livre ou plantado' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Começo do código, como A' })
  @IsOptional()
  @IsString()
  codigo?: string;
}
