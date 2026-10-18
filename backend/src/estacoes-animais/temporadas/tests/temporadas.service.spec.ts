import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TemporadasService } from '../temporadas.service';
import { TemporadasRepository } from '../temporadas.repository';
import { EstacoesRepository } from '../../estacoes/estacoes.repository';
import { TURMAS_PORT } from '../../ports/turmas.port';
import { StatusTemporada } from '../../../common/enums/enums';

jest.mock('../../../db/knex-connection', () => ({ database: jest.fn() }));

describe('TemporadasService', () => {
  let service: TemporadasService;
  const qualquerData: unknown = expect.any(Date);

  const mockTemporadasRepository = {
    listar: jest.fn(),
    findById: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    proximoNumero: jest.fn(),
    findAtivaDaTurma: jest.fn(),
    findPlanejadaMaisAntiga: jest.fn(),
  };

  const mockEstacoesRepository = {
    findById: jest.fn(),
    findSeguinte: jest.fn(),
    findPrimeira: jest.fn(),
  };

  const mockTurmasPort = {
    existe: jest.fn(),
    professorEhDaTurma: jest.fn(),
    turmaDoUsuario: jest.fn(),
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

  const novaTemporada = {
    turma_id: 'id-turma',
    estacao_id: 'id-primavera',
    nome: 'Temporada 1',
  };

  const temporadaDoBanco = {
    id: 'id-temporada',
    turma_id: 'id-turma',
    estacao_id: 'id-inverno',
    numero: 1,
    nome: 'Temporada 1',
    status: StatusTemporada.PLANEJADA,
    data_inicio: null,
    data_fim: null,
    created_at: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemporadasService,
        { provide: TemporadasRepository, useValue: mockTemporadasRepository },
        { provide: EstacoesRepository, useValue: mockEstacoesRepository },
        { provide: TURMAS_PORT, useValue: mockTurmasPort },
      ],
    }).compile();

    service = module.get<TemporadasService>(TemporadasService);
  });

  describe('criar', () => {
    it('cria uma temporada planejada com o próximo número', async () => {
      mockTurmasPort.existe.mockResolvedValue(true);
      mockTurmasPort.professorEhDaTurma.mockResolvedValue(true);
      mockEstacoesRepository.findById.mockResolvedValue({ id: 'id-primavera' });
      mockTemporadasRepository.proximoNumero.mockResolvedValue(3);
      mockTemporadasRepository.insert.mockResolvedValue({ id: 'nova' });

      await service.criar(novaTemporada, professor);

      expect(mockTemporadasRepository.insert).toHaveBeenCalledWith({
        turma_id: 'id-turma',
        estacao_id: 'id-primavera',
        nome: 'Temporada 1',
        numero: 3,
        status: StatusTemporada.PLANEJADA,
        data_inicio: null,
        data_fim: null,
      });
    });

    it('retorna 404 quando a turma não existe', async () => {
      mockTurmasPort.existe.mockResolvedValue(false);

      await expect(service.criar(novaTemporada, admin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna 404 quando a estação não existe', async () => {
      mockTurmasPort.existe.mockResolvedValue(true);
      mockEstacoesRepository.findById.mockResolvedValue(undefined);

      await expect(service.criar(novaTemporada, admin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna 403 para professor de outra turma', async () => {
      mockTurmasPort.existe.mockResolvedValue(true);
      mockTurmasPort.professorEhDaTurma.mockResolvedValue(false);

      await expect(service.criar(novaTemporada, professor)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockTemporadasRepository.insert).not.toHaveBeenCalled();
    });

    it('retorna 400 quando a data de fim é anterior à de início', async () => {
      mockTurmasPort.existe.mockResolvedValue(true);
      mockEstacoesRepository.findById.mockResolvedValue({ id: 'id-primavera' });

      await expect(
        service.criar(
          {
            ...novaTemporada,
            data_inicio: '2026-12-01',
            data_fim: '2026-11-01',
          },
          admin,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listar', () => {
    it('filtra pela turma do aluno', async () => {
      mockTurmasPort.turmaDoUsuario.mockResolvedValue('turma-do-aluno');
      mockTemporadasRepository.listar.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      await service.listar(
        { page: 1, limit: 10, turma_id: 'outra-turma' },
        aluno,
      );

      expect(mockTemporadasRepository.listar).toHaveBeenCalledWith(
        expect.objectContaining({ turma_id: 'turma-do-aluno' }),
        1,
        10,
      );
    });

    it('devolve lista vazia para aluno sem turma', async () => {
      mockTurmasPort.turmaDoUsuario.mockResolvedValue(null);

      const resultado = await service.listar({ page: 1, limit: 10 }, aluno);

      expect(resultado.data).toEqual([]);
      expect(mockTemporadasRepository.listar).not.toHaveBeenCalled();
    });
  });

  describe('avancar', () => {
    it('retorna 404 quando a temporada não existe', async () => {
      mockTemporadasRepository.findById.mockResolvedValue(undefined);

      await expect(service.avancar('id-temporada', admin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna 403 para professor de outra turma', async () => {
      mockTemporadasRepository.findById.mockResolvedValue(temporadaDoBanco);
      mockTurmasPort.professorEhDaTurma.mockResolvedValue(false);

      await expect(service.avancar('id-temporada', professor)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('retorna 409 quando a temporada está em processamento', async () => {
      mockTemporadasRepository.findById.mockResolvedValue({
        ...temporadaDoBanco,
        status: StatusTemporada.PROCESSANDO,
      });

      await expect(service.avancar('id-temporada', admin)).rejects.toThrow(
        ConflictException,
      );
    });

    it('retorna 409 quando a temporada está encerrada', async () => {
      mockTemporadasRepository.findById.mockResolvedValue({
        ...temporadaDoBanco,
        status: StatusTemporada.ENCERRADA,
      });

      await expect(service.avancar('id-temporada', admin)).rejects.toThrow(
        ConflictException,
      );
    });

    it('retorna 422 quando a turma já tem uma temporada ativa', async () => {
      mockTemporadasRepository.findById.mockResolvedValue(temporadaDoBanco);
      mockTemporadasRepository.findAtivaDaTurma.mockResolvedValue({
        id: 'outra',
      });

      await expect(service.avancar('id-temporada', admin)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockTemporadasRepository.update).not.toHaveBeenCalled();
    });

    it('marca como PROCESSANDO e devolve o status anterior', async () => {
      mockTemporadasRepository.findById.mockResolvedValue(temporadaDoBanco);
      mockTemporadasRepository.findAtivaDaTurma.mockResolvedValue(undefined);

      const resultado = await service.avancar('id-temporada', admin);

      expect(mockTemporadasRepository.update).toHaveBeenCalledWith(
        'id-temporada',
        { status: StatusTemporada.PROCESSANDO },
      );
      expect(resultado).toEqual({
        temporada_id: 'id-temporada',
        status_anterior: StatusTemporada.PLANEJADA,
      });
    });
  });

  describe('ativar', () => {
    it('muda de PROCESSANDO para ATIVA e preenche a data de início', async () => {
      mockTemporadasRepository.findById.mockResolvedValue({
        ...temporadaDoBanco,
        status: StatusTemporada.PROCESSANDO,
      });
      mockTemporadasRepository.update.mockResolvedValue({ id: 'id-temporada' });

      await service.ativar('id-temporada');

      expect(mockTemporadasRepository.update).toHaveBeenCalledWith(
        'id-temporada',
        { status: StatusTemporada.ATIVA, data_inicio: qualquerData },
        undefined,
      );
    });
  });

  describe('encerrarEAtivarProxima', () => {
    const emProcessamento = {
      ...temporadaDoBanco,
      status: StatusTemporada.PROCESSANDO,
    };

    it('encerra e ativa a próxima temporada planejada', async () => {
      mockTemporadasRepository.findById.mockResolvedValue(emProcessamento);
      mockTemporadasRepository.findPlanejadaMaisAntiga.mockResolvedValue({
        ...temporadaDoBanco,
        id: 'id-planejada',
        numero: 2,
      });
      mockTemporadasRepository.update.mockResolvedValue({ id: 'id-planejada' });

      await service.encerrarEAtivarProxima('id-temporada');

      expect(mockTemporadasRepository.update).toHaveBeenCalledWith(
        'id-temporada',
        { status: StatusTemporada.ENCERRADA, data_fim: qualquerData },
        undefined,
      );
      expect(mockTemporadasRepository.update).toHaveBeenCalledWith(
        'id-planejada',
        { status: StatusTemporada.ATIVA, data_inicio: qualquerData },
        undefined,
      );
      expect(mockTemporadasRepository.insert).not.toHaveBeenCalled();
    });

    it('cria a próxima temporada voltando do inverno para a primavera', async () => {
      mockTemporadasRepository.findById.mockResolvedValue(emProcessamento);
      mockTemporadasRepository.findPlanejadaMaisAntiga.mockResolvedValue(
        undefined,
      );
      mockEstacoesRepository.findById.mockResolvedValue({
        id: 'id-inverno',
        ordem: 4,
      });
      mockEstacoesRepository.findSeguinte.mockResolvedValue(undefined);
      mockEstacoesRepository.findPrimeira.mockResolvedValue({
        id: 'id-primavera',
        ordem: 1,
      });
      mockTemporadasRepository.proximoNumero.mockResolvedValue(2);
      mockTemporadasRepository.insert.mockResolvedValue({ id: 'nova' });

      await service.encerrarEAtivarProxima('id-temporada');

      expect(mockTemporadasRepository.insert).toHaveBeenCalledWith(
        {
          turma_id: 'id-turma',
          estacao_id: 'id-primavera',
          numero: 2,
          nome: 'Temporada 2',
          status: StatusTemporada.ATIVA,
          data_inicio: qualquerData,
        },
        undefined,
      );
    });

    it('cria a próxima temporada com a estação seguinte', async () => {
      mockTemporadasRepository.findById.mockResolvedValue({
        ...emProcessamento,
        estacao_id: 'id-verao',
      });
      mockTemporadasRepository.findPlanejadaMaisAntiga.mockResolvedValue(
        undefined,
      );
      mockEstacoesRepository.findById.mockResolvedValue({
        id: 'id-verao',
        ordem: 2,
      });
      mockEstacoesRepository.findSeguinte.mockResolvedValue({
        id: 'id-outono',
        ordem: 3,
      });
      mockTemporadasRepository.proximoNumero.mockResolvedValue(2);
      mockTemporadasRepository.insert.mockResolvedValue({ id: 'nova' });

      await service.encerrarEAtivarProxima('id-temporada');

      expect(mockEstacoesRepository.findPrimeira).not.toHaveBeenCalled();
      expect(mockTemporadasRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({ estacao_id: 'id-outono' }),
        undefined,
      );
    });
  });
});
