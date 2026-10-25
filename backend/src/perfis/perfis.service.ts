import { Injectable } from '@nestjs/common';
import { CreatePerfiDto } from './dto/create-perfi.dto';
import { UpdatePerfiDto } from './dto/update-perfi.dto';
import { PerfisRepository } from './perfis.repository';
import { httpExceptions } from 'src/common/errors-handler/http-exceptions';
import { randomUUID } from 'crypto';
import { PaginacaoDto } from 'src/common/dtos/paginacao.dto';

@Injectable()
export class PerfisService {
  constructor(private readonly repository: PerfisRepository) { }

  async create(createPerfiDto: CreatePerfiDto) {
    const perfilExistente = await this.repository.findByNome(createPerfiDto.nome);

    if (perfilExistente) {
      throw httpExceptions().conflict();
    }

    const perfil = { id: randomUUID(), ...createPerfiDto };
    const [created] = await this.repository.create(perfil);
    return created;
  }

  async findAll(filter: PaginacaoDto) {
    const perfis = await this.repository.findAll(filter);
    return perfis;
  }

  async findOne(id: string) {
    const perfil = await this.repository.findById(id);

    if (!perfil) {
      throw httpExceptions().notFound();
    }

    const permissoes = await this.repository.findPermissoesById(id);
    return { ...perfil, permissoes };
  }

  async vincularPermissoes(id: string, permissoes: string[]) {
    const perfil = await this.repository.findById(id);

    if (!perfil) {
      throw httpExceptions().notFound();
    }

    await this.repository.vincularPermissoes(id, permissoes);
    return { message: "Permissões vinculadas com sucesso." };
  }
}
