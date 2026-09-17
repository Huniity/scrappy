# DTOs de respostas REST

> Forma JSON que as rotas de eventos devolvem aos clientes REST.

Estes tipos são construídos a partir de `DistrictEvent` por
[EventResponseMapper](../../Mappers/EventResponseMapper.cs). Não expõem o
documento MongoDB diretamente e não são o formato semântico JSON-LD; para esse
caso existe [SchemaOrg](../SchemaOrg/README.md).

## Conteúdo e utilização

| Ficheiro | Tipo declarado | Papel | Rotas que o devolvem |
| --- | --- | --- | --- |
| [DistrictEventResponseDto.cs](DistrictEventResponseDto.cs) | `DistrictEventResponseDto` | Envelope do documento de distrito com o evento detalhado. | `POST`, `PATCH`, `GET /events/{id}`, `DELETE /events/{id}` e resultados de pesquisa. |
| [EventResponseDto.cs](EventResponseDto.cs) | `EventResponseDto` | Representação REST completa do evento. | Propriedade `event` do envelope. |
| [EventSummaryDto.cs](EventSummaryDto.cs) | `EventSummaryDto` | Projeção curta para listas. | `GET /events`. |
| [EventLocationResponseDto.cs](EventLocationResponseDto.cs) | `EventLocationResponseDto` | Localização REST normalizada. | `event.location`. |
| [EventAgentResponseDto.cs](EventAgentResponseDto.cs) | `EventAgentResponseDto` | Pessoa/organização associada. | Listas de papéis em `event`. |
| [EventAudienceResponse.Dto.cs](EventAudienceResponse.Dto.cs) | `EventAudienceResponseDto` | Público-alvo. | `event.audience`. |
| [EventScheduleResponseDto.cs](EventScheduleResponseDto.cs) | `EventScheduleResponseDto` | Recorrência. | `event.schedule`. |
| [EventOfferResponseDto.cs](EventOfferResponseDto.cs) | `EventOfferResponseDto` | Bilhete ou oferta. | `event.offers`. |

As propriedades JSON usam `camelCase`. Tipos enum são convertidos em strings;
por exemplo, `type`, `status` e `attendanceMode` usam os nomes das enumerações.

## Envelope e identificadores

### `DistrictEventResponseDto`

| Campo JSON | Tipo | Significado |
| --- | --- | --- |
| `id` | `string` | Identificador do documento `DistrictEvent`; é o ID usado nas rotas `/events/{id}`. |
| `district` | `string` | Nome de apresentação do distrito associado, por exemplo `"Faro"`. |
| `event` | `EventResponseDto` | Dados completos do evento. |

O `event.id` aninhado é um identificador interno do evento e é diferente do
`id` exterior. Não troques os dois ao construir URLs: a rota e o `@id` JSON-LD
usam o identificador exterior.

### `EventResponseDto`

| Campo JSON | Tipo | Origem / significado |
| --- | --- | --- |
| `id` | `string` | Identificador do modelo interno de evento. |
| `title`, `description`, `alternateName` | texto | Dados editoriais do evento. `description` sai como string vazia se não estiver persistida. |
| `sourceUrl` | `string?` | Origem principal atual. |
| `sourceUrls` | `List<string>` | Todas as origens acumuladas durante atualizações/ingestões. |
| `imageUrl` | `string?` | Imagem do evento. |
| `startDate`, `endDate` | data/hora | Período normalizado do evento. |
| `duration` | `string?` | Duração ISO 8601, quando conhecida. |
| `qualityScore` | `double` | Pontuação calculada pelo servidor. |
| `type`, `status` | `string` | Nomes das enumerações de tipo e estado. |
| `isFinished` | `bool` | Calculado pelo ciclo de vida do evento. |
| `isPublished` | `bool` | Visibilidade pública atual. |
| `retentionUntil` | `DateTime?` | Data até à qual um evento terminado deve ser retido. |
| `location` | `EventLocationResponseDto?` | Localização normalizada. |
| `isAccessibleForFree` | `bool?` | Indicador de gratuitidade. |
| `physicalAccessibility` | `bool` | Indicador de acessibilidade física. |
| `ageRating` | `int?` | Idade recomendada/mínima. |
| `maximumAttendeeCapacity` | `int?` | Capacidade máxima. |
| `keywords` | `List<string>` | Termos associados. |
| `organizer`, `promoter`, `performers`, `actor`, `composer`, `director`, `maintainer`, `funder` | `List<EventAgentResponseDto>` | Agentes, separados pelo respetivo papel. |
| `audience` | `List<EventAudienceResponseDto>` | Públicos-alvo. |
| `attendanceMode` | `string?` | Modalidade `InPerson`, `Online` ou `Hybrid`. |
| `schedule` | `EventScheduleResponseDto?` | Recorrência. |
| `offers` | `List<EventOfferResponseDto>` | Bilhetes/ofertas. |

