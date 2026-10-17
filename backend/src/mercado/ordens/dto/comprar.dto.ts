import { IsIn, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ComprarDto {
  @ApiProperty({ enum: ['ORDEM', 'VENDA_CONJUNTA'] })
  @IsIn(['ORDEM', 'VENDA_CONJUNTA'])
  origem: 'ORDEM' | 'VENDA_CONJUNTA';

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  origem_id: string;
}
