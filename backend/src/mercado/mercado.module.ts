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

@Module({
  controllers: [
    EstoqueControlador,
    ProdutosControlador,
    CotacoesControlador,
  ],
  providers: [
    ContextoMercadoRepositorio,
    EstoqueRepositorio,
    EstoqueServico,
    ProdutosRepositorio,
    ProdutosServico,
    CotacoesRepositorio,
    CotacoesServico,
  ],
  exports: [EstoqueServico],
})
export class MercadoModulo {}
