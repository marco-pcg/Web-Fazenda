import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FilterUsuarioDto extends PaginacaoDto {
  @ApiPropertyOptional({ example: 'Ana', description: 'Parte do nome' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: 'aluno', description: 'Nome do perfil' })
  @IsOptional()
  @IsString()
  perfil?: string;
}
