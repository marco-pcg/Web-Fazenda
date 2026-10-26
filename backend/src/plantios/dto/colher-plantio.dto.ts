import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ColherPlantioDto {
  @ApiPropertyOptional({ example: '2026-09-15', description: 'Padrão: hoje' })
  @IsOptional()
  @IsDateString()
  dataColheita?: string;
}
