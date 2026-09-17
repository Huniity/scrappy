# Ingestion worker

`apps/ingestion` é a ponte entre o scraper e a API Scrappy. Não é a camada que
extrai HTML nem a que persiste diretamente em MongoDB: recebe eventos
normalizados através da fila BullMQ, valida/adapta o payload e chama
`POST /events` na API.

```text
apps/scraper
    │
    │ pushToIngestionQueue(RawEvent)
    ▼
Redis + BullMQ: events-ingestion-queue
    │
    │ Worker consome process-event
    ▼
apps/ingestion/worker.ts
    │ valida Zod e converte campos
    ▼
POST /events (API Scrappy)
    │
    └─ MongoDB e resposta created/merged/skipped
```

## Ficheiros

| Ficheiro | Responsabilidade |
| --- | --- |
| `worker.ts` | Cria o worker BullMQ, valida o `RawEvent`, normaliza a localidade, converte o formato para o DTO da API e interpreta a resposta de ingestão. |
| `queue.ts` | Expõe o produtor `pushToIngestionQueue` usado pelo scraper, cria jobs com ID determinístico, evita duplicados, aguarda lotes e acompanha eventos concluídos/falhados. |
| `locality.ts` | Converte nomes de municípios vindos das fontes para os nomes da enumeração `LocalityName` esperados pela API, tratando ambiguidades como `Lagoa` e `Calheta` com região/coordenadas. |
| `clearQueue.ts` | Script operacional que remove jobs BullMQ concluídos da fila. Não apaga eventos do MongoDB. |
| `package.json` | Define o package `@scrappy/ingestion`, os comandos `start`/`clear` e dependências de BullMQ, ioredis e `tsx`. |

## `worker.ts`: processamento de um job

Para cada job `process-event`, o worker executa:

1. lê o `RawEvent` recebido do Redis;
2. valida a estrutura com `rawEventSchema` de `apps/shared`;
3. converte `municipality` para o nome de localidade da API;
4. constrói o payload `CreateEventDto`, incluindo localização, agentes,
   audiência, agenda, ofertas e metadados;
5. envia `POST` para `API_URL` com timeout de 30 segundos;
6. interpreta o header `X-Ingestion-Action` e devolve `created`, `merged` ou
   `skipped` ao BullMQ.

O campo `price` antigo é convertido numa oferta `Bilhete` apenas quando o
evento não traz uma lista `offers`. O worker também adapta `image` para
`imageUrl` e, quando necessário, reduz `sameAs` a um único URL para o contrato
da API.

## Retry e limites

O produtor cria cada job com:

- `jobId` derivado do `sourceUrl`;
- três tentativas;
- backoff exponencial inicial de um segundo;
- remoção imediata após sucesso;
- retenção de falhas durante 24 horas, até 1000 jobs.

O worker limita o processamento a cinco jobs por segundo. Erros de rede,
timeouts e respostas HTTP 5xx podem ser repetidos. Respostas 4xx são lançadas
como `UnrecoverableError`, porque normalmente representam um payload que precisa
de ser corrigido e não vai melhorar com retry.

Há uma exceção intencional: se a API responder 400 com a mensagem de duplicado
conhecida, o worker transforma o resultado em `skipped` e considera o job
processado.

## `queue.ts`: produtor e barreira de lotes

O scraper chama `pushToIngestionQueue` em vez de criar jobs diretamente. A
função serializa as operações de enqueue, verifica se já existe um job com o
mesmo ID e coloca os jobs pendentes num lote de 100.

Quando um lote fica completo, ou quando o scraper termina, `flushIngestionBatch`
espera pelos eventos `completed`/`failed` do BullMQ e imprime um resumo. Assim,
uma execução do scraper não termina a indicar sucesso enquanto os seus eventos
ainda estão apenas pendentes na fila.

Jobs duplicados que ainda estão ativos são reutilizados. Jobs duplicados que
ficaram falhados são removidos antes de o payload corrigido ser reenfileirado.
Isto é uma proteção da fila; a deduplicação de conteúdo continua a ser da
responsabilidade da API (`EventDeduplicationService`).

## Localidades

`toApiLocalityName` faz uma normalização própria para o contrato C#:

```text
Castanheira de Pêra → CastanheiraDePera
Lagoa + PT15        → LagoaAlgarve
Lagoa + PT20        → LagoaAçores
Calheta + PT20      → CalhetaAçores
Calheta + PT30      → CalhetaMadeira
```

Uma localidade ambígua sem região nem coordenadas lança erro. Esse erro falha o
job e evita enviar à API um município incorreto.

## Configuração e execução

As variáveis são lidas em `apps/shared/env.ts`:

| Variável | Uso | Valor local por defeito |
| --- | --- | --- |
| `REDIS_HOST` | Host do Redis | `localhost` |
| `REDIS_PORT` | Porta do Redis | `6379` |
| `REDIS_PASSWORD` | Password opcional | — |
| `API_URL` | Endpoint de ingestão | `http://localhost:5000/events` |

Com a infraestrutura local ativa:

```sh
pnpm worker
```

Ou diretamente:

```sh
pnpm --filter @scrappy/ingestion start
```

Para remover apenas jobs concluídos:

```sh
pnpm --filter @scrappy/ingestion clear
```

Em Docker, o worker usa `REDIS_HOST=redis` e `API_URL=http://api:5000/events`.
Entre containers não deve ser usado `localhost`, porque isso apontaria para o
próprio container do worker.

## Dependências internas

- `apps/shared/rawEvent.ts`: contrato Zod do evento normalizado;
- `apps/shared/redis.ts`: ligação comum ao Redis;
- `apps/shared/jobId.ts`: geração do ID determinístico a partir do URL;
- `apps/shared/eventLog.ts`: logs de eventos duplicados e erros;
- `Scrappy/Controllers/EventsController.cs`: recebe o `CreateEventDto`;
- `Scrappy/Services/EventServices.cs`: valida, deduplica e persiste.

Ao alterar o payload, atualizar primeiro o contrato partilhado, depois o
adaptador do worker e finalmente o DTO/mapper da API. Testar também retries,
jobs duplicados e as localidades ambíguas.
