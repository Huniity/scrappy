# DTOs Schema.org (JSON-LD)

> Contratos semânticos usados para publicar um evento como JSON-LD compatível
> com Schema.org.

Estes DTOs são apenas de saída. A rota `GET /events/{id}/schema-org` obtém um
`DistrictEvent`, chama `EventSchemaOrgMapper.ToSchemaOrgDto(...)` e responde com
`application/ld+json`. Não reutiliza a resposta REST: aplica nomes de
propriedades Schema.org, URLs de vocabulário e formatos de data adequados a
consumidores semânticos.

## Conteúdo

| Ficheiro | Tipo declarado | Representa | Relação principal |
| --- | --- | --- | --- |
| [SchemaOrgEventDto.cs](SchemaOrgEventDto.cs) | `SchemaOrgEventDto` | Evento JSON-LD. | Raiz do documento. |
| [SchemaOrgPlaceDto.cs](SchemaOrgPlaceDto.cs) | `SchemaOrgPlaceDto` | Local Schema.org. | `event.location`. |
| [SchemaOrgAddressDto.cs](SchemaOrgAddressDto.cs) | `SchemaOrgAddressDto` | Morada postal. | `place.address`. |
| [SchemaOrgGeoDto.cs](SchemaOrgGeoDto.cs) | `SchemaOrgGeoDto` | Coordenadas geográficas. | `place.geo`. |
| [SchemaOrgAgentDto.cs](SchemaOrgAgentDto.cs) | `SchemaOrgAgentDto` | Pessoa, organização ou grupo. | Papéis como `organizer` e `performer`. |
| [SchemaOrgAudienceDto.cs](SchemaOrgAudienceDto.cs) | `SchemaOrgAudienceDto` | Público-alvo. | `event.audience`. |
| [SchemaOrgScheduleDto.cs](SchemaOrgScheduleDto.cs) | `SchemaOrgScheduleDto` | Recorrência. | `event.eventSchedule`. |
| [SchemaOrgOfferDto.cs](SchemaOrgOfferDto.cs) | `SchemaOrgOfferDto` | Oferta/bilhete. | `event.offers`. |
| [SchemaOrgPropertyValueDto.cs](SchemaOrgPropertyValueDto.cs) | `SchemaOrgPropertyValueDto` | Metadado suplementar. | `event.additionalProperty`. |

## Construção do documento

```text
DistrictEvent
  └─ EventSchemaOrgMapper.ToSchemaOrgDto(baseUrl)
       └─ SchemaOrgEventDto
            ├─ location → SchemaOrgPlaceDto
            │    ├─ address → SchemaOrgAddressDto
            │    └─ geo → SchemaOrgGeoDto
            ├─ organizer / performer / … → SchemaOrgAgentDto
            ├─ audience → SchemaOrgAudienceDto
            ├─ eventSchedule → SchemaOrgScheduleDto
            ├─ offers → SchemaOrgOfferDto
            └─ additionalProperty → SchemaOrgPropertyValueDto
```

O mapeador, e não o DTO sozinho, define o conteúdo publicado. Ao acrescentar
uma propriedade Schema.org, altera o DTO e
[EventSchemaOrgMapper](../../Mappers/EventSchemaOrgMapper.cs) em conjunto.

## `SchemaOrgEventDto`

| Propriedade JSON-LD | Tipo | Valor/mapeamento atual |
| --- | --- | --- |
| `@context` | `string` | Sempre `https://schema.org`. |
| `@type` | `string` | Sempre `Event`. |
| `@id` | `string` | `{baseUrl}/events/{DistrictEvent.id}`. |
| `additionalType` | `string` | Nome do `EventType`, por exemplo `Festival`. |
| `name`, `description`, `alternateName` | texto | Título, descrição e nome alternativo do evento. |
| `url`, `image` | `string?` | URL de origem e imagem; valores vazios são convertidos para `null` pelo mapeador. |
| `startDate`, `endDate`, `doorTime` | texto ISO 8601 | Datas em formato *round-trip* (`O`) e cultura invariável. |
| `duration` | `string?` | Duração ISO 8601 persistida. |
| `isAccessibleForFree` | `bool?` | Indicador de gratuitidade. |
| `typicalAgeRange` | `string?` | `"{ageRating}+"`, quando existe classificação etária. |
| `maximumAttendeeCapacity` | `int?` | Capacidade máxima. |
| `keywords` | `List<string>?` | Termos do evento. |
| `eventStatus` | `string` | URL Schema.org correspondente ao estado, como `https://schema.org/EventScheduled`. |
| `eventAttendanceMode` | `string?` | URL Schema.org para presencial, online ou híbrido. |
| `location` | `SchemaOrgPlaceDto?` | Local e respetiva morada/coordenadas. |
| `organizer`, `promoter`, `maintainer`, `funder`, `performer`, `actor`, `director`, `composer` | `List<SchemaOrgAgentDto>?` | Papéis de pessoas/organizações. Note que Schema.org usa o singular `performer`, enquanto o REST usa `performers`. |
| `audience` | `List<SchemaOrgAudienceDto>?` | Públicos-alvo. |
| `offers` | `List<SchemaOrgOfferDto>?` | Bilhetes/ofertas. |
| `eventSchedule` | `SchemaOrgScheduleDto?` | Recorrência. |
| `additionalProperty` | `List<SchemaOrgPropertyValueDto>` | Metadados próprios do Scrappy. |
| `owner`, `subEvent`, `superEvent` | tipos Schema.org | Estão declarados para suportar o vocabulário, mas o mapeador atual não os preenche porque o modelo não tem estas relações. |

