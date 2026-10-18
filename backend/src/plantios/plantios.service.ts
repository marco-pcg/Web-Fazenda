import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { database } from '../db/knex-connection';
import { diasEntre, hoje, somarDias } from '../common/datas';
import { PlantiosRepository } from './plantios.repository';
import { TalhoesRepository } from '../talhoes/talhoes.repository';
import { FazendasRepository } from '../fazendas/fazendas.repository';
import { CulturasRepository } from '../culturas/culturas.repository';
import { ColheitasRepository } from '../colheitas/colheitas.repository';
import { CreatePlantioDto } from './dto/create-plantio.dto';
import { ColherPlantioDto } from './dto/colher-plantio.dto';
import { FiltroPlantioDto } from './dto/filtro-plantio.dto';

@Injectable()
export class PlantiosService {
  constructor(
    private readonly plantiosRepository: PlantiosRepository,
    private readonly talhoesRepository: TalhoesRepository,
    private readonly fazendasRepository: FazendasRepository,
    private readonly culturasRepository: CulturasRepository,
    private readonly colheitasRepository: ColheitasRepository,
  ) {}

  async create(createPlantioDto: CreatePlantioDto) {
    const talhao = await this.talhoesRepository.findOne(
      createPlantioDto.talhao_id,
    );
    if (!talhao) {
      throw new NotFoundException('Talhão não encontrado.');
    }
    if (talhao.status === 'plantado') {
      throw new ConflictException('Esse talhão já está plantado.');
    }

    const cultura = await this.culturasRepository.findOne(
      createPlantioDto.cultura_id,
    );
    if (!cultura) {
      throw new NotFoundException('Cultura não encontrada.');
    }

    const fazenda = await this.fazendasRepository.findOne(talhao.fazenda_id);
    if (!fazenda) {
      throw new NotFoundException('Fazenda não encontrada.');
    }

    if (!cultura.estacoes.includes(fazenda.estacao_atual)) {
      throw new UnprocessableEntityException(
        'Essa cultura não pode ser plantada nessa estação.',
      );
    }

    const areaUsada = createPlantioDto.quantidade * cultura.area_por_unidade;
    const aguaUsada = createPlantioDto.quantidade * cultura.agua_por_unidade;

    if (areaUsada > talhao.area) {
      throw new UnprocessableEntityException('Área insuficiente no talhão.');
    }
    if (aguaUsada > fazenda.agua_disponivel) {
      throw new UnprocessableEntityException('Água insuficiente na fazenda.');
    }

    const plantioAnterior = await this.plantiosRepository.findPlantioAnterior(
      talhao.id,
      cultura.id,
      fazenda.temporada_atual - 1,
    );
    const penalidadeRotacao = plantioAnterior ? true : false;

    const dataPlantio = createPlantioDto.data_plantio || hoje();

    return database.transaction(async (trx) => {
      const plantio = await this.plantiosRepository.create(
        {
          talhao_id: talhao.id,
          cultura_id: cultura.id,
          quantidade: createPlantioDto.quantidade,
          area_usada: areaUsada,
          agua_usada: aguaUsada,
          temporada: fazenda.temporada_atual,
          estacao: fazenda.estacao_atual,
          data_plantio: dataPlantio,
          data_prevista_colheita: somarDias(
            dataPlantio,
            cultura.dias_crescimento,
          ),
          penalidade_rotacao: penalidadeRotacao,
        },
        trx,
      );

      await this.talhoesRepository.update(
        talhao.id,
        { status: 'plantado' },
        trx,
      );

      await this.fazendasRepository.update(
        fazenda.id,
        { agua_disponivel: fazenda.agua_disponivel - aguaUsada },
        trx,
      );

      if (penalidadeRotacao) {
        return {
          ...plantio,
          aviso:
            'Mesma cultura da temporada passada, o rendimento vai cair 20%.',
        };
      }

      return plantio;
    });
  }

  findAll(filtro: FiltroPlantioDto) {
    const page = filtro.page ?? 1;
    const limit = filtro.limit ?? 10;
    const offset = (page - 1) * limit;
    return this.plantiosRepository.findAll(filtro, limit, offset);
  }

  async findOne(id: string) {
    const plantio = await this.plantiosRepository.findOne(id);
    if (!plantio) {
      throw new NotFoundException('Plantio não encontrado.');
    }
    return plantio;
  }

  async colher(id: string, colherPlantioDto: ColherPlantioDto) {
    const plantio = await this.findOne(id);

    if (plantio.status === 'colhido') {
      throw new ConflictException('Esse plantio já foi colhido.');
    }

    const dataColheita = colherPlantioDto.data_colheita || hoje();
    if (dataColheita < plantio.data_plantio) {
      throw new UnprocessableEntityException(
        'A data da colheita não pode ser antes do plantio.',
      );
    }

    const cultura = await this.culturasRepository.findOne(plantio.cultura_id);
    if (!cultura) {
      throw new NotFoundException('Cultura não encontrada.');
    }

    const diasPassados = diasEntre(plantio.data_plantio, dataColheita);
    const antecipada = diasPassados < cultura.dias_crescimento;

    let perda = 0;
    if (antecipada && diasPassados < cultura.dias_crescimento / 2) {
      perda = 1;
    } else if (antecipada) {
      perda = 1 - diasPassados / cultura.dias_crescimento;
    }

    let aproveitamento = 1 - perda;
    if (plantio.penalidade_rotacao) {
      aproveitamento = aproveitamento * 0.8;
    }

    const quantidadeColhida =
      plantio.quantidade * cultura.rendimento_por_unidade * aproveitamento;
    const valorEstimado =
      plantio.quantidade * cultura.valor_por_unidade * aproveitamento;

    return database.transaction(async (trx) => {
      const colheita = await this.colheitasRepository.create(
        {
          plantio_id: plantio.id,
          data_colheita: dataColheita,
          antecipada,
          perda_percentual: Number((perda * 100).toFixed(2)),
          quantidade_colhida: Number(quantidadeColhida.toFixed(2)),
          valor_estimado: Number(valorEstimado.toFixed(2)),
        },
        trx,
      );

      await this.plantiosRepository.update(id, { status: 'colhido' }, trx);

      await this.talhoesRepository.update(
        plantio.talhao_id,
        { status: 'livre' },
        trx,
      );

      return colheita;
    });
  }
}
