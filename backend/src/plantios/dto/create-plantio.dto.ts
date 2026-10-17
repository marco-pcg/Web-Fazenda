import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreatePlantioDto {
  @ApiProperty({ description: 'Talhão', example: 1 })
  @IsInt()
  talhao_id: number;

  @ApiProperty({ description: 'Cultura', example: 1 })
  @IsInt()
  cultura_id: number;

  @ApiProperty({ description: 'Quantidade plantada', example: 2 })
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiPropertyOptional({
    description: 'Data do plantio',
    example: '2026-06-01',
  })
  @IsOptional()
  @IsDateString()
  data_plantio?: string;
}
