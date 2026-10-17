import { IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContribuirDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fazenda_id: string;

  @ApiProperty({ example: 20 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  quantidade: number;
}
