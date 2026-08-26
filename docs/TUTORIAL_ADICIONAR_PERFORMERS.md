# Tutorial: adicionar performers ao scraper

Este tutorial descreve como extrair performers do Viral Agenda e enviá-los para a API e MongoDB.

Exemplo usado:

- Evento: [Feira dos Moços 2026](https://www.viralagenda.com/pt/events/1835849/feira-dos-mocos-2026)
- Performer: `AUGUSTO CANÁRIO & AMIGOS`
- Tipo: `MusicGroup`

## Fluxo dos dados

```text
JSON-LD do Viral Agenda
        ↓
extract.ts
        ↓
normalizeViralAgendaEvent()
        ↓
RawEvent / Redis queue
        ↓
worker.ts
        ↓
POST /events
        ↓
MongoDB
```

A API já suporta performers através de `CreateEventDto`, `EventAgentRequestDto`, `EventService`, os mappers e `AgentModel`. Portanto, para criar eventos novos, não é necessário alterar o backend C#.

## 1. Tipos do scraper

Ficheiro: `apps/scraper/src/types/events.ts`

Adicionar um tipo para o performer:

```ts
export type EventPerformer = {
    name: string;
    type?: string;
    url?: string;
    sameAs?: string;
};
```

Adicionar `performer?: unknown` ao tipo `ViralAgendaJsonLd` e `performers?: EventPerformer[]` ao tipo `NormalizedEvent`.

## 2. Extrair o performer do JSON-LD

Ficheiro: `apps/scraper/sources/viralAgenda/extract.ts`

Dentro do objeto devolvido por `toValidEvent()`, preservar o campo original:

```ts
performer: node.performer,
```

O Viral Agenda pode devolver um performer como objeto ou como array. Por isso, essa conversão deve ser feita na normalização.

## 3. Normalizar os performers

Ficheiro: `apps/scraper/src/normalization/viralAgenda.ts`

Criar uma função que:

- aceite objeto ou array;
- ignore entradas sem nome;
- extraia `name`, `@type`, `url` e `sameAs`;
- devolva sempre um array.

Exemplo de resultado esperado:

```ts
performers: [
    {
        name: 'AUGUSTO CANÁRIO & AMIGOS',
        type: 'MusicGroup',
        url: 'https://www.viralagenda.com/pt/p/augustocanario',
        sameAs: 'http://www.augustocanario.pt/',
    },
],
```

No retorno de `normalizeViralAgendaEvent()`:

```ts
performers: normalizePerformers(data.performer),
```

## 4. Validar no RawEvent

Ficheiro: `apps/shared/rawEvent.ts`

Adicionar um schema para os performers:

```ts
const performerSchema = z.object({
    name: z.string().trim().min(1).max(250),
    type: z.enum([
        'Person',
        'Organization',
        'Gov',
        'Company',
        'MusicGroup',
        'PerformingGroup',
        'Other',
    ]).optional(),
    url: z.string().url().optional(),
    sameAs: z.string().url().optional(),
});
```

Dentro de `rawEventSchema`:

```ts
performers: z
    .array(performerSchema)
    .max(50)
    .default([]),
```

## 5. Enviar o performer para a queue

Ficheiro: `apps/scraper/router.ts`

Dentro de `rawEventCandidate`:

```ts
performers: normalizedEvent.performers ?? [],
```

## 6. Enviar o performer para a API

Ficheiro: `apps/ingestion/worker.ts`

Dentro de `apiData`, ao mesmo nível de `offers`:

```ts
performers: rawData.performers,
```

O payload deverá ficar com esta estrutura:

```json
{
  "performers": [
    {
      "name": "AUGUSTO CANÁRIO & AMIGOS",
      "type": "MusicGroup",
      "url": "https://www.viralagenda.com/pt/p/augustocanario",
      "sameAs": "http://www.augustocanario.pt/"
    }
  ]
}
```

## 7. Se também for usada a pipeline Playwright

Ficheiro: `apps/scraper/src/mappers/backendEvent.ts`

Adicionar `performers` ao tipo `CreateEventPayload` e ao payload criado:

```ts
performers: event.performers ?? [],
```

O crawler Playwright já passa pelo normalizador, portanto deverá receber os performers automaticamente depois da alteração da normalização.

## 8. Testes

Adicionar um teste em `apps/scraper/sources/viralAgenda/extract.test.ts` ou num teste de normalização e confirmar:

```ts
assert.equal(
    normalized.performers?.[0].name,
    'AUGUSTO CANÁRIO & AMIGOS',
);

assert.equal(
    normalized.performers?.[0].type,
    'MusicGroup',
);
```

Depois executar:

```bash
npm run typecheck
```

No log do scraper deve aparecer o performer no `Event found`. No log do worker deve aparecer o POST aceite pela API.

## 9. Adicionar outros dados genéricos

Para adicionar qualquer outro campo, seguir sempre o mesmo percurso:

```text
fonte → tipo → extractor → normalização → RawEvent → queue → worker → API → MongoDB
```

Por exemplo, para adicionar `keywords`:

1. Confirmar onde o dado aparece na página ou no JSON-LD.
2. Adicionar o campo ao tipo em `apps/scraper/src/types/events.ts`.
3. Extrair o valor em `apps/scraper/sources/viralAgenda/extract.ts`.
4. Transportar e normalizar o valor em `apps/scraper/src/normalization/viralAgenda.ts`.
5. Validar o campo em `apps/shared/rawEvent.ts`.
6. Adicionar o campo ao `rawEventCandidate` em `apps/scraper/router.ts`.
7. Adicionar o campo ao `apiData` em `apps/ingestion/worker.ts`.
8. Confirmar se o backend já possui esse campo no DTO, mapper e modelo Mongo.
9. Criar um teste que confirme o valor antes da queue e verificar o documento guardado.

Exemplo de um campo simples:

```ts
// NormalizedEvent e RawEvent
keywords?: string[];
```

No `rawEventSchema`:

```ts
keywords: z
    .array(z.string().trim().min(1).max(100))
    .max(50)
    .default([]),
```

No payload enviado pelo worker:

```ts
keywords: rawData.keywords,
```

Para campos que já existem no backend, como `ageRating`, `maximumAttendeeCapacity`, `offers`, `organizer`, `promoter`, `schedule` e `performers`, normalmente basta completar o percurso no scraper e no worker.

Para um campo novo que não exista no backend, também será necessário alterar os DTOs, o modelo de domínio, os mappers, a validação e, se necessário, as respostas da API.

Regra prática: se o campo muda de formato, é um objeto ou uma lista, deve ser normalizado e validado explicitamente. Não convém passar diretamente o valor bruto da página para a API.

## Atenção aos eventos já existentes

Se o evento já existir na base de dados, o worker recebe uma resposta de duplicado e termina sem atualizar os performers. Para enriquecer eventos já guardados é necessário usar o endpoint:

```text
PATCH /events/{id}
```

Para validar primeiro o fluxo completo, é preferível testar com um evento que ainda não exista na base de dados.
