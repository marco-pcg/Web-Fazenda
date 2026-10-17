import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosRepository } from '../usuarios/usuarios.repository';
import { PerfisRepository } from '../perfis/perfis.repository';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosRepository: UsuariosRepository,
    private readonly perfisRepository: PerfisRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosRepository.findForAuth(loginDto.email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciais incorretas.');
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, usuario.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais incorretas.');
    }

    const permissoes = await this.perfisRepository.findPermissoesByPerfilId(
      usuario.perfil_id,
    );
    const listaPermissoes = permissoes.map((p: any) => p.nome);

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil_nome,
      permissoes: listaPermissoes,
      turma_id: usuario.turma_id ?? null,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async registro(createUsuarioDto: CreateUsuarioDto) {
    const existente = await this.usuariosRepository.findByEmail(
      createUsuarioDto.email,
    );
    if (existente) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(createUsuarioDto.senha, salt);

    let perfilId = createUsuarioDto.perfil_id;
    if (!perfilId) {
      const perfilAluno = await this.perfisRepository.findByNome('aluno');
      perfilId = perfilAluno?.id;
    }

    const newUserData = {
      id: randomUUID(),
      nome: createUsuarioDto.nome,
      email: createUsuarioDto.email,
      senha: senhaHash,
      perfil_id: perfilId,
      turma_id: createUsuarioDto.turma_id || null,
    };

    const [createdUser] = await this.usuariosRepository.create(newUserData);
    const { senha, ...userSemSenha } = createdUser;
    return userSemSenha;
  }
}
