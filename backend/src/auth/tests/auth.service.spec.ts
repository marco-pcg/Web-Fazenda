import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UsuariosRepository } from '../../usuarios/usuarios.repository';
import { PerfisRepository } from '../../perfis/perfis.repository';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  const usuariosRepository = {
    findForAuth: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const perfisRepository = {
    findPermissoesByPerfilId: jest.fn(),
    findByNome: jest.fn(),
  };
  const jwtService = { sign: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosRepository, useValue: usuariosRepository },
        { provide: PerfisRepository, useValue: perfisRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('signs a token with the user profile and permissions', async () => {
    usuariosRepository.findForAuth.mockResolvedValue({
      id: 'user-id',
      email: 'ana@example.com',
      senha: 'stored-hash',
      perfil_id: 'profile-id',
      perfil_nome: 'aluno',
      turma_id: 'class-id',
    });
    perfisRepository.findPermissoesByPerfilId.mockResolvedValue([
      { nome: 'turmas:listar' },
      { nome: 'turmas:visualizar' },
    ]);
    jwtService.sign.mockReturnValue('signed-token');

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(
      service.login({ email: 'ana@example.com', senha: 'secret' }),
    ).resolves.toEqual({ access_token: 'signed-token' });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user-id',
      email: 'ana@example.com',
      perfil: 'aluno',
      permissoes: ['turmas:listar', 'turmas:visualizar'],
      turma_id: 'class-id',
    });
  });

  it('rejects invalid credentials before loading permissions', async () => {
    usuariosRepository.findForAuth.mockResolvedValue(undefined);

    await expect(
      service.login({ email: 'missing@example.com', senha: 'secret' }),
    ).rejects.toThrow('Credenciais incorretas');
    expect(perfisRepository.findPermissoesByPerfilId).not.toHaveBeenCalled();
  });

  it('assigns the aluno profile during registration when none is provided', async () => {
    usuariosRepository.findByEmail.mockResolvedValue(undefined);
    perfisRepository.findByNome.mockResolvedValue({ id: 'aluno-profile' });
    usuariosRepository.create.mockResolvedValue([
      {
        id: 'user-id',
        nome: 'Ana',
        email: 'ana@example.com',
        senha: 'hash',
        perfil_id: 'aluno-profile',
        turma_id: null,
      },
    ]);

    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash');

    await expect(
      service.registro({
        nome: 'Ana',
        email: 'ana@example.com',
        senha: 'secret',
      }),
    ).resolves.toEqual({
      id: 'user-id',
      nome: 'Ana',
      email: 'ana@example.com',
      perfil_id: 'aluno-profile',
      turma_id: null,
    });
    expect(usuariosRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ perfil_id: 'aluno-profile', turma_id: null }),
    );
  });
});
