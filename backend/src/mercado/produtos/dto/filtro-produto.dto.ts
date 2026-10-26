import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';

export class FiltroProdutoDto extends PaginacaoDto {
  @ApiPropertyOptional({ enum: ['true', 'false'] })
  @IsOptional()
  @IsIn(['true', 'false'])
  ativo?: string;
}
