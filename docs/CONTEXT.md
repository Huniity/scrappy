# Scrappy — Working Context

**Purpose:** the first file to read at the start of a session (human, Claude, or Codex).
It records the *actual current state* of the repo, who owns what, the contracts that
must not drift, and the open decisions. Append to the Session Log at the end of each session.

Last updated: 2026-08-20

---

## 1. What we are building

Portuguese municipalities need an event agenda they can populate with one click.
Scrappy crawls official Portuguese event pages, normalizes what it finds, and feeds
a .NET API that stores events in MongoDB. A municipality then just picks an event and
presses "add".

Pipeline:

```text
config/sources.json
        │
        ▼
BullMQ crawl queue  ──►  crawl worker  ──►  BullMQ ingestion queue
                             │                       │
                             ▼                       ▼
                    Cheerio or Playwright      ingestion worker
                       (chosen per job)               │
                                                      ▼
                                            POST /events  (.NET API)
                                                      │
                                                      ▼
                                                  MongoDB
```

Two distinct job kinds, deliberately separate so a flaky API retries **one event**
rather than re-crawling an entire website:

- **crawl job** — "go crawl this source".
- **ingestion job** — "send this one extracted event to the API".

---

## 2. Repo reality (not the aspirational layout)

```text
scrappy/
├── Scrappy/                    # the .NET 10 API. NOT apps/api.
│   ├── Controllers/            # EventsController → route is [Route("events")]
│   ├── DTOs/Requests/          # CreateEventDto, EventLocationRequestDto  ← the contract
│   └── Models/Entities/Enums/  # EventType, LocalityName, DistrictName, Nuts2Region, DicoEnum
├── Scrappy.Tests/
├── apps/
│   ├── scraper/
│   │   ├── main.ts             # crawler entrypoint — npm run scraper
│   │   ├── router.ts           # Crawlee router and ingestion handoff
│   │   ├── source.ts           # crawlJobSchema  ✅ done
│   │   ├── config/{sources,blacklist}.json
│   │   └── src/                # scraper crawlers, normalization and enrichment
│   ├── ingestion/
│   │   ├── queue.ts            # ingestion producer
│   │   ├── worker.ts           # ingestion consumer → POST /events
│   │   ├── retryPolicy.ts      # EMPTY
│   │   └── reviewQueue.ts      # EMPTY
│   └── shared/
│       ├── rawEvent.ts         # rawEventSchema  ← THE contract  ✅ done
│       ├── eventTypes.ts       # mirrors C# EventType  ✅
│       ├── territory.ts        # mirrors C# DistrictName + Nuts2Region  ✅
│       ├── env.ts, redis.ts    # ✅
│       ├── jobId.ts            # EMPTY
│       └── logger.ts           # EMPTY
├── docker/docker-compose.yml   # api + mongodb + redis
└── docs/
```

`packages/`, `apps/web`, `apps/queue-worker`, `apps/api` **do not exist**. Older docs
referenced them; they have been corrected.

---

## 3. Ownership

| Area | Owner | Notes |
|---|---|---|
| `apps/scraper/src/**` | **Gonçalo** (`Goncas777`) | Playwright + Viral Agenda prototype. Actively edited — do not refactor without agreeing first. |
| `apps/scraper/{main,router,source}.ts`, `config/` | **Adrien** (`Huniity`) | Crawlee + Cheerio path, crawl queue. |
| `apps/ingestion/**`, `apps/shared/**` | **Adrien** | Queues, workers, shared schemas. |
| `Scrappy/**` (.NET API) | already built | DTOs, services, mappers, validators all exist. |

The scraper and ingestion worker are connected through Redis/BullMQ. The main
scraper path is `main.ts` → `router.ts` → ingestion queue → `worker.ts` → API.

---

## 4. The contracts that must not drift

### 4.1 `RawEvent` is the single source of truth

`apps/shared/rawEvent.ts` is what every extractor — Cheerio or Playwright — must
produce. Anything else is an intermediate shape and must be converted before queueing.

