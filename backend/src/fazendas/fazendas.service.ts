import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FazendasRepository } from './fazendas.repository';
import { CreateFazendaDto } from './dto/create-fazenda.dto';
import { UpdateFazendaDto } from './dto/update-fazenda.dto';
import { FiltroFazendaDto } from './dto/filtro-fazenda.dto';

@Injectable()
export class FazendasService {
  constructor(private readonly fazendasRepository: FazendasRepository) {}

  async create(createFazendaDto: CreateFazendaDto) {
    await this.verificarTurmaEUsuario(createFazendaDto);

    return this.fazendasRepository.create({
      ...createFazendaDto,
      agua_disponivel: createFazendaDto.agua_total,
    });
  }

  findAll(filtro: FiltroFazendaDto) {
    const page = filtro.page ?? 1;
    const limit = filtro.limit ?? 10;
    const offset = (page - 1) * limit;
    return this.fazendasRepository.findAll(filtro, limit, offset);
  }

  async findOne(id: number) {
    const fazenda = await this.fazendasRepository.findOne(id);
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada.');
    }

    const talhoes = await this.fazendasRepository.findTalhoes(id);

    let areaTotal = 0;
    let areaLivre = 0;
    for (const talhao of talhoes) {
      areaTotal += talhao.area;
      if (talhao.status === 'livre') {
        areaLivre += talhao.area;
      }
    }

    return {
      ...fazenda,
      recursos: {
        area_total: areaTotal,
        area_livre: areaLivre,
        agua_total: fazenda.agua_total,
        agua_disponivel: fazenda.agua_disponivel,
      },
      talhoes,
    };
  }

  async update(id: number, updateFazendaDto: UpdateFazendaDto) {
    const fazenda = await this.findOne(id);
    await this.verificarTurmaEUsuario(updateFazendaDto);

    let aguaDisponivel = fazenda.agua_disponivel;

    if (updateFazendaDto.agua_total !== undefined) {
      const aguaGasta = fazenda.agua_total - fazenda.agua_disponivel;

      if (updateFazendaDto.agua_total < aguaGasta) {
        throw new UnprocessableEntityException(
          'A água total não pode ser menor do que a água já usada.',
        );
      }

      aguaDisponivel = updateFazendaDto.agua_total - aguaGasta;
    }

    return this.fazendasRepository.update(id, {
      ...updateFazendaDto,
      agua_disponivel: aguaDisponivel,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    const temPlantio = await this.fazendasRepository.temPlantio(id);
    if (temPlantio) {
      throw new ConflictException(
        'A fazenda tem histórico de plantios e não pode ser excluída.',
      );
    }

    await this.fazendasRepository.remove(id);
    return { mensagem: 'Fazenda removida com sucesso.' };
  }

  async verificarTurmaEUsuario(dados: UpdateFazendaDto) {
    if (dados.turma_id) {
      const turma = await this.fazendasRepository.findTurma(dados.turma_id);
      if (!turma) {
        throw new NotFoundException('Turma não encontrada.');
      }
    }

    if (dados.usuario_id) {
      const usuario = await this.fazendasRepository.findUsuario(
        dados.usuario_id,
      );
      if (!usuario) {
        throw new NotFoundException('Usuário não encontrado.');
      }
    }
  }
}
