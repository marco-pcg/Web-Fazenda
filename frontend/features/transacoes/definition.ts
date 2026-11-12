import type { ResourceDefinition } from "@/lib/contracts";

export const resource = {
  key: "transacoes",
  title: "Transações",
  endpoints: [
    {
      id: "listar",
      method: "GET",
      path: "/transacoes",
      route: "/transacoes",
      title: "Lista transações por data e tipo",
      permission: "mercado:consultar",
      authenticated: true,
      body: [],
      query: [
        {
          name: "page",
          label: "Página",
          kind: "number",
          required: false,
          description: "Número da página",
          min: 1,
          step: 1,
        },
        {
          name: "limit",
          label: "Registros por página",
          kind: "number",
          required: false,
          description: "Quantidade de registros por página",
          min: 1,
          step: 1,
        },
        {
          name: "search",
          label: "Busca",
          kind: "text",
          required: false,
          description: "Termo de busca genérico",
        },
        {
          name: "data_inicio",
          label: "Data inicial",
          kind: "date",
          required: false,
        },
        {
          name: "data_fim",
          label: "Data final",
          kind: "date",
          required: false,
        },
        {
          name: "tipo",
          label: "Tipo",
          kind: "select",
          required: false,
          options: ["COMPRA_AVULSA", "COMPRA_CONJUNTA", "REPASSE", "TAXA"],
        },
        {
          name: "venda_conjunta_id",
          label: "Venda conjunta id",
          kind: "text",
          required: false,
          format: "uuid",
        },
      ],
      params: [],
      queryDto: "FiltroTransacoesDto",
      source: "backend/src/mercado/transacoes/transacoes.controller.ts",
    },
  ],
} satisfies ResourceDefinition;
