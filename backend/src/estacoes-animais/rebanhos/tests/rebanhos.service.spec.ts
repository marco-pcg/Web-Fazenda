import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RebanhosService } from '../rebanhos.service';
import { RebanhosRepository } from '../rebanhos.repository';
import { AlimentacoesService } from '../alimentacoes.service';
import { EspeciesRepository } from '../../especies/especies.repository';
import { FAZENDAS_PORT } from '../../ports/fazendas.port';
import { TURMAS_PORT } from '../../ports/turmas.port';
import { SaudeRebanho } from '../../../common/enums/enums';

jest.mock('../../../db/knex-connection', () => ({ database: jest.fn() }));

describe('RebanhosService', () => {
  let service: RebanhosService;

  const mockRebanhosRepository = {
    listar: jest.fn(),
    findById: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    findPorFazendaEEspecie: jest.fn(),
  };

  const mockEspeciesRepository = {
    findById: jest.fn(),
  };

  const mockAlimentacoesService = {
    alimentarRebanho: jest.fn(),
  };

  const mockFazendasPort = {
    buscarPorId: jest.fn(),
    pertenceAoUsuario: jest.fn(),
    listarPorUsuario: jest.fn(),
  };

  const mockTurmasPort = {
    professorEhDaTurma: jest.fn(),
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

  const fazenda = {
    id: 'id-fazenda',
    nome: 'Fazenda',
    turmaId: 'id-turma',
    usuarioId: 'id-aluno',
  };

  const novoRebanho = {
    fazenda_id: 'id-fazenda',
    especie_id: 'id-galinha',
    quantidade: 100,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockEspeciesRepository.findById.mockResolvedValue({
      id: 'id-galinha',
      ativo: true,
    });
    mockFazendasPort.buscarPorId.mockResolvedValue(fazenda);
    mockFazendasPort.pertenceAoUsuario.mockResolvedValue(true);
    mockTurmasPort.professorEhDaTurma.mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RebanhosService,
        { provide: RebanhosRepository, useValue: mockRebanhosRepository },
        { provide: EspeciesRepository, useValue: mockEspeciesRepository },
        { provide: AlimentacoesService, useValue: mockAlimentacoesService },
        { provide: FAZENDAS_PORT, useValue: mockFazendasPort },
        { provide: TURMAS_PORT, useValue: mockTurmasPort },
      ],
    }).compile();

    service = module.get<RebanhosService>(RebanhosService);
  });

  describe('criar', () => {
    it('cria um rebanho saudável', async () => {
      mockRebanhosRepository.findPorFazendaEEspecie.mockResolvedValue(
        undefined,
      );
      mockRebanhosRepository.insert.mockResolvedValue({ id: 'novo' });

      await service.criar(novoRebanho, aluno);

      expect(mockRebanhosRepository.insert).toHaveBeenCalledWith({
        fazenda_id: 'id-fazenda',
        especie_id: 'id-galinha',
        quantidade: 100,
        saude: SaudeRebanho.SAUDAVEL,
      });
    });

    it('soma a quantidade quando a fazenda já tem rebanho da espécie', async () => {
      mockRebanhosRepository.findPorFazendaEEspecie.mockResolvedValue({
        id: 'id-rebanho',
        quantidade: 50,
      });
      mockRebanhosRepository.update.mockResolvedValue({
        id: 'id-rebanho',
        quantidade: 150,
      });

      const rebanho = await service.criar(novoRebanho, aluno);

      expect(mockRebanhosRepository.update).toHaveBeenCalledWith('id-rebanho', {
        quantidade: 150,
      });
      expect(mockRebanhosRepository.insert).not.toHaveBeenCalled();
      expect(rebanho.quantidade).toBe(150);
    });

    it('retorna 404 quando a espécie não existe', async () => {
      mockEspeciesRepository.findById.mockResolvedValue(undefined);

      await expect(service.criar(novoRebanho, admin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna 422 quando a espécie está inativa', async () => {
      mockEspeciesRepository.findById.mockResolvedValue({
        id: 'id-galinha',
        ativo: false,
      });

      await expect(service.criar(novoRebanho, admin)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('retorna 404 quando a fazenda não existe', async () => {
      mockFazendasPort.buscarPorId.mockResolvedValue(null);

      await expect(service.criar(novoRebanho, admin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna 403 para aluno em fazenda que não é dele', async () => {
      mockFazendasPort.pertenceAoUsuario.mockResolvedValue(false);

      await expect(service.criar(novoRebanho, aluno)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRebanhosRepository.insert).not.toHaveBeenCalled();
    });

    it('retorna 403 para professor de outra turma', async () => {
      mockTurmasPort.professorEhDaTurma.mockResolvedValue(false);

      await expect(service.criar(novoRebanho, professor)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deixa o professor passar quando a fazenda não tem turma', async () => {
      mockFazendasPort.buscarPorId.mockResolvedValue({
        ...fazenda,
        turmaId: null,
      });
      mockRebanhosRepository.findPorFazendaEEspecie.mockResolvedValue(
        undefined,
      );
      mockRebanhosRepository.insert.mockResolvedValue({ id: 'novo' });

      await service.criar(novoRebanho, professor);

      expect(mockTurmasPort.professorEhDaTurma).not.toHaveBeenCalled();
      expect(mockRebanhosRepository.insert).toHaveBeenCalled();
    });
  });

  describe('listar', () => {
    it('usa as fazendas do aluno', async () => {
      mockFazendasPort.listarPorUsuario.mockResolvedValue([
        { id: 'fazenda-1' },
        { id: 'fazenda-2' },
      ]);
      mockRebanhosRepository.listar.mockResolvedValue({ data: [], meta: {} });

      await service.listar({ page: 1, limit: 10 }, aluno);

      expect(mockRebanhosRepository.listar).toHaveBeenCalledWith(
        expect.objectContaining({ fazenda_ids: ['fazenda-1', 'fazenda-2'] }),
        1,
        10,
      );
    });

    it('devolve lista vazia para aluno sem fazendas', async () => {
      mockFazendasPort.listarPorUsuario.mockResolvedValue([]);

      const resultado = await service.listar({ page: 1, limit: 10 }, aluno);

      expect(resultado.data).toEqual([]);
      expect(mockRebanhosRepository.listar).not.toHaveBeenCalled();
    });

    it('devolve lista vazia quando o aluno filtra uma fazenda que não é dele', async () => {
      mockFazendasPort.listarPorUsuario.mockResolvedValue([
        { id: 'fazenda-1' },
      ]);

      const resultado = await service.listar(
        { page: 1, limit: 10, fazenda_id: 'fazenda-de-outro' },
        aluno,
      );

      expect(resultado.data).toEqual([]);
      expect(mockRebanhosRepository.listar).not.toHaveBeenCalled();
    });

    it('filtra pela fazenda enviada pelo professor', async () => {
      mockRebanhosRepository.listar.mockResolvedValue({ data: [], meta: {} });

      await service.listar(
        { page: 1, limit: 10, fazenda_id: 'fazenda-1' },
        professor,
      );

      expect(mockRebanhosRepository.listar).toHaveBeenCalledWith(
        expect.objectContaining({ fazenda_ids: ['fazenda-1'] }),
        1,
        10,
      );
    });
  });

  describe('alimentar', () => {
    it('retorna 404 quando o rebanho não existe', async () => {
      mockRebanhosRepository.findById.mockResolvedValue(undefined);

      await expect(service.alimentar('id-rebanho', admin)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna 403 para aluno em fazenda que não é dele', async () => {
      mockRebanhosRepository.findById.mockResolvedValue({
        id: 'id-rebanho',
        fazenda_id: 'id-fazenda',
      });
      mockFazendasPort.pertenceAoUsuario.mockResolvedValue(false);

      await expect(service.alimentar('id-rebanho', aluno)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockAlimentacoesService.alimentarRebanho).not.toHaveBeenCalled();
    });

    it('delega para o serviço de alimentação', async () => {
      mockRebanhosRepository.findById.mockResolvedValue({
        id: 'id-rebanho',
        fazenda_id: 'id-fazenda',
      });
      mockAlimentacoesService.alimentarRebanho.mockResolvedValue({
        proporcao_atendida: 1,
      });

      await service.alimentar('id-rebanho', aluno);

      expect(mockAlimentacoesService.alimentarRebanho).toHaveBeenCalledWith(
        'id-rebanho',
      );
    });
  });
});
