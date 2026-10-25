import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { dtoErrors } from '../../common/errors-handler/dto-errors';

export class UpdateTalhaoDto {
  @ApiPropertyOptional({ example: 'A6' })
  @IsOptional()
  @IsString({ message: dtoErrors().isNotString() })
  @Matches(/^[A-Z][0-9]+$/, { message: 'O código deve ser como A1, B12...' })
  codigo?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt({ message: dtoErrors().isNotInt() })
  @Min(1, { message: dtoErrors().belowTheMin() })
  area?: number;
}
