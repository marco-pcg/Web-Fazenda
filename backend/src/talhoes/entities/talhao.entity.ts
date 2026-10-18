import { ApiProperty } from '@nestjs/swagger';

export class Talhao {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ format: 'uuid' })
  fazenda_id: string;
  @ApiProperty({ example: 'A1' })
  codigo: string;
  @ApiProperty({ example: 10 })
  area: number;
  @ApiProperty({ example: 'livre', enum: ['livre', 'plantado'] })
  status: string;
  @ApiProperty({ format: 'date-time' })
  created_at: Date;
  @ApiProperty({ format: 'date-time' })
  updated_at: Date;
}
