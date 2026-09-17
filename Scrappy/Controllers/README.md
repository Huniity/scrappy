# Controllers

> Adaptadores HTTP da API: recebem pedidos, chamam a camada de serviços e
> devolvem a resposta HTTP e o DTO adequados.

Esta pasta define os endpoints REST que expõem eventos, pesquisa pública e
redirecionamentos para agendas municipais. Um controlador não deve aceder
diretamente ao MongoDB nem concentrar regras de negócio: essa responsabilidade
pertence aos serviços em `Services/`. Os webhooks têm um fluxo próprio e estão
documentados em [Webhooks](Webhooks/README.md).

## Conteúdo atual

| Ficheiro | Responsabilidade |
| --- | --- |
| [EventsController.cs](EventsController.cs) | Cria, lê, atualiza e elimina eventos; também expõe a representação Schema.org de um evento. |
| [EventsQueryController.cs](EventsQueryController.cs) | Pesquisa paginada de eventos para consumidores que podem definir todos os filtros. |
| [PublicEventsController.cs](PublicEventsController.cs) | Pesquisa paginada para a agenda pública, limitada a eventos publicados. |
| [MunicipalityRedirectController.cs](MunicipalityRedirectController.cs) | Redireciona um slug de município para a respetiva agenda oficial configurada. |
| [Webhooks/](Webhooks/) | Endpoints recebidos de serviços externos; não fazem parte dos endpoints REST descritos neste documento. |

## Endpoints

As rotas não têm o prefixo `/api`. Os IDs de evento nas rotas abaixo são IDs
MongoDB de 24 caracteres; depois da restrição da rota, o controlador confirma
que são `ObjectId` válidos.

| Controlador | Método e rota | Finalidade |
| --- | --- | --- |
| `EventsController` | `GET /events` | Devolve todos os eventos como `EventSummaryDto`; é uma lista simples, sem paginação. |
| `EventsController` | `GET /events/{id}` | Devolve o detalhe de um evento como `DistrictEventResponseDto`. |
| `EventsController` | `GET /events/{id}/schema-org` | Devolve o mesmo evento em JSON-LD Schema.org (`application/ld+json`) para interoperabilidade. |
| `EventsController` | `POST /events` | Recebe `CreateEventDto`, cria ou atualiza por deduplicação um evento e devolve o detalhe persistido. |
| `EventsController` | `PATCH /events/{id}` | Recebe `UpdateEventDto` e altera apenas os campos fornecidos. |
| `EventsController` | `DELETE /events/{id}` | Elimina o evento e devolve o detalhe que foi removido. |
| `EventsQueryController` | `GET /events/search` | Pesquisa paginada com `EventQueryParameters`; permite filtros de território, data, tipo, estado, publicação, texto e ordenação. |
| `PublicEventsController` | `GET /public/events` | Usa os mesmos filtros e paginação de `/events/search`, mas força `isPublished=true`. |
| `MunicipalityRedirectController` | `GET /municipio/{localitySlug}` | Redireciona (`302`) um slug canónico para a agenda oficial configurada. |
| `MunicipalityRedirectController` | `GET /municipios/{localitySlug}` | Alias plural da rota anterior, necessário para URLs já distribuídos, incluindo botões WhatsApp. |

### Pesquisa e paginação

`/events/search` e `/public/events` recebem os valores de
`EventQueryParameters` na query string. Os valores mais usados são:

```text
GET /public/events?locality=Faro&startDate=2026-09-17&page=1&pageSize=20&sortBy=date_asc
```

| Parâmetro | Regra atual |
| --- | --- |
| `page` | Começa em `1`; o valor predefinido é `1`. |
| `pageSize` | Entre `1` e `100`; o valor predefinido é `20`. |
| `sortBy` | `date`, `quality`, `title`, `location` ou `type`, seguidos de `_asc` ou `_desc`; por omissão é `date_desc`. |
| Filtros | `district`, `locality`, `region`, `type`, `status`, `attendanceMode`, `hasCoords`, `isAccessibleForFree`, `minQualityScore`, `searchTerm`, `startDate`, `endDate` e `isPublished`. |

As respostas de pesquisa são um `PagedResult<DistrictEventResponseDto>` com
`items`, `totalCount`, `page` e `pageSize`. Embora o chamador possa enviar
`isPublished` em `/public/events`, esse valor é sempre substituído por `true`
antes da consulta.

## Fluxos principais

```text
POST/PATCH/DELETE /events
  └─ EventsController
       └─ EventService
            ├─ valida, normaliza e deduplica
            ├─ infere dados geográficos quando cria um evento
            └─ MongoDB
       └─ EventResponseMapper → DTO HTTP

GET /events/search ou /public/events
  └─ EventsQueryController ou PublicEventsController
       └─ EventQueryService
            ├─ valida filtros, paginação e ordenação
            └─ MongoDB
       └─ EventResponseMapper → resultado paginado HTTP

GET /municipio(s)/{localitySlug}
  └─ MunicipalityRedirectController
       └─ MunicipalityCatalog → municipalities.json
       └─ 302 para o WebsiteUrl oficial
```

O `POST /events` é idempotente ao nível da deduplicação. Além do corpo de
resposta, indica o resultado da ingestão no cabeçalho `X-Ingestion-Action`
(`created`, `merged` ou `skipped`); quando aplicável, o cabeçalho
`X-Ingestion-Updated-Fields` enumera os campos atualizados. Uma criação nova
devolve `201 Created`; um evento unido ou já existente devolve `200 OK`.

## Convenções e respostas de erro

- Os controladores recebem contratos em `DTOs/Requests`, passam o trabalho aos
  serviços e convertem entidades em contratos de resposta através de
  `Mappers/`. Não exponhas entidades MongoDB diretamente num endpoint novo.
- Os enums são serializados como texto em JSON, configuração aplicada a todos
  os controladores no arranque da API.
- Pedidos de pesquisa inválidos, IDs inválidos e falhas de validação esperadas
  devolvem normalmente `400 Bad Request`. Um evento ou município inexistente
  devolve `404 Not Found`.
- `POST /events` e `PATCH /events/{id}` devolvem `422 Unprocessable Entity`
  quando a validação de domínio lança `ValidationException`; erros inesperados
  são registados e devolvem `500 Internal Server Error`.
- O redirecionamento de município depende do catálogo em
  [Configuration/municipalities.json](../Configuration/municipalities.json).
  Um slug não configurado devolve `404`, em vez de redirecionar para um URL
  arbitrário.

## Ao adicionar ou alterar um endpoint

1. Define ou reutiliza um DTO em `DTOs/`; não uses a entidade de persistência
   como contrato HTTP.
2. Coloca a validação, consulta à base de dados e regras de negócio num serviço.
3. Mantém o controlador fino: faz o *binding*, chama o serviço, mapeia o
   resultado e escolhe o código HTTP.
4. Acrescenta testes de sucesso e de falha em `Scrappy.Tests/` e atualiza este
   documento com a rota e o contrato público.

Código relacionado:

- [EventService](../Services/EventServices.cs)
- [EventQueryService](../Services/EventQueryService.cs)
- [MunicipalityCatalog](../Services/MunicipalityCatalog.cs)
- [Event response mappers](../Mappers/EventResponseMapper.cs)
- [Contratos HTTP](../DTOs/)