O mapeador acrescenta sempre três entradas em `additionalProperty`:

| `name` | `value` |
| --- | --- |
| `districtName` | Nome de apresentação do distrito. |
| `qualityScore` | Pontuação formatada com cultura invariável. |
| `physicalAccessibility` | `"true"` ou `"false"`. |

`isPublished`, `isFinished` e `retentionUntil` são detalhes operacionais da
resposta REST e não são publicados neste contrato semântico.

## Objetos aninhados

### `SchemaOrgPlaceDto`, `SchemaOrgAddressDto` e `SchemaOrgGeoDto`

| DTO | Propriedades JSON-LD | Fonte no evento |
| --- | --- | --- |
| `SchemaOrgPlaceDto` | `@type` (`Place`), `name`, `address`, `url`, `sameAs`, `geo` | `EventLocation`. |
| `SchemaOrgAddressDto` | `@type` (`PostalAddress`), `streetAddress`, `postalCode`, `addressLocality`, `addressRegion`, `addressCountry`, `identifier` | Morada, localidade, nome de apresentação da região, país e DICO. |
| `SchemaOrgGeoDto` | `@type` (`GeoCoordinates`), `latitude`, `longitude` | Coordenadas; só é criado quando ambas existem. |

Na forma REST, `region` é um objeto `{ code, name }`; em JSON-LD,
`addressRegion` recebe apenas o nome de apresentação. `identifier` corresponde
ao `dicoCode`; quando este está ausente no modelo, o mapeador envia uma string
vazia.

### `SchemaOrgAgentDto`

| Propriedade JSON-LD | Tipo | Significado |
| --- | --- | --- |
| `@type` | `string` | Tipo de agente, por exemplo `Person`, `Organization` ou `MusicGroup`; predefinição `Organization`. |
| `name` | `string` | Nome do agente. |
| `url`, `sameAs` | `string?` | URL principal e identidade externa. |
| `image` | `string?` | Imagem do agente; vem de `imageUrl` no pedido/REST. |

### `SchemaOrgAudienceDto`

| Propriedade JSON-LD | Tipo | Significado |
| --- | --- | --- |
| `@type` | `string` | Sempre `Audience`. |
| `name` | `string?` | Nome livre do público. |
| `audienceType` | `string` | Categoria do público. |

### `SchemaOrgScheduleDto`

| Propriedade JSON-LD | Tipo | Mapeamento atual |
| --- | --- | --- |
| `@type` | `string` | Sempre `Schedule`. |
| `startDate`, `endDate` | `string` / `string?` | Datas no formato `yyyy-MM-dd`. |
| `startTime`, `endTime` | `string?` | Horas já validadas no pedido. |
| `scheduleTimezone` | `string` | Fuso horário, normalmente `Europe/Lisbon`. |
| `byDay` | `List<string>?` | Dias transformados em URLs, por exemplo `https://schema.org/Wednesday`. |

### `SchemaOrgOfferDto`

| Propriedade JSON-LD | Tipo | Mapeamento atual |
| --- | --- | --- |
| `@type` | `string` | Sempre `Offer`. |
| `name` | `string` | Nome da oferta. |
| `price` | `string` | Preço com duas casas decimais e ponto, por exemplo `"12.50"`. |
| `priceCurrency` | `string` | Moeda; predefinição `EUR`. |
| `availability` | `string` | URL Schema.org, por exemplo `https://schema.org/InStock`. |
| `url` | `string` | URL da oferta; o mapeador usa string vazia quando não existe. |
| `validFrom` | `string` | Data ISO 8601; o mapeador usa string vazia quando não existe. |

### `SchemaOrgPropertyValueDto`

| Propriedade JSON-LD | Tipo | Significado |
| --- | --- | --- |
| `@type` | `string` | Sempre `PropertyValue`. |
| `name` | `string` | Nome do metadado suplementar. |
| `value` | `string` | Valor textual do metadado. |

## Relação com os contratos REST

| Informação de domínio | Pedido | Resposta REST | JSON-LD |
| --- | --- | --- | --- |
| Evento | `CreateEventDto` / `UpdateEventDto` | `EventResponseDto` | `SchemaOrgEventDto` |
| Local | `EventLocationRequestDto` | `EventLocationResponseDto` | `SchemaOrgPlaceDto` + endereço/geo |
| Agente | `EventAgentRequestDto` | `EventAgentResponseDto` | `SchemaOrgAgentDto` |
| Público | `EventAudienceRequestDto` | `EventAudienceResponseDto` | `SchemaOrgAudienceDto` |
| Recorrência | `EventScheduleRequestDto` | `EventScheduleResponseDto` | `SchemaOrgScheduleDto` |
| Oferta | `EventOfferRequestDto` | `EventOfferResponseDto` | `SchemaOrgOfferDto` |

Vê [Requests](../Requests/README.md) para regras de entrada e
[Responses](../Responses/README.md) para a resposta REST. A implementação de
transformação encontra-se em [EventSchemaOrgMapper](../../Mappers/EventSchemaOrgMapper.cs).
