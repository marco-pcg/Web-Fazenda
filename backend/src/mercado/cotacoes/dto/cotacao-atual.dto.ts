import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CotacaoAtualDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  produto_id: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fazenda_id: string;
}
