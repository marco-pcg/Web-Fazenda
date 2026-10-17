import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreatePlantioDto {
  @ApiProperty({
    description: 'Talhão',
    example: 'a4a97df6-7f12-489d-b7e0-ec0ff5b86220',
  })
  @IsUUID()
  talhao_id: string;

  @ApiProperty({
    description: 'Cultura',
    example: 'eea2c902-498b-43c5-9c81-d140e6f66e4d',
  })
  @IsUUID()
  cultura_id: string;

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
