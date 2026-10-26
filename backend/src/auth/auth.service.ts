import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegistroDto } from './dto/registro.dto';
import { UsuariosRepository } from 'src/usuarios/usuarios.repository';
import { PerfisRepository } from 'src/perfis/perfis.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { httpExceptions } from 'src/common/errors-handler/http-exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosRepository: UsuariosRepository,
    private readonly perfisRepository: PerfisRepository,
    private readonly jwtService: JwtService,
  ) { }
  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosRepository.findForAuth(loginDto.email);
    if (!usuario) {
      throw httpExceptions().unauthorized();
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, usuario.senha)
    if (!senhaValida) {
      throw httpExceptions().unauthorized();
    }

    const permissoes = await this.perfisRepository.findPermissoesById(usuario.perfilId);
    const permissoesList = permissoes.map((p: any) => p.nome);

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil_nome,
      permissoes: permissoesList,
      turmaId: usuario.turmaId ?? null
    };

    return { token: this.jwtService.sign(payload) };
  }

  async registro(createUsuarioDto: CreateUsuarioDto) {
    const usuarioExistente = await this.usuariosRepository.findByEmail(createUsuarioDto.email);

    if (usuarioExistente) {
      throw httpExceptions().conflict();
    }

    const salt = await bcrypt.genSalt();
    const hashDeSenha = await bcrypt.hash(createUsuarioDto.senha, salt);

    let perfilId = createUsuarioDto.perfilId;
    if (!perfilId) {
      const perfil = await this.perfisRepository.findByNome('aluno');
      perfilId = perfil?.id;
    }

    const usuario = { id: randomUUID(), nome: createUsuarioDto.nome, email: createUsuarioDto.email, senha: hashDeSenha, perfilId, turmaId: createUsuarioDto.turmaId || undefined };
    const [created] = await this.usuariosRepository.create(usuario);
    const { senha, ...userSemSenha } = created;

    return userSemSenha;
  }

  async profile(id: string) {
    const usuarioExistente = await this.usuariosRepository.findById(id);
    if (!usuarioExistente) {
      throw httpExceptions().notFound();
    }

    const { senha, ...usuario } = usuarioExistente;
    return usuario;
  }
}
