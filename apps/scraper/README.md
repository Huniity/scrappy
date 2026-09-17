# Scraper

`apps/scraper` é o crawler que recolhe eventos de páginas públicas, transforma
os formatos específicos de cada fonte num contrato comum e publica os eventos
na fila de ingestão. Não grava diretamente na API nem no MongoDB: essa parte é
feita pelo worker em `apps/ingestion`.

```text
config/sources.json
        │
        ▼
CheerioCrawler (Crawlee)
        │ descobre links e lê HTML/JSON-LD
        ├───────────────┐
        │               │ página dinâmica ou dados incompletos
        ▼               ▼
  extractores       Playwright (fallback)
        │               │
        └───────┬───────┘
                ▼
  normalização + localização + metadados + tipo
                │
                ▼
        RawEvent (Zod, apps/shared)
                │
                ▼
      Redis/BullMQ → apps/ingestion → API
```

## Execução

Na raiz da workspace, com Redis e a API disponíveis:

```sh
pnpm scraper
```

O comando equivalente dentro do package é:

```sh
pnpm --filter @scrappy/scraper start
```

O entrypoint é `main.ts`. No arranque, ele lê `config/sources.json`, valida a
configuração com `source.ts`, cria um `CheerioCrawler` e, no final, espera que
os lotes de ingestão terminem antes de fechar a fila e o browser Playwright.

## Configuração de fontes

`config/sources.json` é uma lista de jobs. Cada job tem:

| Campo | Significado |
| --- | --- |
| `sourceUrl` | Página inicial que será visitada. Tem de ser um URL válido; os URLs publicados são normalizados para HTTP(S). |
| `sourceId` | Identificador lógico da fonte/job; o prefixo `viral-agenda` ativa a descoberta especial dessa fonte. |
| `engine` | `auto`, `cheerio` ou `playwright`; é validado no contrato de configuração. Atualmente `main.ts` cria sempre o `CheerioCrawler` e usa Playwright como fallback. |
| `timezone` | Fuso horário da fonte, atualmente `Europe/Lisbon`. |

As entradas ativas são mantidas em `config/sources.json`. A lista de
`config/SOURCES.md` contém referências de Viral Agenda que podem ser reativadas
quando a fonte deixar de bloquear o crawler; não é carregada automaticamente.

`config/blacklist.json` impede que a descoberta siga recursos ou páginas que
não são eventos, como PDF, imagens, login, contactos e mapa do site.

## Fluxo de uma execução

1. `main.ts` separa os jobs de Viral Agenda (ID `viral-agenda` ou com esse
   prefixo) dos restantes jobs.
2. Para cada listagem Viral Agenda, `discoverViralAgendaEventUrls` abre uma
   página Playwright, faz scroll do carregamento infinito e recolhe URLs de
   eventos futuros. Para os outros jobs, o URL configurado é a request inicial.
3. O router processa páginas de listagem e coloca na fila URLs de detalhe BOL
   (`BOL_EVENT_DETAIL`) e Viral Agenda (`EVENT_DETAIL`).
4. O handler de detalhe tenta ler JSON-LD/HTML com Cheerio. Viral Agenda também
   consulta o endpoint `/map` da própria página para obter coordenadas.
5. Se a página for dinâmica, faltar JSON-LD ou os dados não forem utilizáveis,
   o `failedRequestHandler` tenta o mesmo evento até três vezes com Playwright.
6. O extrator da fonte produz um `NormalizedEvent`. Os normalizadores limpam
   texto, datas, ofertas, agentes, audiência, estado e modo de participação.
7. `resolveLocation` determina o município português: primeiro pelas
   coordenadas dentro do GeoJSON CAOP e, se necessário, pelo nome exato da
   localidade/município (ignorando maiúsculas e diacríticos).
8. `extractEventMetadata` obtém preço, gratuitidade, classificação etária e
   lotação quando estão no texto ou nas ofertas. Os normalizadores também podem
   extrair hora de abertura e duração. `classifyEventType` converte tipos
   Schema.org e palavras-chave para o enum da API.
9. Eventos anteriores ao dia atual (fuso `Europe/Lisbon`) são ignorados.
   Eventos sem município exato ou com payload inválido também não são
   publicados.
10. O resultado passa por `rawEventSchema` de `apps/shared` e é enviado por
    `pushToIngestionQueue`. O worker faz a chamada `POST /events`.
11. Depois de todas as requests, `flushIngestionBatch` aguarda os jobs BullMQ
    pendentes; `closePlaywrightFallback` e `closeIngestionQueue` libertam os
    recursos.

Um evento encontrado no scraper ainda não significa que foi persistido: a
confirmação final ocorre no worker e na API.

## Router e fallback

`router.ts` concentra as decisões de crawling:

- reconhece URLs de detalhe pelos hosts e padrões de BOL e Viral Agenda;
- no handler predefinido extrai links de BOL e usa `enqueueLinks` para links
  Viral Agenda, aplicando a blacklist;
- valida cada evento, enriquece-o e publica-o na fila;
- regista falhas e escolhe o fallback Playwright apenas para URLs de detalhe.

O browser Playwright é criado de forma preguiçosa e partilhado entre requests.
Cada tentativa abre e fecha a sua página; o browser é fechado no `finally` do
entrypoint. São enviados headers e user-agent de browser para reduzir respostas
incompletas das fontes.

