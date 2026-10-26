import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';

export class AlterarContribuicaoDto {
  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(0.01, { message: dtoErrors().belowTheMin() })
  quantidade: number;
}
