import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FiltroCulturaDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Parte do nome' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ description: 'primavera, verao, outono ou inverno' })
  @IsOptional()
  @IsString()
  estacao?: string;

  @ApiPropertyOptional({ description: 'Dias de crescimento no máximo' })
  @IsOptional()
  @IsInt()
  dias_maximo?: number;
}
