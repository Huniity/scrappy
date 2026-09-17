# DTOs de pedidos

> Contratos que a API recebe no corpo JSON ou na *query string*.

Estes tipos pertencem à fronteira de entrada. Receber um campo num DTO não
significa, por si só, que o valor é persistido: `EventService` valida regras de
negócio e os métodos em `EventRequestMapper` fazem a conversão para os modelos
de domínio. A visão geral dos formatos está em [DTOs](../README.md).

## Conteúdo e pontos de entrada

| Ficheiro | Tipo declarado | Como chega à API | Papel |
| --- | --- | --- | --- |
| [CreateEventDto.cs](CreateEventDto.cs) | `CreateEventDto` | Corpo de `POST /events` | Cria ou alimenta um evento. |
| [UpdateEventDto.cs](UpdateEventDto.cs) | `UpdateEventDto` | Corpo de `PATCH /events/{id}` | Atualiza parcialmente um evento existente. |
| [EventQueryDto.cs](EventQueryDto.cs) | `EventQueryParameters` | *Query string* de `GET /events/search` e `GET /public/events` | Filtra, ordena e pagina eventos. |
| [EventLocationRequestDto.cs](EventLocationRequestDto.cs) | `EventLocationRequestDto` | Propriedade `location` dos DTOs principais | Descreve local, endereço e geografia. |
| [EventAgentRequestDto.cs](EventAgentRequestDto.cs) | `EventAgentRequestDto` | Listas de papéis de um evento | Descreve pessoas ou organizações relacionadas. |
| [EventAudienceRequestDto.cs](EventAudienceRequestDto.cs) | `EventAudienceRequestDto` | Lista `audience` | Descreve o público-alvo. |
| [EventScheduleRequestDto.cs](EventScheduleRequestDto.cs) | `EventScheduleRequestDto` | Propriedade `schedule` | Descreve recorrência. |
| [EventOfferRequestDto.cs](EventOfferRequestDto.cs) | `EventOfferRequestDto` | Lista `offers` | Descreve bilhetes ou outras ofertas. |

## Regras transversais

- O ASP.NET valida os atributos de dados, mas as regras de negócio estão em
  [Validator](../../Validators/EventValidator.cs). Consulta ambos ao mudar um
  contrato.
- As enumerações são strings, como `"Festival"`, `"Faro"` ou `"PT15"`.
  Os valores válidos vivem em [Models/Entities/Enums](../../Models/Entities/Enums).
- URLs aceites pelo validador de domínio têm de ser HTTP/HTTPS absolutos e ter
  um *host* qualificado.
- Os textos são aparados (*trim*) pelo mapeador antes de persistir.
- As listas de relações admitem no máximo 50 elementos por papel; `keywords`
  admite no máximo 50 valores, cada um até 100 caracteres e sem duplicados
  depois de aparados.

## `CreateEventDto`

É o pedido de ingestão. A rota chama `EventService.AddEvent`, que infere a
geografia a partir de `location.locality`, normaliza as datas e calcula o
`qualityScore`; estes valores não são confiados ao cliente.

| Campo JSON | Tipo | Obrigatório | Notas |
| --- | --- | --- | --- |
| `title` | `string` | Sim | Entre 3 e 250 caracteres depois de aparado. |
| `description` | `string?` | Não | Se estiver ausente, vazia ou tiver menos de 10 caracteres, o serviço cria `Evento: {title}`. O resultado é limitado a 2 000 caracteres. |
| `alternateName` | `string?` | Não | Nome alternativo, até 250 caracteres. |
| `startDate` | `DateTime` | Sim | Aceita `yyyy-MM-dd` ou ISO 8601 com *offset*; uma data sem hora passa a início do dia UTC. |
| `endDate` | `DateTime?` | Não | Uma data sem hora passa a `23:59:59.9999999` UTC desse dia; não pode preceder `startDate`. |
| `doorTime` | `DateTime?` | Não | Não pode ser posterior ao início. |
| `duration` | `string?` | Não | Duração ISO 8601 válida, por exemplo `PT2H`, até 50 caracteres. |
| `type` | `EventType?` | Sim | Tipo controlado do evento. |
| `location` | `EventLocationRequestDto` | Sim | Local do evento; vê a secção própria abaixo. |
| `sourceUrl` | `string` | Sim | URL de origem. É também a primeira entrada de `sourceUrls` no modelo. |
| `imageUrl` | `string?` | Não | URL pública da imagem. |
| `isAccessibleForFree` | `bool?` | Não | Indica se não há custo de entrada. |
| `physicalAccessibility` | `bool` | Não | Por ser não anulável, omitir equivale a `false`. |
| `ageRating` | `int?` | Não | Idade mínima/recomendada, não negativa. |
| `eventAttendanceMode` | `EventAttendanceMode?` | Não | `InPerson`, `Online` ou `Hybrid`; o nome JSON é explícito. |
| `maximumAttendeeCapacity` | `int?` | Não | Capacidade, não negativa. |
| `eventStatus` | `EventStatus?` | Não | Estado do evento; se omitido, o modelo recebe `Scheduled`. |
| `keywords` | `List<string>` | Não | Lista de termos de pesquisa; por omissão é vazia. |
| `organizer`, `promoter`, `performers`, `actor`, `composer`, `director`, `maintainer`, `funder` | `List<EventAgentRequestDto>` | Não | Papéis de agentes; por omissão, cada lista é vazia. |
| `audience` | `List<EventAudienceRequestDto>` | Não | Públicos-alvo; por omissão, lista vazia. |
| `schedule` | `EventScheduleRequestDto?` | Não | Recorrência do evento. |
| `offers` | `List<EventOfferRequestDto>` | Não | Bilhetes/ofertas; por omissão, lista vazia. |

