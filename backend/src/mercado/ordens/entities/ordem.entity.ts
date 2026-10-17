import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Ordem {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: ['VENDA', 'COMPRA'] })
  tipo: string;

  @ApiProperty({ enum: ['AVULSA', 'CONJUNTA'] })
  modalidade: string;

  @ApiProperty({ example: 'ABERTA' })
  status: string;

  @ApiProperty({ format: 'uuid' })
  produto_id: string;

  @ApiProperty({ format: 'uuid' })
  usuario_id: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  fazenda_id: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  venda_conjunta_id: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  ordem_origem_id?: string | null;

  @ApiPropertyOptional({ nullable: true })
  temporada: number | null;

  @ApiProperty({ example: 10 })
  quantidade: string | number;

  @ApiPropertyOptional({ nullable: true })
  preco_unitario?: number | null;

  @ApiPropertyOptional({ nullable: true })
  valor_total?: number | null;

  @ApiPropertyOptional({ format: 'date-time' })
  created_at?: Date;

  @ApiPropertyOptional({ format: 'date-time' })
  updated_at?: Date;
}
