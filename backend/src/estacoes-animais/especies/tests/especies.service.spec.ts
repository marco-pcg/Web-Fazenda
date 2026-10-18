import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EspeciesService } from '../especies.service';
import { EspeciesRepository } from '../especies.repository';

jest.mock('../../../db/knex-connection', () => ({ database: jest.fn() }));

describe('EspeciesService', () => {
  let service: EspeciesService;

  const mockEspeciesRepository = {
    listar: jest.fn(),
    findById: jest.fn(),
    findByNome: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  };

  const vacaDoBanco = {
    id: 'id-vaca',
    nome: 'Vaca',
    produto: 'leite',
    unidade_produto: 'litro',
    consumo_racao_por_animal: '60.0000',
    producao_por_animal: '300.0000',
    preco_base: '2.50',
    taxa_crescimento: '0.0300',
    ativo: true,
  };

  const novaEspecie = {
    nome: 'Cabra',
    produto: 'leite',
    unidade_produto: 'litro',
    consumo_racao_por_animal: 20,
    producao_por_animal: 90,
    preco_base: 3.5,
    taxa_crescimento: 0.05,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EspeciesService,
        {
          provide: EspeciesRepository,
          useValue: mockEspeciesRepository,
        },
      ],
    }).compile();

    service = module.get<EspeciesService>(EspeciesService);
  });

  it('cria uma espécie com sucesso', async () => {
    mockEspeciesRepository.findByNome.mockResolvedValue(undefined);
    mockEspeciesRepository.insert.mockResolvedValue({
      id: 'id-cabra',
      ...novaEspecie,
      ativo: true,
    });

    const especie = await service.criar(novaEspecie);

    expect(especie.nome).toBe('Cabra');
    expect(mockEspeciesRepository.insert).toHaveBeenCalledWith({
      ...novaEspecie,
      ativo: true,
    });
  });

  it('não cria espécie com nome repetido', async () => {
    mockEspeciesRepository.findByNome.mockResolvedValue(vacaDoBanco);

    await expect(
      service.criar({ ...novaEspecie, nome: 'Vaca' }),
    ).rejects.toThrow(ConflictException);
    expect(mockEspeciesRepository.insert).not.toHaveBeenCalled();
  });

  it('atualiza uma espécie com sucesso', async () => {
    mockEspeciesRepository.findById.mockResolvedValue(vacaDoBanco);
    mockEspeciesRepository.update.mockResolvedValue({
      ...vacaDoBanco,
      preco_base: '3.00',
    });

    const especie = await service.atualizar('id-vaca', { preco_base: 3 });

    expect(especie.preco_base).toBe(3);
    expect(mockEspeciesRepository.update).toHaveBeenCalledWith('id-vaca', {
      preco_base: 3,
    });
  });

  it('retorna 404 ao atualizar espécie que não existe', async () => {
    mockEspeciesRepository.findById.mockResolvedValue(undefined);

    await expect(
      service.atualizar('id-inexistente', { preco_base: 3 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('não atualiza para o nome de outra espécie', async () => {
    mockEspeciesRepository.findById.mockResolvedValue(vacaDoBanco);
    mockEspeciesRepository.findByNome.mockResolvedValue({
      ...vacaDoBanco,
      id: 'id-porco',
      nome: 'Porco',
    });

    await expect(
      service.atualizar('id-vaca', { nome: 'Porco' }),
    ).rejects.toThrow(ConflictException);
    expect(mockEspeciesRepository.update).not.toHaveBeenCalled();
  });

  it('converte os decimais para número', async () => {
    mockEspeciesRepository.listar.mockResolvedValue({
      data: [vacaDoBanco],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    const resultado = await service.listar({ page: 1, limit: 10 });
    const vaca = resultado.data[0];

    expect(vaca.consumo_racao_por_animal).toBe(60);
    expect(vaca.producao_por_animal).toBe(300);
    expect(vaca.preco_base).toBe(2.5);
    expect(vaca.taxa_crescimento).toBe(0.03);
  });
});