### Geografia na criação

Para criação, o cliente deve identificar a localidade e o local físico. Depois,
`GeoDataService` substitui `district`, `region` e `dicoCode` pelos valores
canónicos dessa localidade antes de validar e persistir. Portanto, esses três
campos podem constar do payload do *scraper*, mas não são a fonte de verdade em
`POST /events`.

## `UpdateEventDto`

É um contrato de `PATCH`: todas as propriedades são opcionais. Uma propriedade
ausente ou com `null` não é aplicada pelo mapeador atual; para substituir uma
lista por uma lista vazia, envia `[]`. Não há neste contrato uma forma genérica
de remover um valor escalar anulável com `null`.

| Campo JSON | Tipo | Efeito quando fornecido |
| --- | --- | --- |
| `title` | `string?` | Substitui o título; 3–250 caracteres. |
| `description` | `string?` | Substitui a descrição; 10–2 000 caracteres. Ao contrário da criação, não há texto de recurso. |
| `alternateName` | `string?` | Atualiza o nome alternativo quando não é `null`. |
| `startDate`, `endDate`, `doorTime` | `DateTime?` | Atualizam datas; início/fim voltam a ser validados e o ciclo de vida é recalculado. |
| `duration` | `string?` | Substitui a duração ISO 8601. |
| `type` | `EventType?` | Substitui o tipo e volta a calcular a qualidade. |
| `location` | `EventLocationRequestDto?` | Substitui toda a localização; deve ser um registo geográfico completo e válido. |
| `sourceUrl` | `string?` | Passa a ser a origem principal e é acrescentado a `sourceUrls` se ainda não existir. |
| `imageUrl` | `string?` | Substitui a imagem. |
| `isAccessibleForFree`, `physicalAccessibility` | `bool?` | Atualizam os indicadores de acessibilidade. |
| `ageRating`, `maximumAttendeeCapacity` | `int?` | Atualizam idade/capacidade, ambas não negativas. |
| `eventStatus` | `EventStatus?` | Atualiza o estado. |
| `eventAttendanceMode` | `EventAttendanceMode?` | Atualiza a modalidade de presença. |
| `keywords` | `List<string>?` | Substitui todos os termos; `[]` limpa-os. |
| `organizer`, `promoter`, `performers`, `actor`, `composer`, `director`, `maintainer`, `funder` | `List<EventAgentRequestDto>?` | Cada lista fornecida substitui integralmente o papel correspondente. |
| `audience` | `List<EventAudienceRequestDto>?` | Substitui os públicos-alvo. |
| `schedule` | `EventScheduleRequestDto?` | Substitui a recorrência; tem de continuar dentro do período do evento. |
| `offers` | `List<EventOfferRequestDto>?` | Substitui todas as ofertas. |
| `isPublished` | `bool?` | Atualiza a visibilidade pública do evento. |

O ficheiro de código inclui apenas DTOs; o comportamento de atualização está em
[EventService.UpdateEvent](../../Services/EventServices.cs) e
[EventRequestMapper.UpdateEntity](../../Mappers/EventRequestMapper.cs).

## `EventQueryParameters`

O ficheiro chama-se `EventQueryDto.cs`, mas a classe pública é
`EventQueryParameters`. Não é um corpo JSON: o *model binder* preenche-o a
partir da *query string*.

| Parâmetro | Tipo | Predefinição | Filtro / regra |
| --- | --- | --- | --- |
| `page` | `int` | `1` | Página, no mínimo `1`. |
| `pageSize` | `int` | `20` | Itens por página, de `1` a `100`. |
| `minQualityScore` | `decimal?` | — | Qualidade mínima, de `0` a `100`. |
| `district` | `DistrictName?` | — | Distrito do documento. |
| `locality` | `LocalityName?` | — | Localidade da localização. |
| `region` | `Nuts2Region?` | — | Região NUTS II da localização. |
| `type` | `EventType?` | — | Tipo de evento. |
| `status` | `EventStatus?` | — | Estado do evento. |
| `attendanceMode` | `EventAttendanceMode?` | — | Modalidade de presença. |
| `hasCoords` | `bool?` | — | Exige, ou exclui, locais com latitude e longitude. |
| `isAccessibleForFree` | `bool?` | — | Filtra o indicador de gratuitidade. |
| `searchTerm` | `string?` | — | Pesquisa sem distinção de maiúsculas/minúsculas em título, descrição e nome do local; máximo de 100 caracteres. |
| `startDate` | `DateTime?` | — | Início do evento igual ou posterior. |
| `endDate` | `DateTime?` | — | Início do evento igual ou anterior; não pode ser anterior a `startDate`. |
| `sortBy` | `string?` | `date_desc` | Um de `date`, `quality`, `title`, `location` ou `type`, seguido de `_asc` ou `_desc`. |
| `isPublished` | `bool?` | — | Filtra a publicação. Em `GET /public/events`, o controlador força `true`. |

