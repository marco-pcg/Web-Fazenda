import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroFazendaDto extends PaginacaoDto {
  @ApiPropertyOptional({ example: 'esperança' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: 'dbee535a-f9de-4349-a3f1-0d3d3f691ae5' })
  @IsOptional()
  @IsUUID()
  turma_id?: string;

  @ApiPropertyOptional({ example: 'primavera' })
  @IsOptional()
  @IsString()
  estacao?: string;
}
