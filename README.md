# Scrappy

Agenda de eventos para municípios portugueses. O Scrappy recolhe eventos de
fontes públicas, normaliza os dados, guarda-os numa API .NET com MongoDB e
disponibiliza-os através de um backoffice web e de integrações externas, como
WhatsApp.

> O projeto está em desenvolvimento. Este README descreve a implementação
> atual do repositório, incluindo as partes que ainda estão a ser concluídas.

## Índice

- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Arranque rápido com Docker](#arranque-rápido-com-docker)
- [Desenvolvimento local](#desenvolvimento-local)
- [Configuração](#configuração)
- [Scraping e ingestão](#scraping-e-ingestão)
- [API](#api)
- [Backoffice web](#backoffice-web)
- [WhatsApp](#whatsapp)
- [Testes e validações](#testes-e-validações)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Documentação adicional](#documentação-adicional)
- [Limitações conhecidas](#limitações-conhecidas)
- [Contribuir](#contribuir)

## Funcionalidades

- Recolha de eventos de fontes configuráveis, atualmente com adaptadores para
  BOL e Viral Agenda.
- Extração com Cheerio/Crawlee e fallback para Playwright quando uma página é
  dinâmica ou não contém dados suficientes no HTML.
- Normalização de datas, tipos, localização, coordenadas e metadados através de
  um contrato comum (`RawEvent`).
- Fila assíncrona Redis/BullMQ entre o scraper e o worker de ingestão.
- API REST para criar, pesquisar, editar, apagar e publicar eventos.
- Deduplicação de eventos, cálculo de `QualityScore` e atualização automática
  do ciclo de vida dos eventos.
- Backoffice Next.js com pesquisa, filtros, mapa, edição de eventos e página de
  QR codes para adesão ao WhatsApp.
- Webhook WhatsApp para subscrição e cancelamento de localidades através de
  comandos como `Subscrever Alcobaça` e `Stop São João da Madeira`.

## Arquitetura

```text
Fontes públicas
      │
      ▼
Scraper (Crawlee + Cheerio/Playwright)
      │  RawEvent validado por Zod
      ▼
Redis + BullMQ (events-ingestion-queue)
      │
      ▼
Worker de ingestão (Node.js + TypeScript)
      │  POST /events
      ▼
API Scrappy (.NET 10)
      │  validação, geografia, deduplicação e regras de negócio
      ▼
MongoDB
      ├──► Backoffice Next.js
      ├──► API pública de eventos
      └──► Seleção e notificações WhatsApp
```

O scraper envia um job por evento para a fila `events-ingestion-queue`. O worker
processa cada job individualmente e envia-o para a API. A API valida o payload,
infere os dados territoriais, calcula a qualidade, atualiza eventos duplicados
quando aplicável e persiste a informação na coleção `DistrictEvents`.

A API mantém ainda as coleções `WhatsAppSubscriptions` e
`WhatsAppProcessedMessages`. Um índice único impede mais do que uma subscrição
para o mesmo utilizador e localidade.

## Tecnologias

| Área | Tecnologias |
| --- | --- |
| API | .NET 10, ASP.NET Core, C# |
| Persistência | MongoDB 8 |
| Fila | Redis 8, BullMQ |
| Scraper e worker | Node.js 22, TypeScript, Crawlee, Cheerio, Playwright, Zod |
| Frontend | Next.js 16, React 19, Leaflet, Tailwind CSS |
| Testes | xUnit, Node test runner, TypeScript |
| Execução | Docker Compose, pnpm |

## Pré-requisitos

Para trabalhar diretamente no host:

- Git;
- Node.js 22 ou superior;
- pnpm 11, ativado através do Corepack;
- .NET SDK 10;
- Docker Desktop ou Docker Engine com Docker Compose v2;
- Chromium do Playwright, caso o scraper seja executado fora de Docker.

Depois de clonar o repositório, instalar as dependências e ativar os hooks:

```sh
corepack enable
pnpm install
```

O `pnpm install` prepara os hooks do Husky. O `.env` é local, está ignorado
pelo Git e nunca deve conter segredos versionados.

## Arranque rápido com Docker

O Compose inicia a aplicação com a API, o backoffice, o worker de ingestão,
MongoDB e Redis:

```sh
docker compose -f docker/docker-compose.yml up -d --build
```

URLs principais:

| Serviço | URL |
| --- | --- |
| Backoffice | <http://localhost:3000> |
| API | <http://localhost:5000> |
| Swagger UI (Development) | <http://localhost:5000/swagger> |
| OpenAPI (Development) | <http://localhost:5000/openapi/v1.json> |
| MongoDB | `localhost:27017` |
| Redis | `localhost:6379` |

Para verificar os containers e acompanhar logs:

```sh
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml logs -f api
```

Também existem atalhos no `Makefile`:

```sh
make rebuild-all  # reconstruir e iniciar os serviços base
make up           # iniciar sem forçar uma reconstrução
make down         # parar os serviços, preservando os volumes
```

O scraper não é iniciado pelo arranque base. Para executar uma recolha manual,
consulte [Scraping e ingestão](#scraping-e-ingestão).

## Desenvolvimento local

É possível executar a API e o frontend diretamente no host e manter apenas
MongoDB e Redis em Docker.

### 1. Iniciar a infraestrutura

```sh
docker compose -f docker/docker-compose.yml up -d mongodb redis
```

### 2. Iniciar a API

O perfil HTTP local usa a porta `5275`:

```sh
dotnet run --project Scrappy/Scrappy.csproj --launch-profile http
```

Para usar o perfil HTTPS, executar com `--launch-profile https`; a porta HTTP é
`5275` e a HTTPS é `7120`.

### 3. Iniciar o backoffice

Quando a API está a correr diretamente no host, indicar a sua porta ao Next.js:

```sh
NEXT_PUBLIC_API_URL=http://localhost:5275 pnpm --filter web dev
```

O backoffice fica disponível em <http://localhost:3000>. O comando
`pnpm --filter web dev` é usado porque `web` é um package do workspace; também é
possível executar `pnpm dev` dentro de `apps/web`.

### 4. Iniciar o worker

Numa segunda consola:

```sh
REDIS_HOST=localhost \
REDIS_PORT=6379 \
API_URL=http://localhost:5275/events \
pnpm worker
```

### 5. Executar o scraper

Numa terceira consola, com o worker já ativo:

```sh
REDIS_HOST=localhost \
REDIS_PORT=6379 \
API_URL=http://localhost:5275/events \
pnpm scraper
```

Se o scraper for executado localmente pela primeira vez, instalar o Chromium:

```sh
pnpm --filter @scrappy/scraper exec playwright install chromium
```

Se a API e o worker estiverem em Docker, o scraper local deve usar
`API_URL=http://localhost:5000/events`; entre containers, os nomes corretos são
`api` e `redis`, não `localhost`.

## Configuração

### Variáveis da API e do frontend

As variáveis de configuração .NET podem ser definidas no `appsettings`, através
de variáveis de ambiente com `__` ou através do User Secrets.

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `ConnectionStrings__MongoDb` | sim | Connection string MongoDB com nome de base de dados |
| `ASPNETCORE_ENVIRONMENT` | não | `Development` ativa OpenAPI/Swagger |
| `NEXT_PUBLIC_API_URL` | não | URL da API usada pelo frontend; por defeito, `http://localhost:5000` |
| `WhatsApp__AccessToken` | para WhatsApp | Token de acesso Graph API |
| `WhatsApp__AppSecret` | para webhook | App Secret usado para validar `X-Hub-Signature-256` |
| `WhatsApp__PhoneNumberId` | para WhatsApp | ID do número de telefone WhatsApp Business |
| `WhatsApp__WabaId` | para WhatsApp | ID da WhatsApp Business Account |
| `WhatsApp__VerifyToken` | para webhook | Token definido também na configuração do webhook da Meta |
| `WhatsApp__GraphApiVersion` | para envio | Versão da Graph API, com ou sem o prefixo `v` |
| `WhatsApp__MaxEventsPerMessage` | não | Limite de eventos por mensagem, entre 1 e 100; por defeito, 100 |
| `WhatsApp__MessageTimeZone` | não | Timezone das mensagens; por defeito, `Europe/Lisbon` |

### Variáveis do scraper e do worker

| Variável | Valor por defeito | Descrição |
| --- | --- | --- |
| `REDIS_HOST` | `localhost` | Host do Redis |
| `REDIS_PORT` | `6379` | Porta do Redis |
| `REDIS_PASSWORD` | — | Password opcional do Redis |
| `API_URL` | `http://localhost:5000/events` | Endpoint `POST /events` usado pelo worker |
| `SCRAPER_USER_AGENT` | User-Agent de browser | User-Agent usado nas páginas externas |

### Variáveis do scheduler

| Variável | Valor por defeito | Descrição |
| --- | --- | --- |
| `SCRAPER_SCHEDULE_MODE` | `daily` | `daily` ou `interval` |
| `SCRAPER_SCHEDULE_TIME` | `06:00` | Hora diária em formato `HH:MM` |
| `SCRAPER_TIMEZONE` | `Europe/Lisbon` | Timezone do agendamento |
| `SCRAPER_INTERVAL_SECONDS` | `300` | Intervalo quando o modo é `interval` |
| `SCRAPER_RUN_ON_START` | `false` | Executar imediatamente no modo `interval` |

No Docker Compose, as variáveis da Meta são lidas de um `.env` na raiz e
convertidas para a secção `WhatsApp__...` da API. Um exemplo de nomes, sem
valores reais:

```env
WHATSAPP_ACCESS_TOKEN=replace-me
WHATSAPP_APP_SECRET=replace-me
WHATSAPP_PHONE_NUMBER_ID=replace-me
WHATSAPP_WABA_ID=replace-me
WHATSAPP_VERIFY_TOKEN=replace-me
WHATSAPP_GRAPH_API_VERSION=replace-me
NGROK_AUTHTOKEN=replace-me
NGROK_DOMAIN=replace-me
```

Para desenvolvimento .NET, também é possível guardar secrets sem os colocar no
repositório:

```sh
dotnet user-secrets --project Scrappy/Scrappy.csproj \
  set "WhatsApp:VerifyToken" "replace-me"
```

## Scraping e ingestão

O entrypoint do scraper é `apps/scraper/main.ts`. As fontes são configuradas em
[`apps/scraper/config/sources.json`](apps/scraper/config/sources.json), com os
campos:

- `sourceId`: identificador da fonte;
- `sourceUrl`: URL inicial;
- `engine`: `cheerio`, `playwright` ou `auto`;
- `timezone`: timezone para interpretar datas sem offset.

As entradas atualmente versionadas apontam para páginas BOL de Faro, Alcobaça e
Lourinhã. O código de extração da Viral Agenda também existe; as suas fontes
devem ser ativadas em `sources.json` quando estiverem disponíveis e de acordo
com as regras da fonte. O blacklist de URLs está em
[`apps/scraper/config/blacklist.json`](apps/scraper/config/blacklist.json).

O fluxo do evento é:

1. descobrir e descarregar páginas;
2. extrair HTML/JSON-LD e aplicar fallbacks;
3. normalizar datas, tipos, localização e metadados;
4. validar o resultado com `apps/shared/rawEvent.ts`;
5. publicar o evento em `events-ingestion-queue`;
6. o worker enviar `POST /events` para a API;
7. a API validar, deduplicar e persistir o evento.

### Recolha manual

Com API, Redis e worker ativos:

```sh
make scraper
```

Equivalente direto:

```sh
docker compose -f docker/docker-compose.yml \
  --profile scheduled run --rm --no-deps --build scraper
```

### Scheduler permanente

Por defeito, o scheduler executa uma recolha diária às `06:00` em
`Europe/Lisbon`:

```sh
make scheduler
make scheduler-logs
```

Para testar com uma recolha imediata e depois a cada cinco minutos:

```sh
SCRAPER_SCHEDULE_MODE=interval \
SCRAPER_INTERVAL_SECONDS=300 \
SCRAPER_RUN_ON_START=true \
docker compose -f docker/docker-compose.yml \
  --profile scheduler up -d --build --force-recreate scheduler
```

Logs úteis:

```sh
make scraper-logs
make worker-logs
make mongo-logs
make redis-logs
```

As fontes externas devem ser consultadas respeitando `robots.txt`, termos de
utilização, limites publicados e uma frequência razoável. Um bloqueio não deve
ser contornado através de rotação agressiva de IPs ou de retries.

Mais detalhes em [docs/SCRAPING.md](docs/SCRAPING.md).

## API

### URLs base

| Execução | API |
| --- | --- |
| Docker Compose | <http://localhost:5000> |
| .NET HTTP local | <http://localhost:5275> |
| .NET HTTPS local | <https://localhost:7120> |

Em `Development`:

- Swagger UI: `/swagger`;
- documento OpenAPI: `/openapi/v1.json`.

### Endpoints principais

| Método | Rota | Função |
| --- | --- | --- |
| `GET` | `/events` | Lista todos os eventos guardados |
| `POST` | `/events` | Cria ou ingere um evento |
| `GET` | `/events/search` | Pesquisa paginada com filtros e ordenação |
| `GET` | `/events/{id}` | Obtém um evento por ObjectId |
| `PATCH` | `/events/{id}` | Atualiza parcialmente um evento |
| `DELETE` | `/events/{id}` | Apaga um evento |
| `GET` | `/events/{id}/schema-org` | Obtém a representação `application/ld+json` |
| `GET` | `/public/events` | Pesquisa apenas eventos publicados |
| `GET` | `/webhooks/whatsapp` | Verifica o webhook da Meta |
| `POST` | `/webhooks/whatsapp` | Recebe mensagens assinadas do WhatsApp |

Exemplo de pesquisa:

```sh
curl "http://localhost:5000/events/search?district=Faro&type=Festival&page=1&pageSize=20&sortBy=date_asc"
```

Os filtros incluem distrito, localidade, região, tipo, estado, modo de
participação, gratuitidade, coordenadas, publicação, qualidade, texto e datas.
As ordenações disponíveis são `date_asc`, `date_desc`, `quality_asc`,
`quality_desc`, `title_asc`, `title_desc`, `location_asc`, `location_desc`,
`type_asc` e `type_desc`.

O `QualityScore` varia entre 0 e 100 e atribui 25 pontos por cada critério
preenchido: descrição com pelo menos 50 caracteres, data de início, local e
tipo de evento válido.

Os enums são serializados pelos nomes dos membros C#, por exemplo `Festival`,
`Faro`, `PT15` e `FestaPopular`, e não pelos nomes de apresentação com espaços.
Os IDs de evento são ObjectIds MongoDB com 24 caracteres.

Não existe autenticação/autorização implementada neste momento. Antes de expor
as operações de escrita publicamente, deve ser adicionada uma camada de acesso.

Mais detalhes de payloads e contratos em
[docs/API_REFERENCE.md](docs/API_REFERENCE.md).

## Backoffice web

O frontend está em `apps/web` e é uma aplicação Next.js. A página principal
(`/`) disponibiliza o módulo de eventos com filtros, mapa, estatísticas e
edição. A página `/whatsapp` apresenta QR codes que abrem uma conversa com o
número de teste e uma mensagem de adesão preenchida.

Para desenvolvimento:

```sh
pnpm --filter web dev
```

Para produção local:

```sh
NEXT_PUBLIC_API_URL=http://localhost:5000 \
pnpm --filter web build
pnpm --filter web start
```

O valor de `NEXT_PUBLIC_API_URL` é incorporado no frontend durante o build. Se
a API estiver na porta `5275`, usar esse valor também no build.

## WhatsApp

O backend recebe e valida webhooks da Meta no endpoint:

```text
https://<domínio-público>/webhooks/whatsapp
```

Na configuração do webhook da Meta:

- `Callback URL`: o URL público acima;
- `Verify Token`: o mesmo valor de `WhatsApp__VerifyToken`;
- subscrever o campo `messages`.

Para expor uma API Docker local na porta `5000`, o atalho preparado no
repositório é:

```sh
make ngrok-tunnel
```

Para uma API executada diretamente pelo perfil HTTP do .NET, expor a porta
`5275` com o comando equivalente do ngrok. O túnel tem de apontar para a mesma
máquina onde a API está a correr.

Comandos reconhecidos pelo bot:

```text
Help
Ajuda
Subscrever <localidade>
Stop <localidade>
```

As localidades são normalizadas sem depender de acentos ou pontuação. Por
exemplo, `Alcobaça` e `alcobaca` resolvem para o slug `alcobaca`, enquanto
`São João da Madeira` resolve para `sao-joao-da-madeira`.

O webhook valida a assinatura `X-Hub-Signature-256`, ignora mensagens
duplicadas e as subscrições ficam em MongoDB. O cliente WhatsApp atualmente
envia respostas de texto; o envio proativo de templates aprovados e o dispatch
semanal ainda requerem a integração final do scheduler.

Nunca colocar tokens, App Secrets ou Verify Tokens no Git, no frontend ou em
capturas de ecrã. Se um token for exposto, revogá-lo e gerar outro na Meta.

## Testes e validações

### API .NET

```sh
dotnet test Scrappy.Tests/Scrappy.Tests.csproj
dotnet build Scrappy/Scrappy.csproj --configuration Release
```

### TypeScript, scraper e frontend

```sh
pnpm typecheck
pnpm test1                  # testes do extrator Viral Agenda
pnpm test2                  # testes do extrator BOL
pnpm --filter web lint
pnpm --filter web build
```

### Hooks e checks do repositório

```sh
pnpm format:check           # formato C# sem alterar ficheiros
pnpm build:check            # build Release da API
pnpm precommit
pnpm prepush
```

O pre-commit verifica o formato C# dos ficheiros staged. O pre-push executa o
build Release configurado no package raiz.

## Estrutura do repositório

```text
scrappy/
├── Scrappy/                         # API ASP.NET Core .NET 10
│   ├── Controllers/                 # REST, pesquisa pública e webhook
│   ├── DTOs/                        # contratos de entrada e saída
│   ├── Integrations/WhatsApp/       # Meta API, parser e comandos
│   ├── Models/Entities/             # entidades MongoDB e enums
│   ├── Services/                    # regras de negócio e consultas
│   ├── Validators/                  # validação de payloads
│   └── appsettings*.json            # configuração da API
├── Scrappy.Tests/                   # testes xUnit da API
├── apps/
│   ├── web/                         # backoffice Next.js
│   ├── scraper/                     # crawler, fontes e normalização
│   ├── ingestion/                   # produtor/worker BullMQ
│   └── shared/                       # schemas Zod e utilitários partilhados
├── docker/docker-compose.yml        # ambiente integrado local
├── ops/                             # Dockerfiles e scheduler
├── docs/                            # arquitetura, API, scraping e contexto
├── Makefile                         # atalhos de operação
├── package.json                     # scripts pnpm da workspace
└── pnpm-workspace.yaml              # definição da workspace
```

## Documentação adicional

- [Arquitetura e fluxo de dados](docs/ARCHITECTURE.md)
- [Pipeline de scraping](docs/SCRAPING.md)
- [Referência detalhada da API](docs/API_REFERENCE.md)
- [Contexto técnico e contratos](docs/CONTEXT.md)
- [Plano WhatsApp — Gonçalo](docs/scrappy-whatsapp-goncalo.md)
- [Plano WhatsApp — Adrien](docs/scrappy-whatsapp-adrien.md)
- [Documentação do scheduler](ops/scheduler/README.md)

## Limitações conhecidas

- O projeto ainda não tem autenticação ou autorização para operações de escrita.
- A cobertura de fontes e o funcionamento de cada fonte dependem da configuração
  e da disponibilidade dos sites externos.
- O número de teste e as mensagens da página de QR são configuração de frontend
  para demonstração, não uma configuração de produção.
- A integração WhatsApp de comandos e respostas está ativa; o envio proativo
  semanal com template aprovado ainda não está ligado a um dispatcher permanente.
- OpenAPI e Swagger só são expostos quando `ASPNETCORE_ENVIRONMENT=Development`.
- `GET /events` é uma lista não paginada; para interfaces e grandes volumes usar
  `/events/search`.

## Contribuir

1. Criar uma branch para a alteração.
2. Não commitar `.env`, tokens, certificados ou dados locais.
3. Manter `apps/shared/rawEvent.ts` como contrato entre extração e ingestão.
4. Não inventar datas, locais ou dados territoriais quando uma fonte não os
   fornece; rejeitar ou marcar o evento para revisão.
5. Executar os testes e checks adequados antes de abrir um pull request.
6. Atualizar a documentação quando uma rota, variável, fonte ou fluxo mudar.

Consulte também o [LICENSE](LICENSE).
