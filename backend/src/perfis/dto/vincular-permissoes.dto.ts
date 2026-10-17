import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VincularPermissoesDto {
  @ApiProperty({
    description:
      'Lista de IDs (UUID) das permissões que serão vinculadas ao perfil',
    example: ['c2b0c399-5282-4de9-9e1d-400a9448149e'],
    type: [String],
  })
  @IsArray({ message: 'permissoes_ids deve ser um array.' })
  @IsUUID('all', {
    each: true,
    message: 'Todos os IDs de permissão devem ser UUID válidos.',
  })
  permissoes_ids: string[];
}
