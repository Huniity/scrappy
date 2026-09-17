# Shared

`apps/shared` contém os contratos e utilitários comuns aos packages TypeScript.
É a fronteira entre o scraper, o worker de ingestão e os serviços que usam a
fila: define como é um evento normalizado, como se gera um ID estável e como os
processos encontram Redis. Não contém a extração HTML, regras de persistência
MongoDB ou endpoints HTTP.

```text
scraper ──┐
          ├─ rawEventSchema / RawEvent ──► ingestion ──► API .NET
          ├─ normalizedUrl ─► crawlJobId / ingestionJobId
          ├─ redisConnection ─► BullMQ + Redis
          └─ eventLog / enums ─► logs e classificações consistentes
```

## Ficheiros

| Ficheiro | Responsabilidade |
| --- | --- |
| `rawEvent.ts` | Schema Zod e tipo `RawEvent`, o contrato do evento que atravessa a fila. |
| `eventTypes.ts` | Enum de tipos de evento aceite pelo scraper, worker e API. |
| `territory.ts` | Enums de distrito e região NUTS II. |
| `jobId.ts` | Normalização de URLs e IDs determinísticos SHA-256 para Crawlee/BullMQ. |
| `env.ts` | Carrega `.env`, valida variáveis de ambiente e exporta `env`. |
| `redis.ts` | Constrói a configuração de ligação usada por BullMQ/ioredis. |
| `eventLog.ts` | Logs de consola uniformes para fonte, ID, duplicados, erros e fim do crawl. |
| `*.test.ts` | Testes unitários dos contratos e testes de integração opcionais com Redis. |

## `RawEvent`: contrato entre packages

`rawEventSchema` é aplicado pelo scraper antes do enqueue e pelo worker antes de
chamar a API. Assim, um erro de extração falha perto da origem e não chega como
payload parcialmente inválido ao C#.

Campos principais:

| Grupo | Regras relevantes |
| --- | --- |
| Identidade | `title` entre 3 e 250 caracteres, `description` entre 10 e 2000 e `sourceUrl` válido; a normalização operacional aceita apenas HTTP(S). |
| Datas | `startDate` obrigatório em ISO com offset; `endDate`, `doorTime` e `validFrom` também exigem offset quando presentes; o fim não pode preceder o início. |
| Local | `locationName` e `municipality` obrigatórios; endereço, URL, código DICO e território são opcionais. |
| Coordenadas | latitude [-90, 90] e longitude [-180, 180]; têm de ser fornecidas juntas. |
| Classificação | `type`, `eventStatus` e `eventAttendanceMode` são enums; `type` assume `Outro` por defeito. |
| Metadados | preço e lotação não negativos; idade inteira não negativa; imagem e URLs aninhados válidos. |
| Coleções | palavras-chave, agentes, audiência, ofertas e agenda têm limites para evitar payloads gigantes. |

Os arrays de agentes (`organizer`, `promoter`, `performers`, etc.), audiência,
ofertas e `schedule` preservam informação Schema.org sem obrigar todas as
fontes a fornecer os mesmos campos. Defaults vazios tornam o payload previsível
para o worker.

Ao alterar este schema, procurar todos os consumidores antes de fazer merge:
`apps/scraper/router.ts`, `apps/ingestion/worker.ts`, `apps/ingestion/queue.ts`
e os DTOs/mappers em `Scrappy/`.

## URLs e IDs determinísticos

`normalizedUrl` transforma URLs equivalentes numa representação estável:

- aceita apenas `http:` e `https:`;
- converte protocolo e hostname para minúsculas;
- remove fragmentos e portas padrão (`:80`/`:443`);
- remove barras finais (exceto na raiz);
- elimina `utm_*`, `fbclid`, `gclid`, `mc_cid` e `mc_eid`;
- ordena os restantes parâmetros de query.

Depois, `crawlJobId` e `ingestionJobId` aplicam SHA-256 e acrescentam,
respetivamente, os prefixos `crawl-` e `ingestion-`. O resultado é usado como
ID do job para que URLs com tracking ou diferenças de formatação não criem
requests/eventos duplicados. A deduplicação por conteúdo (título, data,
localidade e qualidade) continua a ser responsabilidade da API.

## Configuração e Redis

`env.ts` carrega automaticamente variáveis de `.env` através de `dotenv` e
falha logo no arranque se um valor não respeitar o schema:

| Variável | Default | Uso |
| --- | --- | --- |
| `REDIS_HOST` | `localhost` | Host do servidor Redis. |
| `REDIS_PORT` | `6379` | Porta Redis, inteiro positivo. |
| `REDIS_PASSWORD` | — | Password opcional. |
| `API_URL` | `http://localhost:5000/events` | Endpoint chamado pelo worker. |

`redisConnection` apenas reúne `host`, `port`, password opcional e
`maxRetriesPerRequest: null`, requisito usado pelo BullMQ em workers de longa
execução. A fila e os workers são criados em `apps/ingestion`; este package não
abre uma ligação por si só nem gere chaves Redis.

Em Docker, os consumidores usam normalmente `REDIS_HOST=redis` e a API usa o
nome do serviço (`http://api:5000/events`). `localhost` dentro de um container
refere-se ao próprio container, não à máquina nem aos outros serviços.

## Enums partilhados

`eventTypes.ts` mantém os valores textuais aceites pela API, como `Concerto`,
`Festival`, `Workshop`, `Infantil` e `Outro`. O scraper classifica eventos para
este enum e o worker envia os mesmos valores no DTO.

`territory.ts` fornece as listas de distrito e NUTS II usadas na validação de
payloads. A API pode enriquecer ou converter nomes de município depois; estes
schemas apenas garantem que, quando o território é fornecido, pertence ao
vocabulário conhecido.

## Logs de operação

`eventLog.ts` escreve apenas para stdout/stderr com cores ANSI:

- `logEventFound` mostra fonte, ID extraído do URL e contador da execução;
- `logDuplicatedEvent` assinala duplicados e o motivo;
- `logCrawlFinished` marca o fim do crawler;
- `logError` inclui stack trace quando recebe um `Error`.

`getEventSource` identifica BOL pelo hostname `bol.pt` e trata o restante como
Viral Agenda; URLs inválidos resultam em `UNKNOWN`. `getEventId` extrai o ID dos
padrões `/pt/events/<id>` e `/Comprar/Bilhetes/<id>`, usando o próprio URL como
fallback. Estes logs são diagnóstico local, não uma auditoria persistente.

## Testes

Os testes de `jobId.ts` cobrem tracking, portas, barras, protocolo e hashes.
Os de `rawEvent.ts` cobrem defaults, coordenadas, datas, enums e limites. O
`redisIntegration.test.ts` é opt-in na prática: cria uma fila e um worker
temporários, envia um job simples e limpa tudo no fim; requer um Redis acessível
com a configuração de ambiente atual.

Antes de alterar um contrato, executar:

```sh
pnpm typecheck
node --import tsx --test apps/shared/*.test.ts
```

Se a mudança alterar o payload, testar também `pnpm test1`, `pnpm test2` e o
worker, porque o schema é consumido em mais do que uma etapa do pipeline.

## Princípios de manutenção

1. Manter este package pequeno e sem dependências de domínio da API ou de uma
   fonte concreta.
2. Fazer alterações de contrato de forma coordenada: schema, scraper, worker e
   DTOs da API.
3. Preferir defaults e validações explícitas a campos `any` silenciosos.
4. Não guardar tokens, payloads reais ou ficheiros de runtime no package.
5. Atualizar os testes quando um valor de enum, limite ou regra de URL mudar.
