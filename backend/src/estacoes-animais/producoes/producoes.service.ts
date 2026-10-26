import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ProducoesRepository } from './producoes.repository';
import { Producao } from './producao.types';
import { QueryProducaoDto } from './dto/query-producao.dto';
import { FAZENDAS_PORT } from '../ports/fazendas.port';
import type { FazendasPort } from '../ports/fazendas.port';
import { UsuarioLogado } from '../common/usuario-logado';

@Injectable()
export class ProducoesService {
  constructor(
    private readonly producoesRepository: ProducoesRepository,
    @Inject(FAZENDAS_PORT) private readonly fazendasPort: FazendasPort,
  ) {}

  async listar(filtros: QueryProducaoDto, usuario: UsuarioLogado) {
    if (
      filtros.data_inicio &&
      filtros.data_fim &&
      new Date(filtros.data_inicio) > new Date(filtros.data_fim)
    ) {
      throw new BadRequestException(
        'A data inicial não pode ser maior que a data final.',
      );
    }

    let fazenda_ids: string[] | undefined = filtros.fazenda_id
      ? [filtros.fazenda_id]
      : undefined;

    if (usuario.perfil === 'aluno') {
      const fazendas = await this.fazendasPort.listarPorUsuario(usuario.id);
      fazenda_ids = fazendas.map((fazenda) => fazenda.id);

      if (filtros.fazenda_id) {
        fazenda_ids = fazenda_ids.includes(filtros.fazenda_id)
          ? [filtros.fazenda_id]
          : [];
      }

      if (fazenda_ids.length === 0) {
        return {
          data: [],
          meta: {
            page: filtros.pagina || 1,
            limit: filtros.limite || 10,
            total: 0,
            totalPages: 0,
          },
        };
      }
    }

    const resultado = await this.producoesRepository.listar(
      {
        produto: filtros.produto,
        data_inicio: filtros.data_inicio,
        data_fim: filtros.data_fim,
        rebanho_id: filtros.rebanho_id,
        temporada_id: filtros.temporada_id,
        fazenda_ids,
        search: filtros.search,
      },
      filtros.pagina,
      filtros.limite,
    );

    return {
      data: resultado.data.map((producao) => this.converterNumeros(producao)),
      meta: resultado.meta,
    };
  }

  private converterNumeros(producao: Producao): Producao {
    return {
      ...producao,
      quantidade: Number(producao.quantidade),
      fator_aplicado: Number(producao.fator_aplicado),
    };
  }
}
