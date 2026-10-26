import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { database as knex } from '../../db/knex-connection';
import { EventosClimaticosRepository } from './eventos-climaticos.repository';
import { EventoClimatico } from './evento-climatico.types';
import { CreateEventoClimaticoDto } from './dto/create-evento-climatico.dto';
import { QueryEventoClimaticoDto } from './dto/query-evento-climatico.dto';
import { TemporadasRepository } from '../temporadas/temporadas.repository';
import { TURMAS_PORT } from '../ports/turmas.port';
import type { TurmasPort } from '../ports/turmas.port';
import { FAZENDAS_PORT } from '../ports/fazendas.port';
import type { FazendasPort } from '../ports/fazendas.port';
import { UsuarioLogado } from '../common/usuario-logado';
import {
  AlvoEvento,
  StatusEvento,
  StatusTemporada,
  TipoEvento,
} from '../../common/enums/enums';

const regrasPorTipo: Record<
  TipoEvento,
  { alvos: AlvoEvento[]; aumenta: boolean }
> = {
  [TipoEvento.SECA]: { alvos: [AlvoEvento.AGUA], aumenta: false },
  [TipoEvento.CHUVA_FORTE]: { alvos: [AlvoEvento.AGUA], aumenta: true },
  [TipoEvento.GEADA]: { alvos: [AlvoEvento.PRODUTIVIDADE], aumenta: false },
  [TipoEvento.ONDA_CALOR]: {
    alvos: [AlvoEvento.AGUA, AlvoEvento.PRODUTIVIDADE],
    aumenta: false,
  },
  [TipoEvento.BOA_SAFRA]: { alvos: [AlvoEvento.PRODUTIVIDADE], aumenta: true },
};

@Injectable()
export class EventosClimaticosService {
  constructor(
    private readonly eventosRepository: EventosClimaticosRepository,
    private readonly temporadasRepository: TemporadasRepository,
    @Inject(TURMAS_PORT) private readonly turmasPort: TurmasPort,
    @Inject(FAZENDAS_PORT) private readonly fazendasPort: FazendasPort,
  ) {}

  async listar(filtros: QueryEventoClimaticoDto, usuario: UsuarioLogado) {
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

    const resultado = await this.eventosRepository.listar(
      filtros,
      filtros.pagina,
      filtros.limite,
    );

    return {
      data: resultado.data.map((evento) => this.converterNumeros(evento)),
      meta: resultado.meta,
    };
  }

  async criar(dto: CreateEventoClimaticoDto, usuario: UsuarioLogado) {
    const temporada = await this.temporadasRepository.findById(
      dto.temporada_id,
    );
    if (!temporada) {
      throw new NotFoundException('Temporada não encontrada.');
    }

    await this.verificarDonoDaTurma(temporada.turma_id, usuario);

    if (temporada.status !== StatusTemporada.ATIVA) {
      throw new UnprocessableEntityException(
        'Eventos climáticos só podem ser criados em uma temporada ativa.',
      );
    }

    this.validarCoerencia(dto);

    const evento = await knex.transaction(async (trx) => {
      const novoEvento = await this.eventosRepository.insert(
        {
          temporada_id: temporada.id,
          turma_id: temporada.turma_id,
          tipo: dto.tipo,
          alvo: dto.alvo,
          multiplicador: dto.multiplicador,
          descricao: dto.descricao ?? null,
          status: StatusEvento.ATIVO,
          criado_por: usuario.id,
        },
        trx,
      );

      await this.fazendasPort.aplicarModificadorTurma(
        temporada.turma_id,
        {
          alvo: dto.alvo,
          multiplicador: dto.multiplicador,
          eventoId: novoEvento.id,
        },
        trx,
      );

      return novoEvento;
    });

    return this.converterNumeros(evento);
  }

  async encerrar(id: string, usuario: UsuarioLogado) {
    const evento = await this.eventosRepository.findById(id);
    if (!evento) {
      throw new NotFoundException('Evento climático não encontrado.');
    }

    await this.verificarDonoDaTurma(evento.turma_id, usuario);

    if (evento.status === StatusEvento.ENCERRADO) {
      throw new ConflictException('O evento climático já está encerrado.');
    }

    return this.encerrarEvento(evento);
  }

  async encerrarEvento(
    evento: EventoClimatico,
    trx?: Knex.Transaction,
  ): Promise<EventoClimatico> {
    if (trx) {
      return this.executarEncerramento(evento, trx);
    }

    return knex.transaction((novaTrx) =>
      this.executarEncerramento(evento, novaTrx),
    );
  }

  async encerrarAtivosDaTemporada(
    temporada_id: string,
    trx?: Knex.Transaction,
  ): Promise<number> {
    const ativos = await this.eventosRepository.listarAtivosPorTemporada(
      temporada_id,
      trx,
    );

    for (const evento of ativos) {
      await this.encerrarEvento(evento, trx);
    }

    return ativos.length;
  }

  private async executarEncerramento(
    evento: EventoClimatico,
    trx: Knex.Transaction,
  ): Promise<EventoClimatico> {
    const atualizado = await this.eventosRepository.update(
      evento.id,
      { status: StatusEvento.ENCERRADO },
      trx,
    );
    if (!atualizado) {
      throw new NotFoundException('Evento climático não encontrado.');
    }

    await this.fazendasPort.reverterModificadorTurma(
      evento.turma_id,
      evento.id,
      trx,
    );

    return this.converterNumeros(atualizado);
  }

  private validarCoerencia(dto: CreateEventoClimaticoDto) {
    if (dto.multiplicador === 1) {
      throw new UnprocessableEntityException(
        'O multiplicador não pode ser 1, pois o evento não teria efeito.',
      );
    }

    const regra = regrasPorTipo[dto.tipo];

    if (!regra.alvos.includes(dto.alvo)) {
      throw new UnprocessableEntityException(
        `O evento ${dto.tipo} só pode afetar ${regra.alvos.join(' ou ')}.`,
      );
    }

    if (regra.aumenta && dto.multiplicador < 1) {
      throw new UnprocessableEntityException(
        `O evento ${dto.tipo} aumenta o alvo, então o multiplicador deve ser maior que 1.`,
      );
    }

    if (!regra.aumenta && dto.multiplicador > 1) {
      throw new UnprocessableEntityException(
        `O evento ${dto.tipo} reduz o alvo, então o multiplicador deve ser menor que 1.`,
      );
    }
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
        'Você só pode gerenciar eventos das suas próprias turmas.',
      );
    }
  }

  private converterNumeros(evento: EventoClimatico): EventoClimatico {
    return {
      ...evento,
      multiplicador: Number(evento.multiplicador),
    };
  }
}
