import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Transacao {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'COMPRA_AVULSA' })
  tipo: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  ordem_id: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  venda_conjunta_id: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  comprador_usuario_id: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  beneficiario_usuario_id: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  fazenda_id: string | null;

  @ApiProperty({ example: 100 })
  valor: string | number;

  @ApiProperty({ format: 'date-time' })
  created_at: Date;
}
