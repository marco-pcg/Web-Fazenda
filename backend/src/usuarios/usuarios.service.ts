import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosRepository } from './usuarios.repository';
import { FilterUsuarioDto } from './dto/filter-usuario.dto';
import { httpExceptions } from 'src/common/errors-handler/http-exceptions';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly repository: UsuariosRepository) { }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuarioExistente = await this.repository.findByEmail(createUsuarioDto.email);

    if (usuarioExistente) {
      throw httpExceptions().conflict();
    }

    const { senha: senhaAvulsa, ...dadosLimpos } = createUsuarioDto;

    const salt = await bcrypt.genSalt();
    const hashDeSenha = await bcrypt.hash(senhaAvulsa, salt);

    const usuario = { id: randomUUID(), ...dadosLimpos, senha: hashDeSenha };

    const created = await this.repository.create(usuario);
    const { senha, ...userSemSenha } = created;
    return userSemSenha;
  }

  async findAll(filter: FilterUsuarioDto) {
    const pagina = Number(filter.pagina) || 1;
    const limite = Number(filter.limite) || 10;
    const offset = (pagina - 1) * limite;

    const { dados, total } = await this.repository.findAll(filter, limite, offset);
    return {
      dados,
      meta: {
        total,
        pagina,
        limite,
        lastPage: Math.ceil(total / limite)
      },
    };
  }

  async findOne(id: string) {
    const usuarioExistente = await this.repository.findById(id);

    if (!usuarioExistente) {
      throw httpExceptions().notFound();
    }

    const { senha, ...usuario } = usuarioExistente;
    return usuario;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id);

    const updatedData: any = { ...updateUsuarioDto };

    if (updateUsuarioDto.senha) {
      const salt = await bcrypt.genSalt();
      updatedData.senha = await bcrypt.hash(updateUsuarioDto.senha, salt);
    }

    const updated = await this.repository.update(id, updatedData);
    const { senha, ...usuario } = updated;
    return usuario;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete(id);
  }
}
