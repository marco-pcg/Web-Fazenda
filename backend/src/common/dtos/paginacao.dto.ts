import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginacaoDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Número da página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro.' })
  @Min(1, { message: 'A página mínima permitida é 1.' })
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, description: 'Quantidade de registros por página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro.' })
  @Min(1, { message: 'O limite mínimo permitido é 1.' })
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Termo de busca genérico' })
  @IsOptional()
  @IsString()
  search?: string;
}