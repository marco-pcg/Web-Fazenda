import { ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { database as knex } from '../src/db/knex-connection';
import { AlimentacoesRepository } from '../src/estacoes-animais/rebanhos/alimentacoes.repository';
import { AlimentacoesService } from '../src/estacoes-animais/rebanhos/alimentacoes.service';
import { RebanhosRepository } from '../src/estacoes-animais/rebanhos/rebanhos.repository';
import { EspeciesRepository } from '../src/estacoes-animais/especies/especies.repository';
import { TemporadasRepository } from '../src/estacoes-animais/temporadas/temporadas.repository';
import { TemporadasService } from '../src/estacoes-animais/temporadas/temporadas.service';
import { EstacoesRepository } from '../src/estacoes-animais/estacoes/estacoes.repository';
import { EventosClimaticosRepository } from '../src/estacoes-animais/eventos-climaticos/eventos-climaticos.repository';
import { EventosClimaticosService } from '../src/estacoes-animais/eventos-climaticos/eventos-climaticos.service';
import { EstoqueAdapter } from '../src/estacoes-animais/ports/estoque.adapter';
import { FazendasAdapter } from '../src/estacoes-animais/ports/fazendas.adapter';
import { TurmasAdapter } from '../src/estacoes-animais/ports/turmas.adapter';
import { TemporadaAvancoProducer } from '../src/estacoes-animais/queue/temporada-avanco.producer';
import { AlvoEvento, StatusTemporada } from '../src/common/enums/enums';
import type { UsuarioLogado } from '../src/estacoes-animais/common/usuario-logado';

const enabled = process.env.RUN_POSTGRES_INTEGRATION === '1';
const describeIntegration = enabled ? describe : describe.skip;

describeIntegration('Estacoes/Animais PostgreSQL integration', () => {
  const turmaId = randomUUID();
  const professorId = randomUUID();
  const outroProfessorId = randomUUID();
  const fazendaId = randomUUID();
  const especieId = randomUUID();
  const rebanhoId = randomUUID();
  const temporadaId = randomUUID();

  const rebanhosRepository = new RebanhosRepository();
  const alimentacoesRepository = new AlimentacoesRepository();
  const especiesRepository = new EspeciesRepository();
  const temporadasRepository = new TemporadasRepository();
  const estacoesRepository = new EstacoesRepository();
  const fazendasAdapter = new FazendasAdapter();
  const estoqueAdapter = new EstoqueAdapter();
  const turmasAdapter = new TurmasAdapter();
  const temporadasService = new TemporadasService(
    temporadasRepository,
    estacoesRepository,
    turmasAdapter,
  );
  const alimentacoesService = new AlimentacoesService(
    rebanhosRepository,
    alimentacoesRepository,
    especiesRepository,
    temporadasRepository,
    fazendasAdapter,
    estoqueAdapter,
  );
  const eventosRepository = new EventosClimaticosRepository();
  const eventosService = new EventosClimaticosService(
    eventosRepository,
    temporadasRepository,
    turmasAdapter,
    fazendasAdapter,
  );
  const professor: UsuarioLogado = {
    id: professorId,
    perfil: 'professor',
  };
  const otherProfessor: UsuarioLogado = {
    id: outroProfessorId,
    perfil: 'professor',
  };

  beforeAll(async () => {
    await knex.migrate.latest({
      directory: resolve(__dirname, '../src/db/migrations'),
    });
    const primavera =
      (await knex('estacoes').where({ nome: 'PRIMAVERA' }).first()) ||
      (await knex('estacoes')
        .insert({
          id: randomUUID(),
          nome: 'PRIMAVERA',
          ordem: 1,
          fator_produtividade: 1.1,
          fator_agua: 1,
        })
        .returning('*')
        .then(([station]) => station));

    await knex('perfis').insert([
      { id: randomUUID(), nome: `integration-${turmaId}`, ativo: true },
    ]);
    await knex('usuarios').insert([
      {
        id: professorId,
        nome: 'Integration Professor',
        email: `${professorId}@example.test`,
        senha: 'not-used',
        perfil_id: (
          await knex('perfis')
            .where({ nome: `integration-${turmaId}` })
            .first()
        ).id,
      },
      {
        id: outroProfessorId,
        nome: 'Other Professor',
        email: `${outroProfessorId}@example.test`,
        senha: 'not-used',
        perfil_id: (
          await knex('perfis')
            .where({ nome: `integration-${turmaId}` })
            .first()
        ).id,
      },
    ]);
    await knex('turmas').insert({
      id: turmaId,
      codigo: `I${turmaId.slice(0, 3)}`,
      nome: 'Integration class',
      ano: 2026,
      professor_id: professorId,
    });
    await knex('fazendas').insert({
      id: fazendaId,
      nome: 'Integration farm',
      turma_id: turmaId,
      usuario_id: professorId,
      agua_total: 100,
      agua_disponivel: 100,
      estacao_atual: 'primavera',
      temporada_atual: 1,
    });
    await knex('estoques').insert({
      fazenda_id: fazendaId,
      racao: 10,
      produtos: {},
    });
    await knex('especies').insert({
      id: especieId,
      nome: `Integration cattle ${especieId.slice(0, 8)}`,
      produto: 'leite',
      unidade_produto: 'litros',
      consumo_racao_por_animal: 4,
      producao_por_animal: 2,
      preco_base: 10,
    });
    await knex('rebanhos').insert({
      id: rebanhoId,
      fazenda_id: fazendaId,
      especie_id: especieId,
      quantidade: 3,
    });
    await knex('temporadas').insert({
      id: temporadaId,
      turma_id: turmaId,
      estacao_id: primavera.id,
      numero: 1,
      nome: 'Integration season',
      status: StatusTemporada.ATIVA,
    });
  });

  afterAll(async () => {
    await knex('turmas').where({ id: turmaId }).del();
    await knex('eventos_climaticos').where({ turma_id: turmaId }).del();
    await knex('temporadas').where({ turma_id: turmaId }).del();
    await knex('fazendas').where({ id: fazendaId }).del();
    await knex('usuarios').whereIn('id', [professorId, outroProfessorId]).del();
    await knex('especies').where({ id: especieId }).del();
    await knex('perfis')
      .where({ nome: `integration-${turmaId}` })
      .del();
    await knex.destroy();
  });

  it('enforces professor ownership and persists stock consumption', async () => {
    await expect(
      temporadasService.criar(
        { turma_id: turmaId, estacao_id: randomUUID(), nome: 'Denied' },
        otherProfessor,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    const result = await alimentacoesService.alimentarRebanho(rebanhoId, {
      temporada_id: temporadaId,
    });
    expect(result).toMatchObject({
      racao_necessaria: 12,
      racao_fornecida: 10,
      proporcao_atendida: 0.8333,
      saude: 'SUBNUTRIDO',
    });

    await expect(
      knex('estoques').where({ fazenda_id: fazendaId }).first(),
    ).resolves.toMatchObject({ racao: '0.0000' });
    await expect(
      knex('rebanhos').where({ id: rebanhoId }).first(),
    ).resolves.toMatchObject({ saude: 'SUBNUTRIDO' });
  });

  it('applies and reverts climate modifiers in PostgreSQL', async () => {
    const evento = await eventosService.criar(
      {
        temporada_id: temporadaId,
        tipo: 'CHUVA_FORTE',
        alvo: AlvoEvento.AGUA,
        multiplicador: 1.5,
        descricao: 'Integration rain',
      },
      professor,
    );
    await expect(
      knex('fazendas').where({ id: fazendaId }).first(),
    ).resolves.toMatchObject({ fator_agua: '1.5000' });

    await eventosService.encerrar(evento.id, professor);
    await expect(
      knex('fazendas').where({ id: fazendaId }).first(),
    ).resolves.toMatchObject({ fator_agua: '1.0000' });
    await expect(
      knex('fazenda_modificadores_climaticos')
        .where({ evento_id: evento.id })
        .first(),
    ).resolves.toBeUndefined();
  });

  it('advances a season and rolls back a failed transaction', async () => {
    await knex('temporadas')
      .where({ id: temporadaId })
      .update({ status: StatusTemporada.PROCESSANDO });
    const producer = new TemporadaAvancoProducer(
      temporadasService,
      temporadasRepository,
      eventosService,
    );
    const result = await producer.enfileirar(
      temporadaId,
      StatusTemporada.ATIVA,
    );
    expect(result).toBe(`provisorio-${temporadaId}`);
    const nextSeason = await knex('temporadas')
      .where({ turma_id: turmaId, status: StatusTemporada.ATIVA })
      .first();
    await expect(
      knex('temporadas').where({ id: temporadaId }).first(),
    ).resolves.toMatchObject({ status: StatusTemporada.ENCERRADA });
    await expect(
      knex.transaction(async (trx) => {
        await trx('temporadas')
          .where({ id: nextSeason.id })
          .update({ status: StatusTemporada.PROCESSANDO });
        throw new Error('forced rollback');
      }),
    ).rejects.toThrow('forced rollback');
    await expect(
      knex('temporadas').where({ id: nextSeason.id }).first(),
    ).resolves.toMatchObject({ status: StatusTemporada.ATIVA });
  });
});
