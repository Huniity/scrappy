# DTOs

> Contratos de dados que atravessam a fronteira HTTP da API de eventos.

Um DTO (*Data Transfer Object*) descreve a forma de dados que a API aceita ou
devolve. Não é o mesmo que um modelo persistido em MongoDB: os DTOs protegem o
contrato público de detalhes internos de armazenamento e permitem representar o
mesmo evento de formas adequadas a cada consumidor.

## Como os DTOs participam no fluxo

```text
Cliente / worker de ingestão
  └─ JSON de pedido
       └─ Requests/*Dto
            └─ Controllers → validação e serviços
                 └─ EventRequestMapper → Models / MongoDB

MongoDB / Models
  └─ EventResponseMapper → Responses/*Dto → JSON REST
  └─ EventSchemaOrgMapper → SchemaOrg/*Dto → JSON-LD
```

Os mapeadores são deliberadamente a fronteira entre os contratos HTTP e os
modelos de domínio. Ao mudar um DTO, verifica sempre o mapeador correspondente,
as regras em `Validators` e os consumidores HTTP; não assumas que uma nova
propriedade é automaticamente persistida ou devolvida.

## Organização

| Pasta | Conteúdo | Quem a usa |
| --- | --- | --- |
| [Common](Common/README.md) | Envelopes e valores pequenos reutilizáveis. | Middleware, serviços e DTOs de resposta. |
| [Requests](Requests/README.md) | Corpos de criação/atualização e parâmetros de pesquisa. | `EventsController`, `EventsQueryController`, `PublicEventsController` e serviços. |
| [Responses](Responses/README.md) | Forma REST devolvida pelas rotas de eventos. | `EventResponseMapper` e controladores. |
| [SchemaOrg](SchemaOrg/README.md) | Forma JSON-LD baseada em Schema.org. | `GET /events/{id}/schema-org` e `EventSchemaOrgMapper`. |

## Contratos expostos atualmente

| Rota | Entrada | Saída normal |
| --- | --- | --- |
| `POST /events` | `CreateEventDto` | `DistrictEventResponseDto` (`201` quando criado, `200` quando uma ingestão é fundida). |
| `PATCH /events/{id}` | `UpdateEventDto` | `DistrictEventResponseDto`. |
| `GET /events` | — | Coleção de `EventSummaryDto`. |
| `GET /events/{id}` | Identificador MongoDB de 24 caracteres. | `DistrictEventResponseDto`. |
| `GET /events/search` | `EventQueryParameters` na *query string*. | `PagedResult<DistrictEventResponseDto>`. |
| `GET /public/events` | `EventQueryParameters` na *query string*. | `PagedResult<DistrictEventResponseDto>`; a rota força `isPublished=true`. |
| `GET /events/{id}/schema-org` | Identificador MongoDB de 24 caracteres. | `SchemaOrgEventDto` com `application/ld+json`. |

As respostas de erro dos controladores usam atualmente, na maior parte dos
casos, `{ "error": "..." }`. `ApiResultDto<T>` é usado pelo middleware para
exceções não tratadas; não pressupor que todas as respostas seguem esse
envelope.

## Convenções do contrato

| Convenção | Regra |
| --- | --- |
| Nomes JSON | ASP.NET serializa propriedades em `camelCase`; as propriedades anotadas com `JsonPropertyName` mantêm o nome explícito, por exemplo `eventStatus` e `@context`. A exceção atual é `ApiResultDto<T>` no middleware global, serializado manualmente com os nomes C# em PascalCase. |
| Enumerações | São recebidas e devolvidas como nomes das enumerações, graças a `JsonStringEnumConverter`. Consulta `Models/Entities/Enums` ou o OpenAPI para os valores permitidos. |
| Datas | Usa ISO 8601. Em `CreateEventDto`, `startDate` e `endDate` aceitam `yyyy-MM-dd` ou uma data/hora ISO com fuso explícito; o serviço normaliza-as. |
| Listas | No pedido de criação, uma lista omitida torna-se vazia. Numa atualização, uma lista presente substitui a lista existente; `[]` é portanto a forma de a limpar. |
| Atualização parcial | Em `UpdateEventDto`, propriedades ausentes e `null` não alteram o valor persistido. Para a maioria dos campos escalares, o contrato atual não permite limpar um valor enviando `null`. |

## Relação entre os formatos de evento

| Informação | Pedido (`Requests`) | REST (`Responses`) | JSON-LD (`SchemaOrg`) |
| --- | --- | --- | --- |
| Dados centrais | `CreateEventDto` / `UpdateEventDto` | `EventResponseDto` dentro de `DistrictEventResponseDto` | `SchemaOrgEventDto` |
| Local | `EventLocationRequestDto` | `EventLocationResponseDto` | `SchemaOrgPlaceDto` → `SchemaOrgAddressDto` / `SchemaOrgGeoDto` |
| Pessoas e organizações | `EventAgentRequestDto` | `EventAgentResponseDto` | `SchemaOrgAgentDto` |
| Público-alvo | `EventAudienceRequestDto` | `EventAudienceResponseDto` | `SchemaOrgAudienceDto` |
| Recorrência | `EventScheduleRequestDto` | `EventScheduleResponseDto` | `SchemaOrgScheduleDto` |
| Bilhetes/ofertas | `EventOfferRequestDto` | `EventOfferResponseDto` | `SchemaOrgOfferDto` |
| Metadados calculados | Não são enviados pelo cliente (`qualityScore`, ciclo de vida). | `qualityScore`, `isFinished`, `isPublished`, `retentionUntil`. | `qualityScore` e `physicalAccessibility` em `additionalProperty`. |

Há dois identificadores na resposta REST detalhada: `DistrictEventResponseDto.id`
identifica o documento/associação de distrito usado pelas rotas; `event.id`
identifica o evento interno. O URL JSON-LD (`@id`) é construído a partir do
primeiro.

## Ao alterar um contrato

1. Decide se a informação pertence ao pedido, à resposta REST, ao JSON-LD, ou a
   mais de um formato.
2. Altera o DTO na pasta correta e documenta o novo campo no README dessa pasta.
3. Atualiza as validações em [Validators](../Validators/EventValidator.cs) e o
   mapeador adequado em [Mappers](../Mappers), se o campo entrar ou sair do
   domínio.
4. Atualiza os testes e a [referência HTTP](../../docs/API_REFERENCE.md) quando
   o contrato público mudar.

Para a explicação das rotas, consulta também [Controllers](../Controllers/README.md).
