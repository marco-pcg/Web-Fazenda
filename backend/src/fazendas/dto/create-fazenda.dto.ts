import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { dtoErrors } from '../../common/errors-handler/dto-errors';
import { ESTACOES } from '../../culturas/dto/create-cultura.dto';

export class CreateFazendaDto {
  @ApiProperty({ example: 'Fazenda Esperança' })
  @IsString({ message: dtoErrors().isNotString() })
  @IsNotEmpty({ message: dtoErrors().isEmpty() })
  nome: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  turmaId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Aluno dono da fazenda' })
  @IsOptional()
  @IsUUID('all', { message: dtoErrors().isNotUUID() })
  usuarioId?: string;

  @ApiProperty({ example: 14, description: 'Baldes de água' })
  @IsInt({ message: dtoErrors().isNotInt() })
  @Min(1, { message: dtoErrors().belowTheMin() })
  aguaTotal: number;

  @ApiProperty({ example: 'primavera' })
  @IsIn(ESTACOES)
  estacaoAtual: string;
}
