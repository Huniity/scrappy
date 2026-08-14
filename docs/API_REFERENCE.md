# Scrappy API Reference

Scrappy stores and searches events collected from Portuguese municipalities. The API uses JSON for its current CRUD and search endpoints. A Schema.org JSON-LD representation is defined later in this document as the interoperability contract.

## Status and base URLs

The routes below describe the current implementation in `Scrappy/Controllers`.

| Environment | Base URL |
| --- | --- |
| Local HTTP | `http://localhost:5275` |
| Local HTTPS | `https://localhost:7120` |

There is currently no `/api/v1` route prefix. If versioning is introduced, this document and the controllers must be changed together.

In Development, generated OpenAPI documentation is available at:

- OpenAPI document: `GET /openapi/v1.json`
- Swagger UI: `GET /swagger`

## Conventions

- Request and response bodies use `application/json` unless stated otherwise.
- Property names use JSON camel case.
- Dates and times use ISO 8601, preferably including an explicit UTC offset, for example `2026-07-15T21:00:00Z`.
- Calendar dates in schedules use `YYYY-MM-DD`.
- Schedule times use 24-hour `HH:mm` format.
- Event IDs are 24-character MongoDB ObjectId strings.
- Enum values are serialized as their case-sensitive C# names, for example `Festival`, `Faro`, and `PT15`.
- Authentication and authorization are not currently implemented.
- Error responses currently use `{ "error": "message" }`; RFC 7807 is not consistently implemented.

