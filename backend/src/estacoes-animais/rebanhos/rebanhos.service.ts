import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RebanhosRepository } from './rebanhos.repository';
import { AlimentacoesService } from './alimentacoes.service';
import { CreateRebanhoDto } from './dto/create-rebanho.dto';
import { QueryRebanhoDto } from './dto/query-rebanho.dto';
import { EspeciesRepository } from '../especies/especies.repository';
import { FAZENDAS_PORT } from '../ports/fazendas.port';
import type { FazendasPort } from '../ports/fazendas.port';
import { TURMAS_PORT } from '../ports/turmas.port';
import type { TurmasPort } from '../ports/turmas.port';
import { UsuarioLogado } from '../common/usuario-logado';
import { SaudeRebanho } from '../../common/enums/enums';

@Injectable()
export class RebanhosService {
  constructor(
    private readonly rebanhosRepository: RebanhosRepository,
    private readonly especiesRepository: EspeciesRepository,
    private readonly alimentacoesService: AlimentacoesService,
    @Inject(FAZENDAS_PORT) private readonly fazendasPort: FazendasPort,
    @Inject(TURMAS_PORT) private readonly turmasPort: TurmasPort,
  ) {}

  async listar(filtros: QueryRebanhoDto, usuario: UsuarioLogado) {
    let fazenda_ids: string[] | undefined = filtros.fazenda_id
      ? [filtros.fazenda_id]
      : undefined;

    if (usuario.perfil === 'aluno') {
      const fazendas = await this.fazendasPort.listarPorUsuario(usuario.id);
      fazenda_ids = fazendas.map((fazenda) => fazenda.id);

      if (filtros.fazenda_id) {
        fazenda_ids = fazenda_ids.includes(filtros.fazenda_id)
          ? [filtros.fazenda_id]
          : [];
      }

      if (fazenda_ids.length === 0) {
        return {
          data: [],
          meta: {
            page: filtros.pagina || 1,
            limit: filtros.limite || 10,
            total: 0,
            totalPages: 0,
          },
        };
      }
    }

    return this.rebanhosRepository.listar(
      {
        especie_id: filtros.especie_id,
        saude: filtros.saude,
        fazenda_ids,
        search: filtros.search,
      },
      filtros.pagina,
      filtros.limite,
    );
  }

  async criar(dto: CreateRebanhoDto, usuario: UsuarioLogado) {
    const especie = await this.especiesRepository.findById(dto.especie_id);
    if (!especie) {
      throw new NotFoundException('Espécie não encontrada.');
    }

    if (!especie.ativo) {
      throw new UnprocessableEntityException(
        'Esta espécie está inativa e não pode receber novos animais.',
      );
    }

    await this.verificarAcessoAFazenda(dto.fazenda_id, usuario);

    const existente = await this.rebanhosRepository.findPorFazendaEEspecie(
      dto.fazenda_id,
      dto.especie_id,
    );

    if (existente) {
      const atualizado = await this.rebanhosRepository.update(existente.id, {
        quantidade: existente.quantidade + dto.quantidade,
      });
      if (!atualizado) {
        throw new NotFoundException('Rebanho não encontrado.');
      }
      return atualizado;
    }

    return this.rebanhosRepository.insert({
      fazenda_id: dto.fazenda_id,
      especie_id: dto.especie_id,
      quantidade: dto.quantidade,
      saude: SaudeRebanho.SAUDAVEL,
    });
  }

  async alimentar(id: string, usuario: UsuarioLogado) {
    const rebanho = await this.rebanhosRepository.findById(id);
    if (!rebanho) {
      throw new NotFoundException('Rebanho não encontrado.');
    }

    await this.verificarAcessoAFazenda(rebanho.fazenda_id, usuario);

    return this.alimentacoesService.alimentarRebanho(rebanho.id);
  }

  private async verificarAcessoAFazenda(
    fazenda_id: string,
    usuario: UsuarioLogado,
  ) {
    const fazenda = await this.fazendasPort.buscarPorId(fazenda_id);
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada.');
    }

    if (usuario.perfil === 'aluno') {
      const ehDono = await this.fazendasPort.pertenceAoUsuario(
        fazenda_id,
        usuario.id,
      );
      if (!ehDono) {
        throw new ForbiddenException(
          'Você só pode gerenciar rebanhos das suas próprias fazendas.',
        );
      }
    }

    if (usuario.perfil === 'professor' && fazenda.turmaId) {
      const ehDaTurma = await this.turmasPort.professorEhDaTurma(
        fazenda.turmaId,
        usuario.id,
      );
      if (!ehDaTurma) {
        throw new ForbiddenException(
          'Você só pode gerenciar rebanhos de fazendas das suas turmas.',
        );
      }
    }
  }
}
