import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';
import { ESTACOES } from '../../culturas/dto/create-cultura.dto';

export class FiltroFazendaDto extends PaginacaoDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  turmaId?: string;

  @ApiPropertyOptional({ example: 'primavera' })
  @IsOptional()
  @IsIn(ESTACOES)
  estacao?: string;
}
