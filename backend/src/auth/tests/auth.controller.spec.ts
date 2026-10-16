import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const service = {
    login: jest.fn(),
    registro: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('returns the authenticated user from the request', async () => {
    const user = { id: 'user-id', perfil: 'aluno' };
    await expect(controller.getMe({ user })).resolves.toEqual(user);
  });

  it('delegates login to the auth service', async () => {
    const dto = { email: 'ana@example.com', senha: 'secret' };
    service.login.mockResolvedValue({ access_token: 'token' });

    await expect(controller.login(dto)).resolves.toEqual({
      access_token: 'token',
    });
    expect(service.login).toHaveBeenCalledWith(dto);
  });
});
