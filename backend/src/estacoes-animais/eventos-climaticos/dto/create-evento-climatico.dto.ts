import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlvoEvento, TipoEvento } from '../../../common/enums/enums';

export class CreateEventoClimaticoDto {
  @ApiProperty({
    description: 'ID da temporada ativa (UUID)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID('all', { message: 'O temporada_id deve ser um UUID válido.' })
  temporada_id: string;

  @ApiProperty({
    description: 'Tipo do evento climático',
    enum: TipoEvento,
    example: TipoEvento.SECA,
  })
  @IsEnum(TipoEvento, {
    message:
      'O tipo deve ser SECA, CHUVA_FORTE, GEADA, ONDA_CALOR ou BOA_SAFRA.',
  })
  tipo: TipoEvento;

  @ApiProperty({
    description: 'O que o evento afeta nas fazendas',
    enum: AlvoEvento,
    example: AlvoEvento.AGUA,
  })
  @IsEnum(AlvoEvento, { message: 'O alvo deve ser AGUA ou PRODUTIVIDADE.' })
  alvo: AlvoEvento;

  @ApiProperty({
    description:
      'Multiplicador aplicado ao alvo (menor que 1 reduz, maior que 1 aumenta)',
    example: 0.7,
  })
  @IsNumber({}, { message: 'O multiplicador deve ser um número.' })
  @IsPositive({ message: 'O multiplicador deve ser maior que zero.' })
  @Max(5, { message: 'O multiplicador máximo é 5.' })
  multiplicador: number;

  @ApiPropertyOptional({
    description: 'Descrição do evento',
    example: 'Seca forte reduz a água disponível nas fazendas.',
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto.' })
  @MaxLength(200, { message: 'A descrição deve ter no máximo 200 caracteres.' })
  descricao?: string;
}
