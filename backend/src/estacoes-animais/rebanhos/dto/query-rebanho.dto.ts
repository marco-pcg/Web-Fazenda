import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../../common/dtos/paginacao.dto';
import { SaudeRebanho } from '../../../common/enums/enums';

export class QueryRebanhoDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Filtrar pela espécie (UUID)' })
  @IsOptional()
  @IsUUID('all', { message: 'O especie_id deve ser um UUID válido.' })
  especie_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar pela saúde',
    enum: SaudeRebanho,
  })
  @IsOptional()
  @IsEnum(SaudeRebanho, { message: 'A saúde deve ser SAUDAVEL ou SUBNUTRIDO.' })
  saude?: SaudeRebanho;

  @ApiPropertyOptional({ description: 'Filtrar pela fazenda (UUID)' })
  @IsOptional()
  @IsUUID('all', { message: 'O fazenda_id deve ser um UUID válido.' })
  fazenda_id?: string;
}
