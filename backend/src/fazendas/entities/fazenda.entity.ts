import { ApiProperty } from '@nestjs/swagger';

export class Fazenda {
  @ApiProperty({ format: 'uuid' })
  id: string;
  @ApiProperty({ example: 'Fazenda Esperança' })
  nome: string;
  @ApiProperty({ format: 'uuid' })
  turma_id: string;
  @ApiProperty({ format: 'uuid' })
  usuario_id: string;
  @ApiProperty({ example: 100 })
  agua_total: number;
  @ApiProperty({ example: 75 })
  agua_disponivel: number;
  @ApiProperty({ example: 'primavera' })
  estacao_atual: string;
  @ApiProperty({ example: 1 })
  temporada_atual: number;
  @ApiProperty({ format: 'date-time' })
  created_at: Date;
  @ApiProperty({ format: 'date-time' })
  updated_at: Date;
}
