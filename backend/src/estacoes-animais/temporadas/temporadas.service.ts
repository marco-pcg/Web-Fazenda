import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { TemporadasRepository } from './temporadas.repository';
import { Temporada } from './temporada.types';
import { CreateTemporadaDto } from './dto/create-temporada.dto';
import { QueryTemporadaDto } from './dto/query-temporada.dto';
import { EstacoesRepository } from '../estacoes/estacoes.repository';
import { TURMAS_PORT } from '../ports/turmas.port';
import type { TurmasPort } from '../ports/turmas.port';
import { UsuarioLogado } from '../common/usuario-logado';
import { StatusTemporada } from '../../common/enums/enums';

@Injectable()
export class TemporadasService {
  constructor(
    private readonly temporadasRepository: TemporadasRepository,
    private readonly estacoesRepository: EstacoesRepository,
    @Inject(TURMAS_PORT) private readonly turmasPort: TurmasPort,
  ) {}

  async listar(filtros: QueryTemporadaDto, usuario: UsuarioLogado) {
    if (usuario.perfil === 'aluno') {
      const turmaDoAluno = await this.turmasPort.turmaDoUsuario(usuario.id);
      if (!turmaDoAluno) {
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
      filtros.turma_id = turmaDoAluno;
    }

    return this.temporadasRepository.listar(
      filtros,
      filtros.pagina,
      filtros.limite,
    );
  }

  async criar(createTemporadaDto: CreateTemporadaDto, usuario: UsuarioLogado) {
    const turmaExiste = await this.turmasPort.existe(
      createTemporadaDto.turma_id,
    );
    if (!turmaExiste) {
      throw new NotFoundException('Turma não encontrada.');
    }

    await this.verificarDonoDaTurma(createTemporadaDto.turma_id, usuario);

    const estacao = await this.estacoesRepository.findById(
      createTemporadaDto.estacao_id,
    );
    if (!estacao) {
      throw new NotFoundException('Estação não encontrada.');
    }

    if (createTemporadaDto.data_inicio && createTemporadaDto.data_fim) {
      const inicio = new Date(createTemporadaDto.data_inicio);
      const fim = new Date(createTemporadaDto.data_fim);
      if (fim < inicio) {
        throw new BadRequestException(
          'A data de fim não pode ser anterior à data de início.',
        );
      }
    }

    const numero = await this.temporadasRepository.proximoNumero(
      createTemporadaDto.turma_id,
    );

    return this.temporadasRepository.insert({
      turma_id: createTemporadaDto.turma_id,
      estacao_id: createTemporadaDto.estacao_id,
      nome: createTemporadaDto.nome,
      numero,
      status: StatusTemporada.PLANEJADA,
      data_inicio: createTemporadaDto.data_inicio
        ? new Date(createTemporadaDto.data_inicio)
        : null,
      data_fim: createTemporadaDto.data_fim
        ? new Date(createTemporadaDto.data_fim)
        : null,
    });
  }

  async avancar(id: string, usuario: UsuarioLogado) {
    const temporada = await this.temporadasRepository.findById(id);
    if (!temporada) {
      throw new NotFoundException('Temporada não encontrada.');
    }

    await this.verificarDonoDaTurma(temporada.turma_id, usuario);

    if (
      temporada.status === StatusTemporada.PROCESSANDO ||
      temporada.status === StatusTemporada.ENCERRADA
    ) {
      throw new ConflictException(
        `A temporada está ${temporada.status} e não pode ser avançada.`,
      );
    }

    if (temporada.status === StatusTemporada.PLANEJADA) {
      const ativa = await this.temporadasRepository.findAtivaDaTurma(
        temporada.turma_id,
      );
      if (ativa) {
        throw new UnprocessableEntityException(
          'Já existe uma temporada ativa nesta turma. Encerre a temporada ativa primeiro.',
        );
      }
    }

    await this.temporadasRepository.update(id, {
      status: StatusTemporada.PROCESSANDO,
    });

    return { temporada_id: id, status_anterior: temporada.status };
  }

  async ativar(
    temporada_id: string,
    trx?: Knex.Transaction,
  ): Promise<Temporada> {
    const temporada = await this.buscarEmProcessamento(temporada_id, trx);

    const ativada = await this.temporadasRepository.update(
      temporada.id,
      {
        status: StatusTemporada.ATIVA,
        data_inicio: temporada.data_inicio || new Date(),
      },
      trx,
    );
    if (!ativada) {
      throw new NotFoundException('Temporada não encontrada.');
    }
    return ativada;
  }

  async encerrarEAtivarProxima(
    temporada_id: string,
    trx?: Knex.Transaction,
  ): Promise<Temporada> {
    const temporada = await this.buscarEmProcessamento(temporada_id, trx);

    await this.temporadasRepository.update(
      temporada.id,
      {
        status: StatusTemporada.ENCERRADA,
        data_fim: temporada.data_fim || new Date(),
      },
      trx,
    );

    const planejada = await this.temporadasRepository.findPlanejadaMaisAntiga(
      temporada.turma_id,
      trx,
    );
    if (planejada) {
      const ativada = await this.temporadasRepository.update(
        planejada.id,
        {
          status: StatusTemporada.ATIVA,
          data_inicio: planejada.data_inicio || new Date(),
        },
        trx,
      );
      if (!ativada) {
        throw new NotFoundException('Temporada não encontrada.');
      }
      return ativada;
    }

    const estacaoAtual = await this.estacoesRepository.findById(
      temporada.estacao_id,
      trx,
    );
    let proximaEstacao = estacaoAtual
      ? await this.estacoesRepository.findSeguinte(estacaoAtual.ordem, trx)
      : undefined;
    if (!proximaEstacao) {
      proximaEstacao = await this.estacoesRepository.findPrimeira(trx);
    }
    if (!proximaEstacao) {
      throw new NotFoundException('Nenhuma estação cadastrada.');
    }

    const numero = await this.temporadasRepository.proximoNumero(
      temporada.turma_id,
      trx,
    );

    return this.temporadasRepository.insert(
      {
        turma_id: temporada.turma_id,
        estacao_id: proximaEstacao.id,
        numero,
        nome: `Temporada ${numero}`,
        status: StatusTemporada.ATIVA,
        data_inicio: new Date(),
      },
      trx,
    );
  }

  private async buscarEmProcessamento(
    temporada_id: string,
    trx?: Knex.Transaction,
  ): Promise<Temporada> {
    const temporada = await this.temporadasRepository.findById(
      temporada_id,
      trx,
    );
    if (!temporada) {
      throw new NotFoundException('Temporada não encontrada.');
    }
    if (temporada.status !== StatusTemporada.PROCESSANDO) {
      throw new ConflictException('A temporada não está em processamento.');
    }
    return temporada;
  }

  private async verificarDonoDaTurma(turma_id: string, usuario: UsuarioLogado) {
    if (usuario.perfil !== 'professor') {
      return;
    }

    const ehDono = await this.turmasPort.professorEhDaTurma(
      turma_id,
      usuario.id,
    );
    if (!ehDono) {
      throw new ForbiddenException(
        'Você só pode gerenciar temporadas das suas próprias turmas.',
      );
    }
  }
}
