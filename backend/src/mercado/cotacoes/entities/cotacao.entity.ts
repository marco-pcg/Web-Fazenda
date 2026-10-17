import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Cotacao {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  produto_id: string;

  @ApiProperty({ format: 'uuid' })
  turma_id: string;

  @ApiProperty({ example: 1 })
  temporada: number;

  @ApiProperty({ example: 100 })
  quantidade_vendida: string | number;

  @ApiProperty({ example: 8.5 })
  preco_atual: string | number;

  @ApiPropertyOptional({ format: 'date-time' })
  created_at?: Date;

  @ApiPropertyOptional({ format: 'date-time' })
  updated_at?: Date;
}
