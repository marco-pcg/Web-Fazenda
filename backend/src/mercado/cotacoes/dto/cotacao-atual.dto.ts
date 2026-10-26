import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';

export class CotacaoAtualDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  produtoId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  fazendaId: string;
}
