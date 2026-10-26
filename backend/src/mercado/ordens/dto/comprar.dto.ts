import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import { dtoErrors } from '../../../common/errors-handler/dto-errors';

export class ComprarDto {
  @ApiProperty({ enum: ['ORDEM', 'VENDA_CONJUNTA'] })
  @IsIn(['ORDEM', 'VENDA_CONJUNTA'])
  origem: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Id da oferta avulsa ou da venda conjunta',
  })
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  origemId: string;
}
