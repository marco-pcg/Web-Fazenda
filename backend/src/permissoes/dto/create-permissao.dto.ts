import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissaoDto {
  @ApiProperty({ example: 'usuarios:listar', description: 'Nome único da permissão' })
  nome: string;

  @ApiProperty({
    example: 'Permite listar usuários',
    description: 'Descrição funcional da permissão',
  })
  descricao: string;

  @ApiProperty({ example: 'usuarios', description: 'Módulo protegido' })
  modulo: string;

  @ApiProperty({ example: 'listar', description: 'Ação protegida' })
  acao: string;
}
