import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, Min } from 'class-validator';

export class CreateTalhaoDto {
  @ApiProperty({ description: 'Fazenda do talhão', example: 1 })
  @IsInt()
  fazenda_id: number;

  @ApiProperty({ description: 'Código do talhão', example: 'A6' })
  @IsString()
  @Matches(/^[A-Z][0-9]+$/)
  codigo: string;

  @ApiProperty({ description: 'Tamanho em canteiros', example: 2 })
  @IsInt()
  @Min(1)
  area: number;
}
