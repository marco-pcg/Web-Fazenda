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

  async create(dados: CreateTalhaoDto) {
    const fazenda = await this.fazendasRepository.findOne(dados.fazendaId);
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada.');
    }

    const existe = await this.talhoesRepository.findByCodigo(
      dados.fazendaId,
      dados.codigo,
    );
    if (existe) {
      throw new ConflictException(
        'Já existe um talhão com esse código nessa fazenda.',
      );
    }

    return this.talhoesRepository.create(dados);
  }

  findAll(filtro: FiltroTalhaoDto) {
    return this.talhoesRepository.findAll(filtro);
  }

  async findOne(id: string) {
    const talhao = await this.talhoesRepository.findOne(id);
    if (!talhao) {
      throw new NotFoundException('Talhão não encontrado.');
    }
    return talhao;
  }

  async update(id: string, dados: UpdateTalhaoDto) {
    const talhao = await this.findOne(id);

    const mudouArea = dados.area !== undefined && dados.area !== talhao.area;
    if (mudouArea && talhao.status === 'plantado') {
      throw new ConflictException(
        'Não é possível alterar a área de um talhão plantado.',
      );
    }

    if (dados.codigo) {
      const existe = await this.talhoesRepository.findByCodigo(
        talhao.fazendaId,
        dados.codigo,
      );
      if (existe && existe.id !== id) {
        throw new ConflictException(
          'Já existe um talhão com esse código nessa fazenda.',
        );
      }
    }

    return this.talhoesRepository.update(id, dados);
  }

  async remove(id: string) {
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
