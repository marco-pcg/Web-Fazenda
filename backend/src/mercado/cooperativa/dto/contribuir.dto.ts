import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Min } from 'class-validator';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';

export class ContribuirDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  fazendaId: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0.01, { message: dtoErrors().belowTheMin() })
  quantidade: number;
}
