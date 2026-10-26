import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Knex } from 'knex';
import { EventosClimaticosService } from '../eventos-climaticos.service';
import { EventosClimaticosRepository } from '../eventos-climaticos.repository';
import { TemporadasRepository } from '../../temporadas/temporadas.repository';
import { TURMAS_PORT } from '../../ports/turmas.port';
import { FAZENDAS_PORT } from '../../ports/fazendas.port';
import {
  AlvoEvento,
  StatusEvento,
  StatusTemporada,
  TipoEvento,
} from '../../../common/enums/enums';

jest.mock('../../../db/knex-connection', () => ({
  database: {
    transaction: (callback: (trx: string) => unknown) => callback('trx-falso'),
  },
}));

describe('EventosClimaticosService', () => {
  let service: EventosClimaticosService;

  const mockEventosRepository = {
    listar: jest.fn(),
    findById: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    listarAtivosPorTemporada: jest.fn(),
  };

  const mockTemporadasRepository = {
    findById: jest.fn(),
  };

  const mockTurmasPort = {
    professorEhDaTurma: jest.fn(),
    turmaDoUsuario: jest.fn(),
  };

  const mockFazendasPort = {
    aplicarModificadorTurma: jest.fn(),
    reverterModificadorTurma: jest.fn(),
  };

  const admin = {
    id: 'id-admin',
    email: 'admin@teste.com',
    perfil: 'admin',
    permissoes: [],
  };
  const professor = {
    id: 'id-prof',
    email: 'prof@teste.com',
    perfil: 'professor',
    permissoes: [],
  };
  const aluno = {
    id: 'id-aluno',
    email: 'aluno@teste.com',
    perfil: 'aluno',
    permissoes: [],
  };

  const temporadaAtiva = {
    id: 'id-temporada',
    turma_id: 'id-turma',
    status: StatusTemporada.ATIVA,
  };

  const seca = {
    temporada_id: 'id-temporada',
    tipo: TipoEvento.SECA,
    alvo: AlvoEvento.AGUA,
    multiplicador: 0.7,
  };

  const eventoDoBanco = {
    id: 'id-evento',
    temporada_id: 'id-temporada',
    turma_id: 'id-turma',
    tipo: TipoEvento.SECA,
    alvo: AlvoEvento.AGUA,
    multiplicador: '0.7000',
    descricao: null,
    status: StatusEvento.ATIVO,
    criado_por: 'id-prof',
    created_at: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventosClimaticosService,
        {
          provide: EventosClimaticosRepository,
          useValue: mockEventosRepository,
        },
        { provide: TemporadasRepository, useValue: mockTemporadasRepository },
        { provide: TURMAS_PORT, useValue: mockTurmasPort },
        { provide: FAZENDAS_PORT, useValue: mockFazendasPort },
      ],
    }).compile();

    service = module.get<EventosClimaticosService>(EventosClimaticosService);
  });

  describe('criar', () => {
    it('cria o evento e aplica o modificador em todas as fazendas da turma', async () => {
      mockTemporadasRepository.findById.mockResolvedValue(temporadaAtiva);
      mockTurmasPort.professorEhDaTurma.mockResolvedValue(true);
      mockEventosRepository.insert.mockResolvedValue(eventoDoBanco);

      const evento = await service.criar(seca, professor);

      expect(mockEventosRepository.insert).toHaveBeenCalledWith(
        {
          temporada_id: 'id-temporada',
          turma_id: 'id-turma',
          tipo: TipoEvento.SECA,
          alvo: AlvoEvento.AGUA,
          multiplicador: 0.7,
          descricao: null,
          status: StatusEvento.ATIVO,
          criado_por: 'id-prof',
        },
        'trx-falso',
      );
      expect(mockFazendasPort.aplicarModificadorTurma).toHaveBeenCalledTimes(1);
      expect(mockFazendasPort.aplicarModificadorTurma).toHaveBeenCalledWith(
        'id-turma',
        { alvo: AlvoEvento.AGUA, multiplicador: 0.7, eventoId: 'id-evento' },
        'trx-falso',
      );
      expect(evento.multiplicador).toBe(0.7);
    });

    it('retorna 404 quando a temporada não existe', async () => {
      mockTemporadasRepository.findById.mockResolvedValue(undefined);

      await expect(service.criar(seca, admin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna 422 quando a temporada não está ativa', async () => {
      mockTemporadasRepository.findById.mockResolvedValue({
        ...temporadaAtiva,
        status: StatusTemporada.PLANEJADA,
      });

      await expect(service.criar(seca, admin)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('retorna 403 para professor de outra turma', async () => {
      mockTemporadasRepository.findById.mockResolvedValue(temporadaAtiva);
      mockTurmasPort.professorEhDaTurma.mockResolvedValue(false);

      await expect(service.criar(seca, professor)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockEventosRepository.insert).not.toHaveBeenCalled();
    });

    it('deixa o admin criar em qualquer turma', async () => {
      mockTemporadasRepository.findById.mockResolvedValue(temporadaAtiva);
      mockEventosRepository.insert.mockResolvedValue(eventoDoBanco);

      await service.criar(seca, admin);

      expect(mockTurmasPort.professorEhDaTurma).not.toHaveBeenCalled();
      expect(mockEventosRepository.insert).toHaveBeenCalled();
    });

    it.each([
      ['SECA com multiplicador maior que 1', { ...seca, multiplicador: 1.5 }],
      [
        'SECA com alvo PRODUTIVIDADE',
        { ...seca, alvo: AlvoEvento.PRODUTIVIDADE },
      ],
      [
        'BOA_SAFRA com multiplicador menor que 1',
        {
          ...seca,
          tipo: TipoEvento.BOA_SAFRA,
          alvo: AlvoEvento.PRODUTIVIDADE,
          multiplicador: 0.8,
        },
      ],
      ['multiplicador igual a 1', { ...seca, multiplicador: 1 }],
    ])('retorna 422 para %s', async (_descricao, dto) => {
      mockTemporadasRepository.findById.mockResolvedValue(temporadaAtiva);

      await expect(service.criar(dto, admin)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockEventosRepository.insert).not.toHaveBeenCalled();
    });

    it('repassa o erro quando o port falha', async () => {
      mockTemporadasRepository.findById.mockResolvedValue(temporadaAtiva);
      mockEventosRepository.insert.mockResolvedValue(eventoDoBanco);
      mockFazendasPort.aplicarModificadorTurma.mockRejectedValue(
        new Error('falha nas fazendas'),
      );

      await expect(service.criar(seca, admin)).rejects.toThrow(
        'falha nas fazendas',
      );
    });
  });

  describe('listar', () => {
    it('força a turma do aluno', async () => {
      mockTurmasPort.turmaDoUsuario.mockResolvedValue('turma-do-aluno');
      mockEventosRepository.listar.mockResolvedValue({
        data: [eventoDoBanco],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const resultado = await service.listar(
        { pagina: 1, limite: 10, turma_id: 'outra-turma' },
        aluno,
      );

      expect(mockEventosRepository.listar).toHaveBeenCalledWith(
        expect.objectContaining({ turma_id: 'turma-do-aluno' }),
        1,
        10,
      );
      expect(resultado.data[0].multiplicador).toBe(0.7);
    });

    it('devolve lista vazia para aluno sem turma', async () => {
      mockTurmasPort.turmaDoUsuario.mockResolvedValue(null);

      const resultado = await service.listar({ pagina: 1, limite: 10 }, aluno);

      expect(resultado.data).toEqual([]);
      expect(mockEventosRepository.listar).not.toHaveBeenCalled();
    });
  });

  describe('encerrar', () => {
    it('encerra o evento e reverte o modificador', async () => {
      mockEventosRepository.findById.mockResolvedValue(eventoDoBanco);
      mockEventosRepository.update.mockResolvedValue({
        ...eventoDoBanco,
        status: StatusEvento.ENCERRADO,
      });

      const evento = await service.encerrar('id-evento', admin);

      expect(mockEventosRepository.update).toHaveBeenCalledWith(
        'id-evento',
        { status: StatusEvento.ENCERRADO },
        'trx-falso',
      );
      expect(mockFazendasPort.reverterModificadorTurma).toHaveBeenCalledWith(
        'id-turma',
        'id-evento',
        'trx-falso',
      );
      expect(evento.status).toBe(StatusEvento.ENCERRADO);
      expect(evento.multiplicador).toBe(0.7);
    });

    it('retorna 404 quando o evento não existe', async () => {
      mockEventosRepository.findById.mockResolvedValue(undefined);

      await expect(service.encerrar('id-evento', admin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna 403 para professor de outra turma', async () => {
      mockEventosRepository.findById.mockResolvedValue(eventoDoBanco);
      mockTurmasPort.professorEhDaTurma.mockResolvedValue(false);

      await expect(service.encerrar('id-evento', professor)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('retorna 409 quando o evento já está encerrado', async () => {
      mockEventosRepository.findById.mockResolvedValue({
        ...eventoDoBanco,
        status: StatusEvento.ENCERRADO,
      });

      await expect(service.encerrar('id-evento', admin)).rejects.toThrow(
        ConflictException,
      );
      expect(mockFazendasPort.reverterModificadorTurma).not.toHaveBeenCalled();
    });
  });

  describe('encerrarAtivosDaTemporada', () => {
    it('encerra todos os eventos ativos da temporada', async () => {
      const trxRecebida = {} as Knex.Transaction;
      mockEventosRepository.listarAtivosPorTemporada.mockResolvedValue([
        eventoDoBanco,
        { ...eventoDoBanco, id: 'id-evento-2' },
      ]);
      mockEventosRepository.update.mockResolvedValue({
        ...eventoDoBanco,
        status: StatusEvento.ENCERRADO,
      });

      const total = await service.encerrarAtivosDaTemporada(
        'id-temporada',
        trxRecebida,
      );

      expect(total).toBe(2);
      expect(mockEventosRepository.update).toHaveBeenCalledTimes(2);
      expect(mockFazendasPort.reverterModificadorTurma).toHaveBeenCalledWith(
        'id-turma',
        'id-evento-2',
        trxRecebida,
      );
    });

    it('não faz nada quando não há eventos ativos', async () => {
      mockEventosRepository.listarAtivosPorTemporada.mockResolvedValue([]);

      const total = await service.encerrarAtivosDaTemporada('id-temporada');

      expect(total).toBe(0);
      expect(mockEventosRepository.update).not.toHaveBeenCalled();
      expect(mockFazendasPort.reverterModificadorTurma).not.toHaveBeenCalled();
    });
  });
});