## Endpoint summary

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/events` | Return all events |
| `POST` | `/events` | Create an event |
| `GET` | `/events/search` | Search, filter, sort, and paginate events |
| `GET` | `/events/{id}` | Return one event |
| `PATCH` | `/events/{id}` | Partially update an event |
| `DELETE` | `/events/{id}` | Delete and return an event |

## Event request contract

### CreateEvent

The following is a complete creation request. Fields marked as required must be present and valid.

```json
{
  "title": "Festival de Jazz de Loulé",
  "description": "Edição anual do festival de jazz ao ar livre no centro histórico de Loulé.",
  "alternateName": "Loulé Jazz Festival",
  "startDate": "2026-07-15T21:00:00Z",
  "endDate": "2026-07-15T23:30:00Z",
  "doorTime": "2026-07-15T20:30:00Z",
  "type": "Festival",
  "location": {
    "name": "Cerca do Convento",
    "locality": "Loulé",
    "district": "Faro",
    "region": "PT15",
    "country": "PT",
    "dicoCode": "0808",
    "latitude": "37.1378",
    "longitude": "-8.0201"
  },
  "sourceUrl": "https://cm-loule.pt/eventos/jazz-2026",
  "imageUrl": "https://cm-loule.pt/images/jazz-2026.jpg",
  "isAccessibleForFree": false,
  "physicalAccessibility": true,
  "ageRating": 12,
  "maximumAttendeeCapacity": 800,
  "keywords": ["jazz", "música", "Loulé"],
  "organizer": {
    "name": "Câmara Municipal de Loulé",
    "type": "Organization",
    "url": "https://cm-loule.pt",
    "sameAs": "https://www.wikidata.org/entity/Q1012440"
  },
  "promoter": {
    "name": "Associação Cultural de Loulé",
    "type": "Organization",
    "url": "https://example.org/promotor",
    "sameAs": null
  },
  "performers": [
    {
      "name": "Quarteto Atlântico",
      "type": "MusicGroup",
      "url": "https://example.org/quarteto-atlantico",
      "sameAs": null
    }
  ],
  "schedule": {
    "startDate": "2026-07-15",
    "endDate": "2026-07-17",
    "startTime": "21:00",
    "endTime": "23:30",
    "timeZone": "Europe/Lisbon",
    "repeatDays": ["Wednesday", "Thursday", "Friday"]
  }
}
```

| Field | Type | Required | Validation / meaning |
| --- | --- | --- | --- |
| `title` | string | yes | 3–250 characters after trimming; currently must also be globally unique, case-insensitively |
| `description` | string | yes | 10–2,000 characters after trimming |
| `alternateName` | string or null | no | Alternative event name |
| `startDate` | date-time | yes | Must not be the default date |
| `endDate` | date-time or null | no | Must be equal to or later than `startDate` |
| `doorTime` | date-time or null | no | Door opening time |
| `type` | EventType | yes | Controlled value listed below |
| `location` | Location | yes | `name`, `locality`, and `district` are required |
| `sourceUrl` | URI | yes | Absolute HTTP or HTTPS URL with a qualified host |
| `imageUrl` | URI string or null | no | Event image |
| `isAccessibleForFree` | boolean | no | Defaults to `false` |
| `physicalAccessibility` | boolean | no | Defaults to `false` |
| `ageRating` | integer or null | no | Minimum recommended age |
| `maximumAttendeeCapacity` | integer or null | no | Maximum capacity |
| `keywords` | string array | no | Defaults to an empty array |
| `organizer` | Agent or null | no | Event organizer |
| `promoter` | Agent or null | no | Event promoter |
| `performers` | Agent array | no | Defaults to an empty array |
| `schedule` | Schedule or null | no | Recurrence information |

Location coordinates are strings in the request contract and are parsed using invariant-culture decimal notation. An invalid coordinate currently becomes `null` instead of producing a validation error.

> Implementation note: the current create/update service persists the core event fields, location, organizer, promoter, performers, and schedule. Although the DTO accepts `alternateName`, `doorTime`, `imageUrl`, accessibility fields, age rating, capacity, and keywords, those values are not yet mapped by `EventService` and may be returned as defaults. This is a known implementation gap.

### Agent

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | Agent name |
| `type` | AgentType or null | no | Defaults to `Organization` |
| `url` | URI string or null | no | Primary URL |
| `sameAs` | URI string or null | no | Canonical external identity |

### Schedule

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `startDate` | date-time | yes | First date in the schedule |
| `endDate` | date-time or null | no | Last date in the schedule |
| `startTime` | string or null | no | `HH:mm` |
| `endTime` | string or null | no | `HH:mm` |
| `timeZone` | string or null | no | Defaults to `Europe/Lisbon` |
| `repeatDays` | DayOfWeek array or null | no | `Sunday` through `Saturday` |

## Endpoints

### Create an event

```http
POST /events
Content-Type: application/json
```

Use the complete `CreateEvent` body above.

Responses:

- `201 Created` — event created; `Location` points to `/events/{id}`.
- `400 Bad Request` — invalid domain data, duplicate title, or duplicate district/title/start-date combination.
- `422 Unprocessable Entity` — application validation exception.
- `500 Internal Server Error` — unexpected persistence or server failure.

### List all events

```http
GET /events
Accept: application/json
```

Returns `200 OK` with an unpaginated array of stored `DistrictEvent` objects. Prefer `/events/search` for client-facing lists and large collections.

### Search events

```http
GET /events/search?district=Faro&type=Festival&minQualityScore=75&page=1&pageSize=20&sortBy=date_asc
Accept: application/json
```

| Query parameter | Type | Default | Behavior |
| --- | --- | --- | --- |
| `district` | DistrictName | — | Filters by district |
| `type` | EventType | — | Filters by event type |
| `minQualityScore` | decimal | — | Inclusive range `0`–`100` |
| `searchTerm` | string | — | Case-insensitive search in title, description, and venue name |
| `startDate` | date-time | — | Event start must be on or after this value |
| `endDate` | date-time | — | Event start must be on or before this value |
| `page` | integer | `1` | Values below 1 are normalized to 1 |
| `pageSize` | integer | `20` | Clamped to `1`–`100` |
| `sortBy` | string | `date_desc` | See sorting values below |
| `locality` | LocalityName | — | Accepted by binding but not currently applied by the query service |
| `region` | Nuts2Region | — | Accepted by binding but not currently applied |
| `status` | EventStatus | — | Accepted by binding but not currently applied |
| `attendanceMode` | EventAttendanceMode | — | Accepted by binding but not currently applied |

Supported sorting values are `date_asc`, `date_desc`, `quality_asc`, `quality_desc`, `title_asc`, `title_desc`, `location_asc`, `location_desc`, `type_asc`, and `type_desc`. Unknown values currently fall back to date ascending, despite the DTO default being `date_desc`.

Example response shape:

```json
{
  "items": [
    {
      "id": "66b8d9e2f332d8a912345678",
      "district": "Faro",
      "event": {
        "id": "66b8d9e2f332d8a987654321",
        "title": "Festival de Jazz de Loulé",
        "description": "Edição anual do festival de jazz ao ar livre no centro histórico de Loulé.",
        "startDate": "2026-07-15T21:00:00Z",
        "endDate": "2026-07-15T23:30:00Z",
        "location": {
          "name": "Cerca do Convento",
          "locality": "Loulé",
          "district": "Faro",
          "region": "PT15",
          "country": "PT",
          "dicoCode": "0808",
          "latitude": 37.1378,
          "longitude": -8.0201
        },
        "sourceUrl": "https://cm-loule.pt/eventos/jazz-2026",
        "type": "Festival",
        "qualityScore": 100,
        "status": "Scheduled",
        "performers": [],
        "keywords": []
      }
    }
  ],
  "totalCount": 1,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

Responses:

- `200 OK` — paginated results.
- `400 Bad Request` — invalid enum binding, score outside `0`–`100`, or `startDate` later than `endDate`.
- `500 Internal Server Error` — unexpected query failure.

### Get an event

```http
GET /events/66b8d9e2f332d8a912345678
Accept: application/json
```

Responses:

- `200 OK` — stored `DistrictEvent` object.
- `400 Bad Request` — ID is not a 24-character ObjectId.
- `404 Not Found` — no event has the supplied ID.

The controller currently returns JSON regardless of `Accept: application/ld+json`. The JSON-LD contract below is implemented by `EventSchemaOrgMapper` but is not yet connected to an endpoint or content negotiation.

### Update an event

```http
PATCH /events/66b8d9e2f332d8a912345678
Content-Type: application/json
```

All `UpdateEvent` properties are optional and use the same shapes as `CreateEvent`. Example:

```json
{
  "title": "Festival de Jazz de Loulé 2026",
  "endDate": "2026-07-16T00:00:00Z",
  "location": {
    "name": "Cerca do Convento",
    "locality": "Loulé",
    "district": "Faro",
    "region": "PT15",
    "country": "PT",
    "dicoCode": "0808",
    "latitude": "37.1378",
    "longitude": "-8.0201"
  }
}
```

Responses:

- `200 OK` — updated stored event.
- `400 Bad Request` — malformed ID or invalid update.
- `404 Not Found` — event does not exist.
- `422 Unprocessable Entity` — application validation exception.
- `500 Internal Server Error` — unexpected persistence or server failure.

### Delete an event

```http
DELETE /events/66b8d9e2f332d8a912345678
```

Responses:

- `200 OK` — deleted event object.
- `400 Bad Request` — malformed ID.
- `404 Not Found` — event does not exist.

## Controlled values

### EventType

`Concerto`, `Feira`, `Mercado`, `FestaPopular`, `Teatro`, `Festival`, `Exposição`, `Cinema`, `Desporto`, `Gastronomia`, `Workshop`, `Conferência`, `Infantil`, `Business`, `Moda`, `Educativo`, `Património`, `Social`, `Cultural`, `Hackaton`, `Outro`

### DistrictName

`Aveiro`, `Beja`, `Braga`, `Bragança`, `CasteloBranco`, `Coimbra`, `Évora`, `Faro`, `Guarda`, `Leiria`, `Lisboa`, `Portalegre`, `Porto`, `Santarém`, `Setúbal`, `VianaDoCastelo`, `VilaReal`, `Viseu`

### Nuts2Region

`PT11` (Norte), `PT16` (Centro), `PT1A` (Grande Lisboa), `PT1B` (Península de Setúbal), `PT1C` (Oeste e Vale do Tejo), `PT18` (Alentejo), `PT15` (Algarve), `PT20` (Região Autónoma dos Açores), `PT30` (Região Autónoma da Madeira)

### EventStatus

`Scheduled`, `Cancelled`, `Postponed`, `Rescheduled`, `Completed`

### AgentType

`Person`, `Organization`, `Gov`, `Company`, `MusicGroup`, `PerformingGroup`, `Other`

### EventAttendanceMode

`InPerson`, `Online`, `Hybrid`

`LocalityName` contains Portuguese municipality enum names. Consult the generated OpenAPI schema for the complete current list; names containing spaces generally use PascalCase, such as `VilaReal`, while many names preserve Portuguese diacritics, such as `Loulé`.

## Schema.org JSON-LD interoperability contract

The intended media type is `application/ld+json`. A future content-negotiated response may use:

```http
GET /events/66b8d9e2f332d8a912345678
Accept: application/ld+json
```

The complete JSON-LD representation supported by the current DTO model is shown below. Nullable properties should ideally be omitted when they have no value; the current global serializer does not configure null omission, so wiring the endpoint may initially emit them as `null`.

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "@id": "https://api.scrappy.pt/events/66b8d9e2f332d8a912345678",
  "name": "Festival de Jazz de Loulé",
  "description": "Edição anual do festival de jazz ao ar livre no centro histórico de Loulé.",
  "alternateName": "Loulé Jazz Festival",
  "additionalType": "https://schema.org/MusicEvent",
  "url": "https://cm-loule.pt/eventos/jazz-2026",
  "image": "https://cm-loule.pt/images/jazz-2026.jpg",
  "startDate": "2026-07-15T21:00:00.0000000Z",
  "endDate": "2026-07-15T23:30:00.0000000Z",
  "doorTime": "2026-07-15T20:30:00.0000000Z",
  "duration": "PT2H30M",
  "category": "Festival",
  "isAccessibleForFree": false,
  "offers": [
    {
      "@type": "Offer",
      "name": "Bilhete geral",
      "price": "15.00",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://example.org/bilhetes/jazz-2026",
      "validFrom": "2026-05-01T09:00:00Z"
    }
  ],
  "typicalAgeRange": "12+",
  "maximumAttendeeCapacity": 800,
  "keywords": ["jazz", "música", "Loulé"],
  "eventStatus": "https://schema.org/EventScheduled",
  "location": {
    "@type": "Place",
    "name": "Cerca do Convento",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Loulé",
      "addressRegion": "Algarve",
      "addressCountry": "PT",
      "identifier": "0808"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 37.1378,
      "longitude": -8.0201
    }
  },
  "owner": {
    "@type": "Organization",
    "name": "Scrappy",
    "url": "https://scrappy.pt",
    "sameAs": null
  },
  "organizer": {
    "@type": "Organization",
    "name": "Câmara Municipal de Loulé",
    "url": "https://cm-loule.pt",
    "sameAs": "https://www.wikidata.org/entity/Q1012440"
  },
  "promoter": {
    "@type": "Organization",
    "name": "Associação Cultural de Loulé",
    "url": "https://example.org/promotor",
    "sameAs": null
  },
  "funder": [
    {
      "@type": "Organization",
      "name": "Município de Loulé",
      "url": "https://cm-loule.pt",
      "sameAs": null
    }
  ],
  "performer": [
    {
      "@type": "MusicGroup",
      "name": "Quarteto Atlântico",
      "url": "https://example.org/quarteto-atlantico",
      "sameAs": null
    }
  ],
  "actor": [
    {
      "@type": "Person",
      "name": "Maria Santos",
      "url": null,
      "sameAs": null
    }
  ],
  "director": {
    "@type": "Person",
    "name": "Carlos Oliveira",
    "url": null,
    "sameAs": null
  },
  "composer": {
    "@type": "Person",
    "name": "Ana Costa",
    "url": null,
    "sameAs": null
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "General"
  },
  "eventSchedule": {
    "@type": "Schedule",
    "startDate": "2026-07-15",
    "endDate": "2026-07-17",
    "startTime": "21:00",
    "endTime": "23:30",
    "scheduleTimezone": "Europe/Lisbon",
    "byDay": [
      "https://schema.org/Wednesday",
      "https://schema.org/Thursday",
      "https://schema.org/Friday"
    ]
  },
  "subEvent": [
    {
      "@context": "https://schema.org",
      "@type": "Event",
      "@id": "https://api.scrappy.pt/events/66b8d9e2f332d8a912345678/opening",
      "name": "Concerto de abertura",
      "description": "Sessão de abertura do festival.",
      "alternateName": null,
      "additionalType": "https://schema.org/MusicEvent",
      "url": "https://cm-loule.pt/eventos/jazz-2026#abertura",
      "image": null,
      "startDate": "2026-07-15T21:00:00Z",
      "endDate": "2026-07-15T22:00:00Z",
      "doorTime": null,
      "duration": "PT1H",
      "category": "Concerto",
      "isAccessibleForFree": false,
      "offers": null,
      "typicalAgeRange": "12+",
      "maximumAttendeeCapacity": 800,
      "keywords": ["jazz"],
      "eventStatus": "https://schema.org/EventScheduled",
      "location": {
        "@type": "Place",
        "name": "Cerca do Convento",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Loulé",
          "addressRegion": "Algarve",
          "addressCountry": "PT",
          "identifier": "0808"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 37.1378,
          "longitude": -8.0201
        }
      },
      "owner": null,
      "organizer": null,
      "promoter": null,
      "funder": null,
      "performer": null,
      "actor": null,
      "director": null,
      "composer": null,
      "audience": null,
      "eventSchedule": null,
      "subEvent": null,
      "superEvent": null,
      "additionalProperty": []
    }
  ],
  "superEvent": null,
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "districtName",
      "value": "Faro"
    },
    {
      "@type": "PropertyValue",
      "name": "qualityScore",
      "value": "100"
    },
    {
      "@type": "PropertyValue",
      "name": "physicalAccessibility",
      "value": "true"
    }
  ]
}
```

The current mapper populates the core identity, dates, category, accessibility, capacity, keywords, status, location, organizer, promoter, performers, schedule, and three `additionalProperty` values. `additionalType`, `offers`, `owner`, `funder`, `actor`, `director`, `composer`, `audience`, `subEvent`, and `superEvent` exist in the DTO but are not currently populated from the stored event model. Offer mapping is also behind the `OFFER_MODEL_AVAILABLE` compilation symbol.

## Quality score

The API calculates `qualityScore` from four equally weighted checks:

- description contains at least 50 characters: 25 points;
- start date is present: 25 points;
- venue name is present: 25 points;
- event type is a defined enum value: 25 points.

The resulting score is between `0` and `100`.

## Known API contract gaps

These items should be resolved before treating the API as a stable public v1 contract:

1. Add an explicit version prefix if `/api/v1` is required.
2. Map every accepted create/update property into the stored event.
3. Return response DTOs rather than raw persistence entities.
4. Connect `EventSchemaOrgMapper` to `GET /events/{id}` content negotiation or add a dedicated JSON-LD route.
5. Return `Content-Type: application/ld+json` for JSON-LD.
6. Apply or remove the currently ignored locality, region, status, and attendance-mode filters.
7. Standardize errors, preferably as RFC 7807 `application/problem+json`.
8. Add authentication/authorization for create, update, and delete operations.
