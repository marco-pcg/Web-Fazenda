import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ColherPlantioDto {
  @ApiPropertyOptional({
    description: 'Data da colheita',
    example: '2026-09-15',
  })
  @IsOptional()
  @IsDateString()
  data_colheita?: string;
}
