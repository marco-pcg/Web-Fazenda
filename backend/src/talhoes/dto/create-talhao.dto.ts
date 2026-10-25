import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsUUID, Matches, Min } from 'class-validator';
import { dtoErrors } from '../../common/errors-handler/dto-errors';

export class CreateTalhaoDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  fazendaId: string;

  @ApiProperty({ example: 'A6', description: 'Uma letra maiúscula e números' })
  @IsString({ message: dtoErrors().isNotString() })
  @Matches(/^[A-Z][0-9]+$/, { message: 'O código deve ser como A1, B12...' })
  codigo: string;

  @ApiProperty({ example: 2, description: 'Tamanho em canteiros' })
  @IsInt({ message: dtoErrors().isNotInt() })
  @Min(1, { message: dtoErrors().belowTheMin() })
  area: number;
}
