import type { ResourceDefinition } from "@/lib/contracts";
import { resource as saude } from "./saude/definition";
import { resource as auth } from "./auth/definition";
import { resource as colheitas } from "./colheitas/definition";
import { resource as culturas } from "./culturas/definition";
import { resource as especies } from "./especies/definition";
import { resource as estacoes } from "./estacoes/definition";
import { resource as eventos } from "./eventos/definition";
import { resource as producoes } from "./producoes/definition";
import { resource as rebanhos } from "./rebanhos/definition";
import { resource as temporadas } from "./temporadas/definition";
import { resource as fazendas } from "./fazendas/definition";
import { resource as cooperativa } from "./cooperativa/definition";
import { resource as cotacoes } from "./cotacoes/definition";
import { resource as estoque } from "./estoque/definition";
import { resource as ordens } from "./ordens/definition";
import { resource as produtos } from "./produtos/definition";
import { resource as transacoes } from "./transacoes/definition";
import { resource as perfis } from "./perfis/definition";
import { resource as permissoes } from "./permissoes/definition";
import { resource as plantios } from "./plantios/definition";
import { resource as talhoes } from "./talhoes/definition";
import { resource as turmas } from "./turmas/definition";
import { resource as usuarios } from "./usuarios/definition";

export const resources: ResourceDefinition[] = [
  saude,
  auth,
  colheitas,
  culturas,
  especies,
  estacoes,
  eventos,
  producoes,
  rebanhos,
  temporadas,
  fazendas,
  cooperativa,
  cotacoes,
  estoque,
  ordens,
  produtos,
  transacoes,
  perfis,
  permissoes,
  plantios,
  talhoes,
  turmas,
  usuarios,
];
