import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, Matches, Min } from 'class-validator';

export class CreateTalhaoDto {
  @ApiProperty({
    description: 'Fazenda do talhão',
    example: '48ad956a-2b13-4ca9-a2e5-147b9ac129a0',
  })
  @IsUUID()
  fazenda_id: string;

  @ApiProperty({ description: 'Código do talhão', example: 'A6' })
  @IsString()
  @Matches(/^[A-Z][0-9]+$/)
  codigo: string;

  @ApiProperty({ description: 'Tamanho em canteiros', example: 2 })
  @IsInt()
  @Min(1)
  area: number;
}
