import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TalhoesRepository } from './talhoes.repository';
import { FazendasRepository } from '../fazendas/fazendas.repository';
import { CreateTalhaoDto } from './dto/create-talhao.dto';
import { UpdateTalhaoDto } from './dto/update-talhao.dto';
import { FiltroTalhaoDto } from './dto/filtro-talhao.dto';

@Injectable()
export class TalhoesService {
  constructor(
    private readonly talhoesRepository: TalhoesRepository,
    private readonly fazendasRepository: FazendasRepository,
  ) {}

  async create(createTalhaoDto: CreateTalhaoDto) {
    const fazenda = await this.fazendasRepository.findOne(
      createTalhaoDto.fazenda_id,
    );
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada.');
    }

    const existe = await this.talhoesRepository.findByCodigo(
      createTalhaoDto.fazenda_id,
      createTalhaoDto.codigo,
    );
    if (existe) {
      throw new ConflictException(
        'Já existe um talhão com esse código nessa fazenda.',
      );
    }

    return this.talhoesRepository.create(createTalhaoDto);
  }

  findAll(filtro: FiltroTalhaoDto) {
    const page = filtro.page ?? 1;
    const limit = filtro.limit ?? 10;
    const offset = (page - 1) * limit;
    return this.talhoesRepository.findAll(filtro, limit, offset);
  }

  async findOne(id: number) {
    const talhao = await this.talhoesRepository.findOne(id);
    if (!talhao) {
      throw new NotFoundException('Talhão não encontrado.');
    }
    return talhao;
  }

  async update(id: number, updateTalhaoDto: UpdateTalhaoDto) {
    const talhao = await this.findOne(id);

    if (
      updateTalhaoDto.area &&
      updateTalhaoDto.area !== talhao.area &&
      talhao.status === 'plantado'
    ) {
      throw new ConflictException(
        'Não é possível alterar a área de um talhão plantado.',
      );
    }

    if (updateTalhaoDto.codigo) {
      const existe = await this.talhoesRepository.findByCodigo(
        talhao.fazenda_id,
        updateTalhaoDto.codigo,
      );
      if (existe && existe.id !== id) {
        throw new ConflictException(
          'Já existe um talhão com esse código nessa fazenda.',
        );
      }
    }

    return this.talhoesRepository.update(id, updateTalhaoDto);
  }

  async remove(id: number) {
    await this.findOne(id);

    const temPlantio = await this.talhoesRepository.temPlantio(id);
    if (temPlantio) {
      throw new ConflictException(
        'Esse talhão tem histórico de plantios e não pode ser excluído.',
      );
    }

    await this.talhoesRepository.remove(id);
    return { mensagem: 'Talhão removido com sucesso.' };
  }
}
