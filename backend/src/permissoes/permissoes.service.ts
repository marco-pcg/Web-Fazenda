import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreatePermissaoDto } from './dto/create-permissao.dto';
import { UpdatePermissaoDto } from './dto/update-permissao.dto';
import { FilterPermissaoDto } from './dto/filter-permissao.dto';
import { PermissoesRepository } from './permissoes.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class PermissoesService {
  constructor(private readonly repository: PermissoesRepository) {}

  async create(createPermissaoDto: CreatePermissaoDto) {
    const permissaoExists = await this.repository.findByName(createPermissaoDto.nome);
    if (permissaoExists) {
      throw new ConflictException('Permissão já cadastrada');
    }
    const newPermissao = { id: randomUUID(), ...createPermissaoDto };
    const [created] = await this.repository.create(newPermissao);
    return created;
  }

  async findAll(filtros: FilterPermissaoDto) {
    return this.repository.findAll(filtros);
  }

  async findById(id: string) {
    const permissao = await this.repository.findById(id);
    if (!permissao) {
      throw new NotFoundException('Permissão não encontrada');
    }
    return permissao;
  }

  async update(id: string, updatePermissaoDto: UpdatePermissaoDto) {
    const permissaoExists = await this.repository.findById(id);
    if (!permissaoExists) {
      throw new NotFoundException('Permissão não encontrada');
    }
    const [updated] = await this.repository.update(id, updatePermissaoDto);
    return updated;
  }

  async remove(id: string) {
    const permissaoExists = await this.repository.findById(id);
    if (!permissaoExists) {
      throw new NotFoundException('Permissão não encontrada');
    }
    await this.repository.remove(id);
  }
}
