import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { UsuariosRepository } from './usuarios.repository';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly repository: UsuariosRepository) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const userExists = await this.repository.findByEmail(
      createUsuarioDto.email,
    );
    if (userExists) {
      throw new ConflictException('Usuário já cadastrado');
    }

    const salt = await bcrypt.genSalt();
    const senhaHash = await bcrypt.hash(createUsuarioDto.senha, salt);

    const newUserData = {
      id: randomUUID(),
      nome: createUsuarioDto.nome,
      email: createUsuarioDto.email,
      senha: senhaHash,
      perfil_id: createUsuarioDto.perfil_id,
      turma_id: createUsuarioDto.turma_id || null,
    };

    const [newUser] = await this.repository.create(newUserData);
    const { senha, ...userSemSenha } = newUser;
    return userSemSenha;
  }

  async findAll(filtros: FilterUsuarioDto) {
    const page = Number(filtros.page) || 1;
    const limit = Number(filtros.limit) || 10;
    const offset = (page - 1) * limit;

    const { dados, total } = await this.repository.findAllPaginated(
      filtros,
      limit,
      offset,
    );

    return {
      dados,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const { senha, ...userSemSenha } = user;
    return userSemSenha;
  }

  async findByEmail(email: string) {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const { senha, ...userSemSenha } = user;
    return userSemSenha;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findById(id);

    let dadosAtualizacao: any = { ...updateUsuarioDto };
    if (updateUsuarioDto.senha) {
      const salt = await bcrypt.genSalt();
      dadosAtualizacao.senha = await bcrypt.hash(updateUsuarioDto.senha, salt);
    }

    const [userUpdated] = await this.repository.update(id, dadosAtualizacao);
    const { senha, ...userUpdatedSemSenha } = userUpdated;
    return userUpdatedSemSenha;
  }

  async remove(id: string) {
    await this.findById(id);
    await this.repository.remove(id);
  }
}
