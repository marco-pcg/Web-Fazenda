import { IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriarVendaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fazenda_id: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  produto_id: string;

  @ApiProperty({ example: 10 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  quantidade: number;
}
