# API Web Fazenda

API NestJS com PostgreSQL, autenticação JWT e módulos de fazenda, temporadas, animais e mercado. O Swagger fica em `http://localhost:3000/api/docs`.

## Subir com Docker

Na pasta `backend`, copie `.env.example` para `.env`. Preencha `JWT_SECRET`, `ADMIN_PERFIL_ID`, `PROF_PERFIL_ID`, `ALUNO_PERFIL_ID`, `ADMIN_E_ADR` e `ADMIN_PWD`. Os IDs de perfil devem ser UUIDs distintos. Em seguida:

```bash
docker compose up --build -d
docker compose exec api npm run seed
```

O Compose sobe API, PostgreSQL, Redis e Adminer. A API executa as migrations ao iniciar. O seed cadastra os perfis, usuários e dados de exemplo, incluindo produtos e um comprador (`comprador@webfarm.com`, senha `123456`). Execute o seed em um banco de desenvolvimento: os seeds existentes recriam parte dos dados.

Para acompanhar ou parar os serviços:

```bash
docker compose logs -f api
docker compose down
```

## Rodar a API fora do Docker

Suba apenas PostgreSQL e Redis com `docker compose up -d database redis`. Mantenha `DB_HOST=localhost` e `REDIS_HOST=localhost` no `.env`.

```bash
npm ci
npm run migrate
npm run seed
npm run start:dev
```

## Mercado

O aluno oferece produtos da própria fazenda em `POST /ordens/venda` ou inicia uma venda conjunta em `POST /cooperativa/vendas-conjuntas`. Cada oferta reserva a quantidade informada no estoque. A venda conjunta aceita contribuições de outras fazendas da mesma turma e temporada e pode ser comprada quando duas fazendas distintas participam. O comprador usa `POST /ordens/compra` com `origem` igual a `ORDEM` ou `VENDA_CONJUNTA` e `origem_id` igual ao ID escolhido. A compra sempre abrange a oferta inteira.

Depois da compra conjunta, o criador ou admin chama `POST /cooperativa/vendas-conjuntas/:id/distribuir`. A cooperativa retém 5% e distribui o restante proporcionalmente às contribuições. Os repasses e a taxa aparecem no extrato.

O preço usa a temporada numérica de `fazendas.temporada_atual` e a fórmula `máx(0,01; preço_base / (1 + sensibilidade × quantidade_vendida))`. Redis armazena consultas de cotação; PostgreSQL guarda os valores definitivos. As rotas, filtros, DTOs e autorizações estão documentados no Swagger.

## Testes

```bash
npm run build
npm test -- --runInBand
npm run test:integration
```

Os testes de integração com PostgreSQL usam `DB_*` do `.env` e exigem migrations aplicadas.
