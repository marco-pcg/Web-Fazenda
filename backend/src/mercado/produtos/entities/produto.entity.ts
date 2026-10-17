import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Produto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Milho' })
  nome: string;

  @ApiProperty({ example: 'kg' })
  unidade: string;

  @ApiProperty({ example: 'cultura:uuid' })
  chave_estoque: string;

  @ApiProperty({ example: 10 })
  preco_base: string | number;

  @ApiProperty({ example: 0.01 })
  sensibilidade: string | number;

  @ApiProperty({ example: true })
  ativo: boolean;

  @ApiPropertyOptional({ format: 'date-time' })
  created_at?: Date;

  @ApiPropertyOptional({ format: 'date-time' })
  updated_at?: Date;
}
