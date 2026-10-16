import { Test, TestingModule } from '@nestjs/testing';
import { TurmasService } from '../turmas.service';
import { TurmasRepository } from '../turmas.repository';

describe('TurmasService', () => {
  let service: TurmasService;

  const mockTurmasRepository = {
    findByCode: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    verificarMatricula: jest.fn(),
    countAlunos: jest.fn(),
    adicionarAluno: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TurmasService,
        {
          provide: TurmasRepository,
          useValue: mockTurmasRepository,
        },
      ],
    }).compile();

    service = module.get<TurmasService>(TurmasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects duplicate class codes', async () => {
    mockTurmasRepository.findByCode.mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        codigo: 'T-01',
        nome: 'Turma 1',
        ano: 2026,
        max_alunos: 30,
        professor_id: 'professor-id',
      }),
    ).rejects.toThrow('Já existe uma turma cadastrada');
  });

  it('prevents a professor from accessing another professor’s class', async () => {
    mockTurmasRepository.findById.mockResolvedValue({
      id: 'class-id',
      professor_id: 'other-professor',
    });

    await expect(
      service.findById('class-id', { id: 'professor-id', perfil: 'professor' }),
    ).rejects.toThrow('Você só pode acessar turmas');
  });

  it('prevents enrollment after the class reaches capacity', async () => {
    mockTurmasRepository.findById.mockResolvedValue({
      id: 'class-id',
      professor_id: 'professor-id',
      max_alunos: 1,
    });
    mockTurmasRepository.verificarMatricula.mockResolvedValue(undefined);
    mockTurmasRepository.countAlunos.mockResolvedValue(1);

    await expect(
      service.adicionarAluno('class-id', 'student-id', {
        id: 'professor-id',
        perfil: 'professor',
      }),
    ).rejects.toThrow('capacidade máxima');
    expect(mockTurmasRepository.adicionarAluno).not.toHaveBeenCalled();
  });

  it('allows an eligible professor to enroll a student', async () => {
    mockTurmasRepository.findById.mockResolvedValue({
      id: 'class-id',
      professor_id: 'professor-id',
      max_alunos: 30,
    });
    mockTurmasRepository.verificarMatricula.mockResolvedValue(undefined);
    mockTurmasRepository.countAlunos.mockResolvedValue(0);
    mockTurmasRepository.adicionarAluno.mockResolvedValue({
      turma_id: 'class-id',
      aluno_id: 'student-id',
    });

    await expect(
      service.adicionarAluno('class-id', 'student-id', {
        id: 'professor-id',
        perfil: 'professor',
      }),
    ).resolves.toEqual({ turma_id: 'class-id', aluno_id: 'student-id' });
  });
});
