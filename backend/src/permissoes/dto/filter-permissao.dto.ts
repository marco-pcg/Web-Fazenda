import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterPermissaoDto {
  @ApiPropertyOptional({ example: 'usuarios', description: 'Filtra pelo módulo' })
  @IsOptional()
  @IsString()
  modulo?: string;

  @ApiPropertyOptional({ example: 'listar', description: 'Filtra pela ação' })
  @IsOptional()
  @IsString()
  acao?: string;
}
