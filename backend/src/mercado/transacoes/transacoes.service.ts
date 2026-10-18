import { TransacoesRepository } from './transacoes.repository';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsuarioMercado } from '../shared/mercado.types';
import { FiltroTransacoesDto } from './dto/filtro-transacoes.dto';

@Injectable()
export class TransacoesService {
  constructor(private readonly transacoesRepository: TransacoesRepository) {}

  async listar(filtro: FiltroTransacoesDto, usuario: UsuarioMercado) {
    this.verificarPerfilConsulta(usuario);
    return this.transacoesRepository.findAll(filtro, usuario);
  }

  private verificarPerfilConsulta(usuario: UsuarioMercado): void {
    if (
      !['admin', 'professor', 'aluno', 'comprador'].includes(usuario.perfil)
    ) {
      throw new ForbiddenException('Perfil sem acesso ao mercado.');
    }
  }
}
