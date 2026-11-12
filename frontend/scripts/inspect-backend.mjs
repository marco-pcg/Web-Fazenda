import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const require = createRequire(path.join(root, "frontend/package.json"));
const ts = require("typescript");
const cache = new Map();
function source(file) {
  file = path.resolve(file);
  if (!cache.has(file))
    cache.set(
      file,
      ts.createSourceFile(
        file,
        fs.readFileSync(file, "utf8"),
        ts.ScriptTarget.Latest,
        true,
      ),
    );
  return cache.get(file);
}
function decorators(node) {
  return ts.canHaveDecorators(node) ? ts.getDecorators(node) || [] : [];
}
function decorator(node, name) {
  return decorators(node)
    .map((d) => d.expression)
    .find((e) => ts.isCallExpression(e) && e.expression.getText() === name);
}
function literal(node) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node))
    return ts.isNumericLiteral(node) ? Number(node.text) : node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isAsExpression(node)) return literal(node.expression);
  return undefined;
}
function imported(file, name) {
  for (const stmt of source(file).statements) {
    if (
      ts.isImportDeclaration(stmt) &&
      stmt.importClause?.namedBindings &&
      ts.isNamedImports(stmt.importClause.namedBindings) &&
      stmt.importClause.namedBindings.elements.some((e) => e.name.text === name)
    ) {
      const target =
        path.resolve(path.dirname(file), stmt.moduleSpecifier.text) + ".ts";
      if (fs.existsSync(target)) return target;
    }
  }
  return file;
}
function declaration(file, name) {
  return source(file).statements.find(
    (n) =>
      (ts.isClassDeclaration(n) || ts.isEnumDeclaration(n)) &&
      n.name?.text === name,
  );
}
function enumValues(file, name) {
  file = imported(file, name);
  const dec = declaration(file, name);
  return dec && ts.isEnumDeclaration(dec)
    ? dec.members
        .map((m) => literal(m.initializer))
        .filter((v) => v !== undefined)
    : [];
}
function derive(file, expr) {
  if (ts.isIdentifier(expr))
    return fields(imported(file, expr.text), expr.text);
  if (ts.isCallExpression(expr)) {
    let result = derive(file, expr.arguments[0]);
    if (expr.expression.getText() === "PartialType")
      result = result.map((f) => ({ ...f, required: false }));
    if (expr.expression.getText() === "OmitType") {
      const omit = literal(expr.arguments[1]) || [];
      result = result.filter((f) => !omit.includes(f.name));
    }
    return result;
  }
  return [];
}
function fields(file, name) {
  const dec = declaration(file, name);
  if (!dec || !ts.isClassDeclaration(dec))
    throw Error(`DTO missing: ${file} ${name}`);
  let result = [];
  for (const h of dec.heritageClauses || [])
    for (const t of h.types) {
      result.push(...derive(file, t.expression));
    }
  for (const p of dec.members) {
    if (!ts.isPropertyDeclaration(p) || !p.type) continue;
    const n = p.name.getText();
    const type = p.type.getText();
    let options = enumValues(file, type);
    if (ts.isUnionTypeNode(p.type))
      options = p.type.types
        .map((t) => (ts.isLiteralTypeNode(t) ? literal(t.literal) : undefined))
        .filter((v) => v !== undefined);
    const isin = decorator(p, "IsIn");
    if (isin) options = literal(isin.arguments[0]) || [];
    const num = type === "number";
    let kind =
      type === "boolean"
        ? "boolean"
        : num
          ? "number"
          : type.endsWith("[]")
            ? "array"
            : n === "email"
              ? "email"
              : n === "senha"
                ? "password"
                : decorator(p, "IsDateString")
                  ? "date"
                  : "text";
    if (options.length && kind !== "array") kind = "select";
    const swagger =
      decorator(p, "ApiProperty") || decorator(p, "ApiPropertyOptional");
    let description;
    const arg = swagger?.arguments[0];
    if (arg && ts.isObjectLiteralExpression(arg)) {
      const d = arg.properties.find(
        (x) => ts.isPropertyAssignment(x) && x.name.getText() === "description",
      );
      description = literal(d?.initializer);
      const op = arg.properties.find(
        (x) => ts.isPropertyAssignment(x) && x.name.getText() === "enum",
      );
      if (!options.length && op) {
        options = literal(op.initializer) || [];
        if (options.length && kind !== "array") kind = "select";
      }
    }
    const min = literal(decorator(p, "Min")?.arguments[0]);
    const max = literal(decorator(p, "Max")?.arguments[0]);
    const minLength =
      literal(decorator(p, "MinLength")?.arguments[0]) ??
      literal(decorator(p, "Length")?.arguments[0]);
    const maxLength =
      literal(decorator(p, "MaxLength")?.arguments[0]) ??
      literal(decorator(p, "Length")?.arguments[1]);
    result.push({
      name: n,
      label:
        labels[n] ||
        n.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase()),
      kind,
      required:
        !p.questionToken &&
        !decorator(p, "IsOptional") &&
        !decorator(p, "ApiPropertyOptional"),
      ...(description ? { description } : {}),
      ...(options.length ? { options } : {}),
      ...(min !== undefined ? { min } : {}),
      ...(max !== undefined ? { max } : {}),
      ...(num ? { step: decorator(p, "IsInt") ? 1 : "any" } : {}),
      ...(minLength !== undefined ? { minLength } : {}),
      ...(maxLength !== undefined ? { maxLength } : {}),
      ...(decorator(p, "IsUUID") ? { format: "uuid" } : {}),
    });
  }
  return result;
}
const labels = {
  nome: "Nome",
  email: "E-mail",
  senha: "Senha",
  ativo: "Ativo",
  descricao: "Descrição",
  agua_total: "Água total",
  estacao_atual: "Estação atual",
  ano: "Ano",
  codigo: "Código",
  quantidade: "Quantidade",
  status: "Status",
  page: "Página",
  limit: "Registros por página",
  search: "Busca",
  turma_id: "ID da turma",
  usuario_id: "ID do usuário",
  perfil_id: "ID do perfil",
  professor_id: "ID do professor",
  aluno_id: "ID do aluno",
  fazenda_id: "ID da fazenda",
  talhao_id: "ID do talhão",
  cultura_id: "ID da cultura",
  especie_id: "ID da espécie",
  produto_id: "ID do produto",
  temporada_id: "ID da temporada",
  estacao_id: "ID da estação",
  rebanho_id: "ID do rebanho",
  data_inicio: "Data inicial",
  data_fim: "Data final",
  data_plantio: "Data do plantio",
  data_colheita: "Data da colheita",
  permissoes_ids: "IDs das permissões",
  estacoes: "Estações",
  max_alunos: "Máximo de alunos",
  area: "Área",
  unidade: "Unidade",
  preco_base: "Preço base",
  sensibilidade: "Sensibilidade",
  chave_estoque: "Chave do estoque",
  origem: "Origem",
  origem_id: "ID da origem",
  temporada: "Temporada",
  tipo: "Tipo",
  alvo: "Alvo",
  multiplicador: "Multiplicador",
  ordem: "Ordem",
};
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );
}
const resources = [];
for (const file of walk(path.join(root, "backend/src"))
  .filter((f) => f.endsWith(".controller.ts"))
  .sort()) {
  for (const dec of source(file).statements.filter(ts.isClassDeclaration)) {
    const controller = decorator(dec, "Controller");
    if (!controller) continue;
    const prefix = literal(controller.arguments[0]) || "";
    const key = prefix || "saude";
    const tag = literal(decorator(dec, "ApiTags")?.arguments[0]) || "Saúde";
    const endpoints = [];
    for (const m of dec.members) {
      if (!ts.isMethodDeclaration(m)) continue;
      const http = ["Get", "Post", "Patch", "Put", "Delete"]
        .map((method) => ({ method, call: decorator(m, method) }))
        .find((v) => v.call);
      if (!http) continue;
      const suffix = literal(http.call.arguments[0]) || "";
      const apiPath = "/" + [prefix, suffix].filter(Boolean).join("/");
      const method = http.method.toUpperCase();
      let ui =
        "/" +
        [key, suffix.replaceAll(/:([A-Za-z]+)/g, "[$1]")]
          .filter(Boolean)
          .join("/");
      if (method === "POST" && suffix === "") ui += "/novo";
      if (
        (method === "PATCH" || method === "PUT") &&
        suffix.split("/").at(-1)?.startsWith(":")
      )
        ui += "/editar";
      if (method === "DELETE") ui += "/excluir";
      const summaryArg = decorator(m, "ApiOperation")?.arguments[0];
      const title =
        summaryArg && ts.isObjectLiteralExpression(summaryArg)
          ? literal(
              summaryArg.properties.find(
                (p) =>
                  ts.isPropertyAssignment(p) && p.name.getText() === "summary",
              )?.initializer,
            )
          : undefined;
      const permission = literal(
        decorator(m, "RequirePermissions")?.arguments[0],
      );
      let body = [],
        query = [],
        bodyDto,
        queryDto;
      const params = [];
      for (const p of m.parameters) {
        for (const kind of ["Body", "Query"]) {
          if (decorator(p, kind) && p.type && ts.isTypeReferenceNode(p.type)) {
            const dto = p.type.typeName.getText();
            const dtfile = imported(file, dto);
            const found = fields(dtfile, dto);
            if (kind === "Body") {
              body = found;
              bodyDto = dto;
            } else {
              query = found;
              queryDto = dto;
            }
          }
        }
        const param = decorator(p, "Param");
        if (param) {
          const name = literal(param.arguments[0]);
          params.push({
            name,
            label:
              name === "id"
                ? "ID do registro"
                : name === "ordemId"
                  ? "ID da contribuição"
                  : name === "email"
                    ? "E-mail"
                    : name,
            kind: name === "email" ? "email" : "text",
            required: true,
            ...(param.arguments.some((a) => a.getText() === "ParseUUIDPipe")
              ? { format: "uuid" }
              : {}),
          });
        }
      }
      endpoints.push({
        id: m.name.getText(),
        method,
        path: apiPath,
        route: ui,
        title: title || `${method} ${apiPath}`,
        permission: permission || null,
        authenticated:
          !!decorator(dec, "UseGuards") || !!decorator(m, "UseGuards"),
        body,
        query,
        params,
        ...(bodyDto ? { bodyDto } : {}),
        ...(queryDto ? { queryDto } : {}),
        source: path.relative(root, file),
      });
    }
    for (const e of endpoints) {
      if (
        e.method === "POST" &&
        endpoints.some((g) => g.method === "GET" && g.path === e.path) &&
        !e.route.endsWith("/novo")
      )
        e.route += "/novo";
    }
    if (endpoints.length) resources.push({ key, title: tag, endpoints });
  }
}
fs.writeFileSync(
  path.join(root, "frontend/docs/backend-endpoints.json"),
  JSON.stringify(resources, null, 2) + "\n",
);
console.log(
  `Inspected ${resources.length} resources and ${resources.reduce((sum, resource) => sum + resource.endpoints.length, 0)} endpoints.`,
);
