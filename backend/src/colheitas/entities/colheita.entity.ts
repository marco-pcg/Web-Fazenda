import { ApiProperty } from '@nestjs/swagger';

export class Colheita {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ format: 'uuid' })
  plantio_id: string;
  @ApiProperty({ format: 'date' })
  data_colheita: string;
  @ApiProperty({ example: false })
  antecipada: boolean;
  @ApiProperty({ example: 0 })
  perda_percentual: number;
  @ApiProperty({ example: 120 })
  quantidade_colhida: number;
  @ApiProperty({ example: 1200 })
  valor_estimado: number;
  @ApiProperty({ format: 'date-time' })
  created_at: Date;
}
