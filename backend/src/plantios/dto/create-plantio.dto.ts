import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { dtoErrors } from '../../common/errors-handler/dto-errors';

export class CreatePlantioDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  talhaoId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  culturaId: string;

  @ApiProperty({ example: 2 })
  @IsInt({ message: dtoErrors().isNotInt() })
  @Min(1, { message: dtoErrors().belowTheMin() })
  quantidade: number;

  @ApiPropertyOptional({ example: '2026-06-01', description: 'Padrão: hoje' })
  @IsOptional()
  @IsDateString()
  dataPlantio?: string;
}