O `engine` da configuração não seleciona ainda uma classe de crawler diferente:
é um campo validado para manter o contrato preparado para essa evolução. A
estratégia efetiva é Cheerio primeiro e Playwright para descoberta Viral Agenda
ou recuperação de páginas de detalhe.

## Adaptadores das fontes

### BOL

`sources/bol/extract.ts` procura o nó de evento em JSON-LD, trata `@graph`,
localização, coordenadas em iframes, imagem, sessões, ofertas e tipos. O
normalizador em `src/normalization/bol.ts` converte datas BOL (incluindo datas
sem offset), preços, classificação etária e atrações contínuas para
`NormalizedEvent`.

Quando o HTML inicial não contém a informação, os extractores em
`src/crawlers/bol/extractors.ts` usam uma página Playwright renderizada e
rejeitam o aviso de cookies antes de extrair os mesmos campos.

### Viral Agenda

`src/crawlers/viralAgenda.ts` trata duas tarefas que exigem browser:

- descobrir todos os links numa listagem com infinite scroll, parando no
  marcador de eventos passados;
- abrir um detalhe, esperar pelo JSON-LD/rede e consultar `POST <evento>/map`.

`sources/viralAgenda/extract.ts` interpreta JSON-LD, aceita propriedades que
podem ser um objeto ou uma lista (`organizer`, `offers`, `audience`, agenda,
etc.) e converte o resultado através de `src/normalization/viralAgenda.ts`.

## Normalização e enriquecimento

| Pasta/ficheiro | Papel |
| --- | --- |
| `src/types/normalizedEvent.ts` | Contrato interno intermédio, mais permissivo que `RawEvent`, usado entre extractor e validação final. |
| `src/types/agent.ts`, `audience.ts`, `offer.ts`, `schedule.ts` | Tipos dos objetos aninhados lidos de Schema.org. |
| `src/types/attendance.ts`, `status.ts` | Mapas de valores Schema.org para os enums internos. |
| `src/normalization/bol.ts` | Regras específicas de BOL para datas, sessões, preços e atrações. |
| `src/normalization/viralAgenda.ts` | Limpeza e conversão do JSON-LD Viral Agenda. |
| `src/normalization/dates.ts` | Offset de Lisboa, validação de datas e filtro de eventos passados. |
| `src/enrichment/location.ts` | Resolve município e preserva coordenadas válidas. |
| `src/enrichment/eventMetadata.ts` | Infere preço, gratuito, idade, lotação, portas e duração. |
| `src/enrichment/eventType.ts` | Classifica o evento no enum aceite pela API. |
| `src/geo/municipalities.ts` | Carrega `data/geo/municipalities.geojson` e faz pesquisa por ponto ou nome exato. |
| `src/deduplication/events.ts` | Disponibiliza deduplicação de listas `NormalizedEvent` por título, dia e localidade, preferindo o registo com datas mais completas e preenchendo campos em falta. O router atual não chama este helper; a deduplicação efetiva do pipeline ocorre na API. |

As variantes em `data/geo/prepared/` são artefactos geográficos preparados para
uso/consulta; o módulo atual carrega explicitamente o GeoJSON principal
`data/geo/municipalities.geojson`.

## Contrato de saída

Antes de entrar na fila, cada evento é convertido para `RawEvent` e validado
com o schema partilhado. Os campos essenciais são título, descrição, URL,
`startDate`, `locationName` e município. O schema também garante:

- datas com offset e `endDate` não anterior ao início;
- latitude e longitude presentes em conjunto e dentro dos limites geográficos;
- enum de tipo, estado e modo de participação;
- limites para texto, palavras-chave, agentes, audiência e ofertas;
- preços e lotação não negativos.

Se a validação falhar, o scraper regista o motivo e descarta o evento. A
normalização do URL com `apps/shared/jobId.ts` remove fragmentos, parâmetros de
tracking e diferenças cosméticas antes de o evento ser publicado.

## Logs, testes e dados locais

Os logs coloridos de eventos encontrados, duplicados, erros e fim do crawl vêm
de `apps/shared/eventLog.ts`; são enviados para a consola e não constituem uma
base de dados de auditoria.

Os testes de extração e enriquecimento ficam junto ao código (`*.test.ts`). Na
raiz podem ser executados, por exemplo:

```sh
pnpm test1   # extractor Viral Agenda
pnpm test2   # extractor BOL
pnpm typecheck
```

`apps/scraper/storage/` é o armazenamento local gerado pelo Crawlee (fila de
requests, snapshots e estatísticas). É temporário/operacional, está ignorado
no Git e não substitui Redis, MongoDB ou a API. Não adicionar credenciais nem
dados de produção a esta pasta.

## Alterar ou adicionar uma fonte

1. Registar o job e o timezone em `config/sources.json` e confirmar o schema.
2. Verificar o padrão de URL no router e limitar a descoberta a links de
   detalhe.
3. Criar ou ajustar o extractor e o tipo específico da fonte.
4. Converter para `NormalizedEvent`, reutilizando os normalizadores de datas,
   localização e metadados sempre que possível.
5. Validar um `RawEvent` real e acrescentar testes para campos obrigatórios,
   datas, município e fallback Playwright.
6. Confirmar que o worker recebe o job, que o endpoint da API responde e que a
   deduplicação não cria eventos repetidos.

Não alterar apenas o extractor quando o formato de saída mudar: o contrato em
`apps/shared/rawEvent.ts`, o adaptador de `apps/ingestion` e os DTOs/mappers da
API têm de continuar compatíveis.