Required: `title` (3–250), `description` (10–2000), `sourceUrl`, `startDate`
(ISO-8601 **with offset**), `locationName`, `locality`, `district`, `region`,
`dicoCode` (exactly 4 digits).
Defaulted: `type` → `Outro`, `keywords` → `[]`.
Optional: `endDate` (must be ≥ `startDate`), `imageUrl`.

### 4.2 The API contract

`POST /events` (**not** `/api/v1/events`). Body is `CreateEventDto`:

```json
{
  "title": "Example event",
  "description": "A sufficiently detailed event description.",
  "startDate": "2026-08-20T20:00:00+01:00",
  "type": "Outro",
  "sourceUrl": "https://example.pt/events/123",
  "location": {
    "name": "Example venue",
    "locality": "Faro",
    "district": "Faro",
    "region": "PT15",
    "country": "PT",
    "dicoCode": "0805"
  }
}
```

The API uses `JsonStringEnumConverter`, so enums are sent as **member names**, not
display labels: `FestaPopular`, never `"Festa Popular"`.

### 4.3 Known contract mismatches (open)

- `EventLocationRequestDto.Locality` is the C# `LocalityName` **enum**, but
  `rawEventSchema.locality` is a free `z.string()`. `"Faro"` works; a name with
  spaces/accents must be the PascalCase member (`VilaRealDeSantoAntónio`,
  `AguiarDaBeira`) or the API rejects it.
- `EventLocationRequestDto.DicoCode` is `string?` and not `[Required]` in C#, but
  `rawEventSchema` requires 4 digits. Ours is stricter — fine, but decide deliberately.
- `.NET GeoDataService` can infer district/NUTS2/DICO from a locality, but is **not yet
  wired into event creation**. Until then the crawler must supply all three.

---

## 5. Engine selection — decided

**Explicit preflight**, per crawl job, before a crawler is constructed.

Crawlee's `CheerioCrawler` and `PlaywrightCrawler` are separate classes with separate,
non-interchangeable routers (`createCheerioRouter()` cannot be given to a Playwright
crawler). So the engine is chosen at job level, not inside one crawler.

```text
source config says "cheerio" or "playwright"?
  yes → use it
  no  → fetch the HTML once (10–15s timeout)
          ├── meaningful event content present  → Cheerio
          └── empty JS shell / no content       → Playwright
```

Cheerio is the **default** because most target pages are server-rendered.
Playwright is the **fallback**, for content that only exists after JS runs.

`AdaptivePlaywrightCrawler` was considered and rejected for now: harder to debug, and
the planned fixture tests are written against the explicit preflight.

---

## 6. Findings from probing Viral Agenda (2026-08-20)

Measured against the live site, not assumed:

| Request | Result |
|---|---|
| list page, bot-ish User-Agent | 7.7 KB stub |
| list page, browser User-Agent | **191 KB, 100 event links** |
| event detail page, browser UA | **185 KB, 2 JSON-LD blocks with a full `Event`** |

Consequences:

1. **Viral Agenda is server-rendered.** Everything Gonçalo extracts through Playwright's
   DOM is present in the raw HTML. Cheerio can read it with
   `$('script[type="application/ld+json"]')`.
2. **User-Agent gating is real.** With the default crawler UA you get the 7.7 KB stub and
   would wrongly classify the site as dynamic. Set a browser-like UA.
3. **Coordinates genuinely need Playwright.** `maps.google.com/maps?ll=` appears **0
   times** in the raw HTML; the "Ver mapa" button must be clicked. This is the concrete
   justification for keeping Playwright as a fallback.
4. The detail page has **two** JSON-LD blocks; the second uses `@graph`. Gonçalo's
   `ViralAgendaJsonLd` type only models the flat form.
5. Live JSON-LD returns `"endDate":"2026-08-20"` — **date-only, no offset**. This fails
   `rawEventSchema`'s `.datetime({ offset: true })`. Needs a normalization step.

---

## 7. Gonçalo's code — reuse assessment

Decision: **leave his files where they are for now.** The shared versions get agreed
with him before anything moves. Temporary duplication is accepted.

