import { Module } from '@nestjs/common';
import { ContextoMercadoRepositorio } from './shared/contexto-mercado.repository';
import { EstoqueControlador } from './estoque/estoque.controller';
import { EstoqueRepositorio } from './estoque/estoque.repository';
import { EstoqueServico } from './estoque/estoque.service';
import { ProdutosControlador } from './produtos/produtos.controller';
import { ProdutosRepositorio } from './produtos/produtos.repository';
import { ProdutosServico } from './produtos/produtos.service';
import { CotacoesControlador } from './cotacoes/cotacoes.controller';
import { CotacoesRepositorio } from './cotacoes/cotacoes.repository';
import { CotacoesServico } from './cotacoes/cotacoes.service';
import { OrdensControlador } from './ordens/ordens.controller';
import { OrdensRepositorio } from './ordens/ordens.repository';
import { OrdensServico } from './ordens/ordens.service';
import { TransacoesControlador } from './transacoes/transacoes.controller';
import { TransacoesRepositorio } from './transacoes/transacoes.repository';
import { CooperativaControlador } from './cooperativa/cooperativa.controller';
import { CooperativaRepositorio } from './cooperativa/cooperativa.repository';
import { CooperativaServico } from './cooperativa/cooperativa.service';

@Module({
  controllers: [
    EstoqueControlador,
    ProdutosControlador,
    CotacoesControlador,
    OrdensControlador,
    TransacoesControlador,
    CooperativaControlador,
  ],
  providers: [
    ContextoMercadoRepositorio,
    EstoqueRepositorio,
    EstoqueServico,
    ProdutosRepositorio,
    ProdutosServico,
    CotacoesRepositorio,
    CotacoesServico,
    OrdensRepositorio,
    OrdensServico,
    TransacoesRepositorio,
    CooperativaRepositorio,
    CooperativaServico,
  ],
  exports: [EstoqueServico],
})
export class MercadoModulo {}