`doorTime` existe no pedido e no modelo, mas não é atualmente projetado por
`EventResponseMapper` para esta resposta REST. É, no entanto, projetado na
representação Schema.org. Esta assimetria é intencionalmente registada aqui para
que uma alteração ao contrato seja feita no mapeador, e não apenas no DTO.

## Projeção curta

### `EventSummaryDto`

| Campo JSON | Tipo | Significado |
| --- | --- | --- |
| `id` | `string` | ID exterior do `DistrictEvent`, adequado para chamar `/events/{id}`. |
| `title` | `string` | Título do evento. |
| `imageUrl` | `string?` | Imagem, se existir. |
| `startDate` | `DateTime` | Início. |
| `type` | `string` | Tipo do evento. |
| `locality`, `district` | `string` | Nomes de apresentação da localização. |
| `qualityScore` | `double` | Pontuação calculada. |
| `isAccessibleForFree` | `bool?` | Indicador de gratuitidade. |
| `isPublished`, `isFinished` | `bool` | Estado de visibilidade e ciclo de vida. |

`GET /events` devolve uma coleção não paginada destes resumos. O mapeador
também possui `ToSummaryPagedResult`, mas as pesquisas atuais devolvem a forma
detalhada `PagedResult<DistrictEventResponseDto>`.

## DTOs aninhados

### `EventLocationResponseDto`

| Campo JSON | Tipo | Diferença face ao pedido |
| --- | --- | --- |
| `name`, `streetAddress`, `postalCode` | texto | Nome e morada do local. |
| `locality`, `district` | `string` | São nomes de apresentação, não valores enum. |
| `region` | `CodeNameDto` | Expõe simultaneamente `code` (por exemplo `PT15`) e `name` (por exemplo `Algarve`). |
| `country` | `string` | País persistido; normal é `PT`. |
| `dicoCode` | `string?` | Código DICO canónico. |
| `url`, `sameAs` | `string?` | Identificadores/URLs externos do local. |
| `latitude`, `longitude` | `double?` | Ao contrário do pedido, são números já analisados. |

### `EventAgentResponseDto`

| Campo JSON | Tipo | Significado |
| --- | --- | --- |
| `name` | `string` | Nome da pessoa ou organização. |
| `type` | `string` | Nome da enumeração `AgentType`, por exemplo `Organization`. |
| `url`, `sameAs`, `imageUrl` | `string?` | URLs externas e imagem, quando conhecidas. |

### `EventAudienceResponseDto`

| Campo JSON | Tipo | Significado |
| --- | --- | --- |
| `name` | `string?` | Nome livre do público-alvo. |
| `audienceType` | `string?` | Categoria livre do público. |

O nome do ficheiro contém `Response.Dto`, mas o tipo público é
`EventAudienceResponseDto`.

### `EventScheduleResponseDto`

| Campo JSON | Tipo | Significado |
| --- | --- | --- |
| `startDate`, `endDate` | data/hora | Período da recorrência. |
| `startTime`, `endTime` | `string?` | Horas no formato `HH:mm`, quando aplicável. |
| `timeZone` | `string` | Fuso horário, por omissão `Europe/Lisbon`. |
| `repeatDays` | `List<string>?` | Nomes de `DayOfWeek`, por exemplo `Monday`. |

### `EventOfferResponseDto`

| Campo JSON | Tipo | Significado |
| --- | --- | --- |
| `name` | `string` | Nome da oferta, por exemplo o tipo de bilhete. |
| `price` | `decimal` | Preço numérico. |
| `priceCurrency` | `string` | Moeda de três letras, normalmente `EUR`. |
| `availability` | `string` | URL Schema.org de disponibilidade. |
| `url` | `string?` | URL de compra ou informação. |
| `validFrom` | `DateTime?` | Data a partir da qual a oferta é válida. |

## Relação com outros contratos

| Informação | Entrada | REST | Schema.org |
| --- | --- | --- | --- |
| Evento | `CreateEventDto` / `UpdateEventDto` | `EventResponseDto` | `SchemaOrgEventDto` |
| Local | `EventLocationRequestDto` | `EventLocationResponseDto` | `SchemaOrgPlaceDto` |
| Agente | `EventAgentRequestDto` | `EventAgentResponseDto` | `SchemaOrgAgentDto` |
| Público | `EventAudienceRequestDto` | `EventAudienceResponseDto` | `SchemaOrgAudienceDto` |
| Agenda | `EventScheduleRequestDto` | `EventScheduleResponseDto` | `SchemaOrgScheduleDto` |
| Oferta | `EventOfferRequestDto` | `EventOfferResponseDto` | `SchemaOrgOfferDto` |

Para respostas de pesquisa, `PagedResult<T>` está documentado em
[Common](../Common/README.md). Para a forma JSON-LD, segue para
[SchemaOrg](../SchemaOrg/README.md).
