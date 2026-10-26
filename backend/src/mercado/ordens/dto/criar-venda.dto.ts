import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Min } from 'class-validator';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';

export class CriarVendaDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  fazendaId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  produtoId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.01, { message: dtoErrors().belowTheMin() })
  quantidade: number;
}
