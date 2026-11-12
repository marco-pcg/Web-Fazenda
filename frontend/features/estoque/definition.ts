import type { ResourceDefinition } from "@/lib/contracts";

export const resource = {
  key: "estoque",
  title: "Estoque",
  endpoints: [
    {
      id: "listar",
      method: "GET",
      path: "/estoque",
      route: "/estoque",
      title: "Lista estoque disponível por produto e fazenda",
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
          name: "produto_id",
          label: "ID do produto",
          kind: "text",
          required: false,
          format: "uuid",
        },
        {
          name: "fazenda_id",
          label: "ID da fazenda",
          kind: "text",
          required: false,
          format: "uuid",
        },
        {
          name: "turma_id",
          label: "ID da turma",
          kind: "text",
          required: false,
          format: "uuid",
        },
      ],
      params: [],
      queryDto: "FiltroEstoqueDto",
      source: "backend/src/mercado/estoque/estoque.controller.ts",
    },
  ],
} satisfies ResourceDefinition;