| File | Verdict |
|---|---|
| `src/normalization/viralAgenda.ts` | Reusable as-is — pure JSON-LD → object, no Playwright. |
| `src/types/events.ts` (`ViralAgendaJsonLd`) | Reusable; needs `@graph` support. |
| `src/enrichment/eventType.ts` | Reuse `classifyEventType`; its local `ApiEventType` union duplicates `shared/eventTypes.ts` and should collapse to it. |
| `src/deduplication/events.ts` | Logic reusable; currently keyed to his type, not `RawEvent`. |
| `src/enrichment/location.ts` | Stub — `resolveLocation()` always returns `null`. This is the territory-enrichment gap. |
| `src/crawlers/viralAgenda.ts` | Playwright-only. Keep as his fallback path. |

**His `NormalizedEvent` cannot pass `rawEventSchema`** — `locality`/`description` are
optional, `district`/`region`/`dicoCode` are absent, and `type` holds the schema.org
type (`"MusicEvent"`) rather than the API enum. The missing stage is:

```text
extract → normalize → enrich (territory) → rawEventSchema.parse → ingestion queue
```

---

## 8. Known issues (open, not yet fixed)

- `apps/scraper/main.ts` is the active scraper entrypoint.
- `router.ts` hardcodes Faro / `0805` / `PT15` on **every** event, and falls back to
  `new Date()` for a missing `startDate` — fabricated data, explicitly forbidden by the
  checklist. It also enqueues every `<a>` on the domain as `EVENT_DETAIL`.
- `ingestion/queue.ts` uses `jobId: eventData.sourceUrl`; URLs contain `:`, which BullMQ
  rejects for custom IDs. Hash the normalized URL instead (`jobId.ts` is the intended home).
- `ingestion/queue.ts` catches and logs queue errors without rethrowing — a Redis outage
  silently looks like success.
- `ingestion/worker.ts` does not re-validate `job.data`, has no HTTP timeout, and does not
  classify status codes (400/422 should go to review, not retry forever).
- Empty files awaiting implementation: `shared/jobId.ts`, `shared/logger.ts`,
  `ingestion/retryPolicy.ts`, `ingestion/reviewQueue.ts`, `scraper/src/config.ts`,
  `scraper/src/index-dynamic.ts`, `scraper/src/normalization/dates.ts`.
- `docker/docker-compose.yml` Redis healthcheck runs `curl` against port 6379 — it can
  never pass. Should be `redis-cli ping`.
- `pnpm-workspace.yaml` contains an unresolved placeholder
  (`msgpackr-extract: set this to true or false`), and the repo actually uses npm
  (`package-lock.json`). Clarify whether the pnpm workspace file is vestigial.

---

## 9. Environment

Host processes:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
API_URL=http://localhost:5000/events
```

Inside Docker, use service names (`redis`, `api:5000`) — `localhost` in a container means
that container.

Scripts: `npm run scraper` (crawl side), `npm run worker` (ingestion side),
`npm run typecheck`.

---

## 10. Working agreement

- Don't over-engineer. Get one source working end to end before generalizing.
- Never invent data: no fabricated dates, venues, or municipalities.
- Prefer JSON-LD over CSS selectors — it survives redesigns.
- Validate at every process boundary; a queue is a boundary, so TypeScript types alone
  are not enough.
- One checkpoint at a time (see `QUEUE_CRAWLER_IMPLEMENTATION_CHECKLIST.md`), reviewed
  before moving on.

---

## 11. Session log

### 2026-08-20 — Audit
- Read the full TS side, the C# request contract, and the docs.
- Established ownership split and confirmed the two halves are disconnected.
- Probed Viral Agenda live: server-rendered, UA-gated, JSON-LD present, coordinates
  click-gated (section 6).
- Decisions: explicit preflight for engine selection; Gonçalo's files stay put for now.
- Corrected the stale layout in `ARCHITECTURE.md` and the wrong payload contract in
  `SCRAPPING_GUIDELINES.md`.
- Next: checkpoint 4 — the crawl queue producer (`main.ts` + `crawlQueue.ts` + real
  `sources.json`), then checkpoint 5 — the engine detector.
