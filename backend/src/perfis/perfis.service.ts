import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { FilterPerfilDto } from './dto/filter-perfil.dto';
import { PerfisRepository } from './perfis.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class PerfisService {
  constructor(private readonly repository: PerfisRepository) {}

  async create(createPerfilDto: CreatePerfilDto) {
    const perfilExists = await this.repository.findByNome(createPerfilDto.nome);

    if (perfilExists) {
      throw new ConflictException('Perfil já cadastrado');
    }

    const newPerfil = { id: randomUUID(), ...createPerfilDto };
    const [created] = await this.repository.create(newPerfil);
    return created;
  }

  async findAll(filtros: FilterPerfilDto) {
    return this.repository.findAll(filtros);
  }

  async findById(id: string) {
    const perfil = await this.repository.findById(id);

    if (!perfil) {
      throw new NotFoundException('Perfil não encontrado');
    }

    const permissoes = await this.repository.findPermissoesByPerfilId(id);
    return {
      ...perfil,
      permissoes,
    };
  }

  async vincularPermissoes(perfil_id: string, permissoesIds: string[]) {
    const perfil = await this.repository.findById(perfil_id);

    if (!perfil) {
      throw new NotFoundException('Perfil não encontrado');
    }

    await this.repository.vincularPermissoes(perfil_id, permissoesIds);
    return { message: 'Permissões atualizadas com sucesso' };
  }

  async update(id: string, updatePerfilDto: UpdatePerfilDto) {
    const perfilExists = await this.repository.findById(id);

    if (!perfilExists) {
      throw new NotFoundException('Perfil não encontrado');
    }

    const [updated] = await this.repository.update(id, updatePerfilDto);
    return updated;
  }

  async remove(id: string) {
    const perfilExists = await this.repository.findById(id);

    if (!perfilExists) {
      throw new NotFoundException('Perfil não encontrado');
    }

    await this.repository.remove(id);
  }
}
