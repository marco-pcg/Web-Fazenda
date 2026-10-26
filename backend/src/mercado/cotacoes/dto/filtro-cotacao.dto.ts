import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';

export class FiltroCotacaoDto extends PaginacaoDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  produtoId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  turmaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt({ message: dtoErrors().isNotInt() })
  temporada?: number;
}