Os valores de ordenação aceites são `date_asc`, `date_desc`, `quality_asc`,
`quality_desc`, `title_asc`, `title_desc`, `location_asc`, `location_desc`,
`type_asc` e `type_desc`.

## DTOs aninhados

### `EventLocationRequestDto`

| Campo JSON | Tipo | Criação | Atualização |
| --- | --- | --- | --- |
| `name` | `string` | Obrigatório; máximo 250 caracteres. | Obrigatório se `location` for enviada. |
| `postalCode`, `streetAddress` | `string?` | Opcionais. | Opcionais. |
| `locality` | `LocalityName?` | Obrigatória; determina geografia canónica. | Obrigatória. |
| `district` | `DistrictName?` | É inferido/substituído pelo serviço. | Obrigatório exceto nos casos especiais de regiões autónomas aceites pelo validador. |
| `region` | `Nuts2Region?` | É inferida/substituída pelo serviço. | Obrigatória e válida. |
| `country` | `string` | Predefinição `PT`; tem de ser `PT`. | Igual. |
| `dicoCode` | `string?` | É inferido/substituído pelo serviço. | Obrigatório; quatro algarismos. |
| `url`, `sameAs` | `string?` | URLs opcionais. | URLs opcionais. |
| `latitude`, `longitude` | `string?` | Opcionais, mas têm de existir ambas e usar ponto decimal invariável. | Ambas obrigatórias e dentro dos intervalos geográficos. |

As coordenadas são strings para acomodar a origem de *scrapers*. O mapeador usa
`CultureInfo.InvariantCulture` para as converter em `double`; usa `37.0194`, e
não `37,0194`.

### `EventAgentRequestDto`

| Campo JSON | Tipo | Regra |
| --- | --- | --- |
| `name` | `string` | Obrigatório; máximo 250 caracteres. |
| `type` | `AgentType?` | Predefinição `Organization`; tem de ser uma enumeração conhecida. |
| `url`, `sameAs`, `imageUrl` | `string?` | URLs HTTP/HTTPS opcionais. |

O mesmo DTO é reutilizado por todos os papéis de agente. O nome da propriedade
do evento dá-lhe o significado (`organizer`, `performers`, `funder`, etc.).

### `EventAudienceRequestDto`

| Campo JSON | Tipo | Regra |
| --- | --- | --- |
| `name` | `string?` | Nome livre do público, até 250 caracteres. |
| `audienceType` | `string?` | Categoria livre, até 100 caracteres. |

Cada elemento tem de ter pelo menos um dos dois valores. O DTO não restringe a
categoria a uma enumeração, porque o vocabulário de público é aberto.

### `EventScheduleRequestDto`

| Campo JSON | Tipo | Regra |
| --- | --- | --- |
| `startDate` | `DateTime` | Obrigatório e dentro do intervalo do evento. |
| `endDate` | `DateTime?` | Não pode anteceder o início da recorrência nem ultrapassar o fim do evento. |
| `startTime`, `endTime` | `string?` | Se um existir, o outro também; formato `H:mm`/`HH:mm` e fim não anterior ao início. |
| `timeZone` | `string?` | Predefinição `Europe/Lisbon`; tem de ser reconhecida por `TimeZoneInfo`. |
| `repeatDays` | `List<DayOfWeek>?` | Dias sem duplicados, como `Monday` ou `Saturday`. |

### `EventOfferRequestDto`

| Campo JSON | Tipo | Regra |
| --- | --- | --- |
| `name` | `string` | Obrigatório; máximo 250 caracteres. |
| `price` | `decimal` | Não negativo. |
| `priceCurrency` | `string` | Predefinição `EUR`; três letras ASCII. |
| `availability` | `string` | Predefinição `https://schema.org/InStock`; tem de ser uma disponibilidade Schema.org reconhecida. |
| `url` | `string?` | URL de compra/mais informação, opcional. |
| `validFrom` | `DateTime?` | Opcional; se o evento tiver fim, não pode ser posterior a esse fim. |

Uma lista de ofertas não pode ultrapassar 50 elementos nem conter duplicados
com a mesma combinação de nome, moeda, preço e `validFrom`.

## Ligações seguintes

- [EventRequestMapper](../../Mappers/EventRequestMapper.cs) transforma estes
  contratos nos modelos persistidos.
- [EventResponseMapper](../../Mappers/EventResponseMapper.cs) explica a forma
  REST de saída.
- [EventSchemaOrgMapper](../../Mappers/EventSchemaOrgMapper.cs) produz a forma
  semântica JSON-LD.
