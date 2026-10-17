import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroFazendaDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Parte do nome' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ description: 'Id da turma' })
  @IsOptional()
  @IsUUID()
  turma_id?: string;

  @ApiPropertyOptional({ description: 'Estação atual da fazenda' })
  @IsOptional()
  @IsString()
  estacao?: string;
}
