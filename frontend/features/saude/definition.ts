import type { ResourceDefinition } from "@/lib/contracts";

export const resource = {
  key: "saude",
  title: "health",
  endpoints: [
    {
      id: "getHello",
      method: "GET",
      path: "/",
      route: "/saude",
      title: "Verifica se a API está disponível",
      permission: null,
      authenticated: false,
      body: [],
      query: [],
      params: [],
      source: "backend/src/app.controller.ts",
    },
  ],
} satisfies ResourceDefinition;
