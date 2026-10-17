import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginacaoDto } from '../../common/dtos/paginacao.dto';

export class FilterPerfilDto extends PaginacaoDto {
  @ApiPropertyOptional({ description: 'Filtrar por nome do perfil', example: 'professor' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ description: 'Filtrar por status ativo (true/false)', example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  ativo?: boolean;
}