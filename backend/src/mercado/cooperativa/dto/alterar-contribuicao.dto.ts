import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AlterarContribuicaoDto {
  @ApiProperty({ example: 25 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  quantidade: number;
}
