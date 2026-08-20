# BullMQ, Redis, and Crawlee Implementation Checklist

Use this document as a sequence of small checkpoints. Complete only one checkpoint at a time, test it, and then ask for a review before continuing.

## Goal

Build this pipeline:

```text
Source configuration
        |
        v
BullMQ crawl queue --> Crawlee worker --> BullMQ ingestion queue
                           |                       |
                           v                       v
                    Cheerio or Playwright     ingestion worker
                                                   |
                                                   v
                                           POST /events (.NET API)
                                                   |
                                                   v
                                                MongoDB
```

There are two different kinds of jobs:

1. A **crawl job** tells a crawler worker which website to crawl.
2. An **ingestion job** contains one extracted event and tells an ingestion worker to send it to the API.

Keeping these queues separate makes retries safer. A temporary API failure should retry one event, not crawl the entire website again.

---

## Checkpoint 0: Understand the current repository

Relevant folders and files:

- `Scrappy/`: the .NET API.
- `Scrappy/DTOs/Requests/CreateEventDto.cs`: the API contract used by `POST /events`.
- `Scrappy/DTOs/Requests/EventLocationRequestDto.cs`: required location fields.
- `Scrappy/Models/Entities/Enums/`: valid enum values accepted by the API.
- `apps/scraper/`: Crawlee code.
- `apps/ingestion/`: BullMQ ingestion queue and API worker.
- `apps/shared/`: shared TypeScript schemas, Redis settings, and utilities.
- `docker/docker-compose.yml`: MongoDB, Redis, and API containers.

Current issues to keep in mind:

- The npm `scraper` script points to `apps/scraper/main.ts`.
- `apps/scraper/main.ts` is currently empty.
- The current queue passes `redisConnection` as a function instead of calling it or passing connection options.
- A URL should not be used directly as a BullMQ `jobId`. BullMQ custom IDs cannot contain `:`. Hash the URL first.
- The current scraped event fields are optional even though the API requires several of them.
- The worker may send `type: undefined`, but the API requires a valid `EventType`.
- The API validates location name, locality, district, NUTS2 region, and four-digit DICO code.
- The current crawler defaults a missing event date to the current time. That creates incorrect event data; missing required data should normally be rejected or sent for review.

### Done when

  - [x] You can explain the difference between a crawl job and an ingestion job.
  - [x] You know that the API endpoint is `POST /events`, not `/api/v1/events`.
  - [x] The crawler directory is consistently named `apps/scraper`.

---

## Checkpoint 1: Start and verify infrastructure

Do not work on Crawlee until Redis, MongoDB, and the API can start reliably.

### Tasks

- [x] Start the containers:

  ```bash
  docker compose -f docker/docker-compose.yml up -d redis mongodb api
  ```

- [x] Check container status:

  ```bash
  docker compose -f docker/docker-compose.yml ps
  ```

- [x] Check Redis:

  ```bash
  docker compose -f docker/docker-compose.yml exec redis redis-cli ping
  ```

  Expected output: `PONG`.

- [x] Open the API logs and confirm it connects to MongoDB:

  ```bash
  docker compose -f docker/docker-compose.yml logs api
  ```

- [ ] Add a Redis health check to Compose later:

  ```yaml
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 3s
    retries: 10
  ```

- [ ] Pin MongoDB and Redis image versions instead of using `latest` once the basic pipeline works.

### Important configuration

Processes running on your host use:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
API_URL=http://localhost:5000/events
```

Processes running inside Docker must use service names:

```env
REDIS_HOST=redis
REDIS_PORT=6379
API_URL=http://api:5000/events
```

`localhost` inside a container means that same container, not another Compose service.

### Done when

- [x] Redis responds with `PONG`.
- [x] The API starts without a MongoDB configuration error.
- [x] You can make a basic HTTP request to the API.

### Review request

Ask: **“Review checkpoint 1: Redis, MongoDB, and API infrastructure.”**

---

## Checkpoint 2: Define the queue contracts first

Create explicit Zod schemas before implementing queue producers or consumers. A queue is a boundary between processes, so TypeScript types alone are not enough; job data must also be checked at runtime.

### 2.1 Crawl job schema

Create a schema representing one configured source. Suggested fields:

```ts
type CrawlJob = {
  sourceUrl: string;
  engine: 'auto' | 'cheerio' | 'playwright';
  locality?: string;
  district?: string;
  region?: string;
  dicoCode?: string;
};
```

Validation requirements:

- [x] `sourceUrl` is a valid URL.
- [x] `engine` only accepts the three listed values.
- [x] Location values, when supplied, are non-empty.
- [x] `dicoCode`, when supplied, contains exactly four digits.

Why location can belong in the source configuration: a municipality crawler usually knows its municipality even when an event page does not repeat that information. These defaults remain optional because aggregators such as Viral Agenda and BOL contain events from multiple municipalities. Aggregator events must derive a locality from each event and pass through territorial enrichment before API ingestion. The existing .NET `GeoDataService` maps a known `LocalityName` to district, NUTS2 region, and DICO code, but still needs to be integrated into event creation.

### 2.2 Raw event schema

Update the raw event contract so it can represent the API data you actually need:

Required fields:

- [x] `title`: at least 3 characters, maximum 250.
- [x] `description`: at least 10 characters, maximum 2,000.
- [x] `sourceUrl`: valid URL.
- [x] `startDate`: valid ISO-8601 date with an offset.
- [x] A reusable Zod schema contains the valid API `EventType` names.
- [x] `type`: a valid API `EventType`, defaulting to `Outro` in `RawEvent`.
- [x] `locationName`: non-empty.
- [x] `locality`: non-empty extracted municipality name; official enum recognition is deferred to territorial enrichment/API validation to avoid duplicating the full C# municipality table.
- [x] `district`: valid API enum name.
- [x] `region`: valid API enum name such as `PT15`.
- [x] `dicoCode`: exactly four digits.

Useful optional fields:

- [x] `endDate`, including validation that it is not before `startDate`.
- [x] `imageUrl`.
- [x] `keywords`.
- [ ] latitude and longitude (deferred until venue geodata is extracted).

### 2.3 Match .NET enum serialization

The API uses `JsonStringEnumConverter`, so JSON should send enum names as strings. Examples:

```json
{
  "type": "Concerto",
  "locality": "Faro",
  "district": "Faro",
  "region": "PT15"
}
```

Do not assume display labels such as `Festa Popular` are accepted as enum names. The C# enum member is `FestaPopular`.

### Done when

- [x] Valid example crawl jobs pass Zod parsing.
- [x] Missing required crawl-job fields fail Zod parsing.
- [x] An invalid DICO code fails parsing.
- [x] An invalid crawler engine fails parsing.
- [x] A valid raw event passes parsing and receives the `Outro` and `[]` defaults.
- [x] Missing required raw-event fields fail parsing.
- [x] Invalid event types, districts, regions, descriptions, and date ranges fail parsing.
- [x] Seven `rawEventSchema` tests pass.
- [x] `npm run typecheck` passes.

### Review request

Ask: **“Review checkpoint 2: my CrawlJob and RawEvent schemas.”**

---

## Checkpoint 3: Fix and test the shared Redis connection

BullMQ can receive Redis connection options, or a suitable ioredis client. Keep Redis configuration in one shared module.

Recommended simple shape:

```ts
export const redisConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
  maxRetriesPerRequest: null,
};
```

Then pass the value consistently:

```ts
new Queue(queueName, { connection: redisConnection });
new Worker(queueName, processor, { connection: redisConnection });
```

Do not pass the function itself:

```ts
// Wrong if redisConnection is a function:
{ connection: redisConnection }
```

If you keep it as a function, call it and manage the resulting clients carefully. BullMQ workers use blocking Redis commands, so sharing one client among unrelated components can cause problems.

### Tasks

- [x] Validate Redis environment variables with Zod.
- [x] Do not log the Redis password.
- [x] Add a connectivity test that creates a queue, adds and processes one job, and closes/obliterates its test resources.
- [ ] Close queues and workers during `SIGINT` and `SIGTERM`.
- [ ] Make Redis connection failures visible; do not silently ignore them.

### Done when

- [x] A test queue can add and retrieve a job.
- [ ] Stopping the process does not leave it hanging.
- [x] `npm run typecheck` passes.

### Review request

Ask: **“Review checkpoint 3: my shared BullMQ Redis connection.”**

---

## Checkpoint 4: Build the crawl queue manager

The queue manager is a producer. It reads configured sources and creates crawl jobs. It should not crawl pages itself.

### Suggested files

```text
apps/scraper/
  config/sources.json
  crawlQueue.ts
  main.ts
  source.ts
```

### Source configuration

Replace plain URL strings with objects containing the context required by the API:

```json
[
  {
    "sourceUrl": "https://example.pt/events",
    "engine": "auto",
    "locality": "Faro",
    "district": "Faro",
    "region": "PT15",
    "dicoCode": "0805"
  }
]
```

Verify every administrative value against the C# enums and official municipality data. Do not guess DICO codes.

### Queue behavior

- [ ] Give the crawl queue one constant name, for example `event-crawl-queue`.
- [ ] Parse every source with the CrawlJob Zod schema before adding it.
- [ ] Configure retry attempts and exponential backoff.
- [ ] Set `removeOnComplete` and `removeOnFail` limits so Redis does not grow forever.
- [ ] Close the queue after all source jobs are added.
- [ ] Exit with a non-zero status when queueing fails.

### Safe job IDs

Create a deterministic ID by hashing the normalized URL:

```text
crawl-<sha256-of-normalized-url>
```

Do not use the URL directly because it contains `:`. A deterministic ID prevents duplicate pending jobs for the same source.

Decide whether repeat crawls should be:

- manually enqueued after completed jobs are removed;
- scheduled with BullMQ job schedulers; or
- triggered by an external scheduler such as cron.

Start with manual enqueueing. Add schedules only after one complete run works.

### Scripts

Make package scripts use the folder spelling you selected:

```json
{
  "crawl:enqueue": "tsx apps/scraper/main.ts",
  "crawl:worker": "tsx apps/scraper/worker.ts"
}
```

### Done when

- [ ] Running the enqueue script adds one crawl job per configured source.
- [ ] Running it twice does not create unwanted duplicate pending jobs.
- [ ] Failed queue operations produce a non-zero process exit status.
- [ ] The producer exits cleanly after enqueueing.

### Review request

Ask: **“Review checkpoint 4: my crawl queue producer and source configuration.”**

---

## Checkpoint 5: Implement Cheerio-versus-Playwright selection

Use two layers of selection:

1. An explicit source override for sites you already understand.
2. An automatic preflight when `engine` is `auto`.

### Automatic preflight

Fetch the source page with a timeout and a descriptive user agent. Inspect the returned HTML.

Choose **Cheerio** when the initial response already contains meaningful event content, such as:

- event cards or event links;
- headings and dates;
- `<time datetime="...">`;
- JSON-LD with `Event` objects;
- the expected selectors for that source.

Choose **Playwright** when:

- the HTML is only an empty app shell such as `<div id="root"></div>`;
- content appears only after JavaScript runs;
- the page requires clicking, pagination controls, or infinite scrolling;
- required data is loaded by XHR/fetch after page load;
- the plain HTTP request is blocked but a real browser works.

Signals like React, Vue, or Next.js scripts are hints, not proof. A Next.js site can still server-render complete HTML that Cheerio can parse.

### Recommended decision function

```ts
selectCrawlerEngine(
  sourceUrl,
  configuredEngine,
  requiredSelectors,
): Promise<'cheerio' | 'playwright'>
```

Suggested logic:

```text
explicit cheerio/playwright override?
  yes -> use it
  no  -> fetch HTML with 10-15 second timeout
          |
          +-- expected event content exists -> Cheerio
          |
          +-- empty JS shell / no required content -> Playwright
```

### Important fallback rule

Even if auto-detection chooses Cheerio, extraction might find zero valid events. Record this outcome. A later improvement can retry once with Playwright, but avoid an unlimited Cheerio/Playwright fallback loop.

### Tests

Create unit tests using saved HTML fixtures; do not depend entirely on live websites.

- [ ] Static HTML containing event content selects Cheerio.
- [ ] Empty React/Vue/Angular shell selects Playwright.
- [ ] Explicit `cheerio` always selects Cheerio.
- [ ] Explicit `playwright` always selects Playwright.
- [ ] Timeout/error behavior is defined and tested.
- [ ] A server-rendered Next.js page with real content selects Cheerio.

### Done when

- [ ] The chosen engine is logged with the source URL and reason.
- [ ] Overrides work.
- [ ] Fixture-based tests pass.
- [ ] Detection never waits forever because it has a timeout.

### Review request

Ask: **“Review checkpoint 5: my Cheerio/Playwright detector and tests.”**

---

## Checkpoint 6: Build one crawl worker

Create a BullMQ worker that consumes `event-crawl-queue`.

### Worker responsibilities

- [ ] Parse `job.data` with the CrawlJob schema.
- [ ] Choose the engine.
- [ ] Start the corresponding Crawlee crawler.
- [ ] Crawl only the intended domain and event paths.
- [ ] Extract events.
- [ ] Validate each extracted event.
- [ ] Add valid events to the ingestion queue.
- [ ] Report job progress, for example engine and number of events found.
- [ ] Throw on infrastructure failures so BullMQ retries the crawl job.
- [ ] Close cleanly on `SIGINT`/`SIGTERM`.

### Crawling safety

- [ ] Set `maxRequestsPerCrawl`.
- [ ] Limit concurrency per site.
- [ ] Limit requests per minute.
- [ ] Respect robots.txt and the target site's terms and access rules.
- [ ] Keep the existing blacklist, but also restrict links to known event URL patterns.
- [ ] Do not enqueue every link on the whole site without a domain/path strategy.
- [ ] Use a clear user agent and contact information where appropriate.

### Source-specific extraction

Generic selectors such as the first `h1`, first `p`, and first `time` are useful for a prototype but not reliable across municipalities. Prefer a source adapter:

```text
source configuration
       |
       v
source-specific list-page handler
       |
       v
source-specific event-detail extractor
       |
       v
normalized RawEvent
```

For each source, document:

- event-list selector;
- event-detail URL pattern;
- title selector;
- description selector;
- start/end date extraction;
- location/venue extraction;
- image extraction;
- type mapping;
- pagination behavior.

Prefer JSON-LD `Event` data when it is present and complete; it is generally more stable than visual CSS selectors.

### Data-quality rules

- [ ] Never replace a missing date with the current date.
- [ ] Never invent a venue or municipality that is not known from the source configuration or page.
- [ ] Reject titles shorter than the API minimum.
- [ ] Normalize whitespace.
- [ ] Convert dates to ISO-8601 with an explicit timezone/offset.
- [ ] Map unknown event types to `Outro` deliberately and log the original value.
- [ ] Preserve the canonical event URL as `sourceUrl`.
- [ ] Decide what happens to incomplete events: skip with a reason or send them to a review queue.

### Done when

- [ ] One known static source successfully runs with Cheerio.
- [ ] One saved or known dynamic source successfully runs with Playwright.
- [ ] A crawl produces validated ingestion jobs.
- [ ] No ingestion job is created when required fields are missing.
- [ ] The crawl worker shuts down cleanly.

### Review request

Ask: **“Review checkpoint 6: my crawl worker and first source adapter.”**

---

## Checkpoint 7: Harden the ingestion queue

The ingestion queue receives normalized `RawEvent` objects from crawler workers.

### Producer tasks

- [ ] Parse the event with Zod before queueing it.
- [ ] Do not catch and suppress queue errors. Log and rethrow them so the crawl job can fail/retry.
- [ ] Hash the canonical source URL for the job ID.
- [ ] Add exponential backoff.
- [ ] Limit retained completed and failed jobs.
- [ ] Use a stable queue-name constant shared by producer and worker.

### Duplicate behavior

A job ID based only on `sourceUrl` prevents duplicate queue jobs while that ID still exists. The .NET API also checks duplicate district/title/start-date combinations. Keep both protections:

- queue deduplication reduces repeated work;
- API validation protects the database.

Think about changed events later. If an event at the same URL changes dates, a URL-only ID may prevent reprocessing while the old completed job remains. Possible future IDs include a hash of URL plus important content or crawl version.

### Done when

- [ ] Invalid events cannot enter the queue.
- [ ] Redis errors fail the producing crawl job.
- [ ] Duplicate behavior is tested and documented.
- [ ] Old jobs have retention limits.

### Review request

Ask: **“Review checkpoint 7: my ingestion queue producer and deduplication.”**

---

## Checkpoint 8: Make the ingestion worker match the .NET API

The worker must transform `RawEvent` into `CreateEventDto` JSON.

### Minimum valid request shape

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

Verify values against the current C# validation rather than relying only on the comments in DTO examples. Some examples in the code may not use valid enum values.

### HTTP result classification

Not every failure should be retried equally:

- `201`: success.
- duplicate response: decide whether to treat as completed/idempotent.
- `400` or `422`: usually permanent bad data; send to a review/dead-letter queue rather than retrying repeatedly.
- `429`: retry, respecting `Retry-After` if supplied.
- `500`-`599`: retry with backoff.
- network timeout/connection failure: retry.

Start simple, then add this classification after the happy path works.

### Tasks

- [ ] Validate incoming job data again inside the worker.
- [ ] Set an HTTP timeout using `AbortSignal.timeout(...)`.
- [ ] Include job ID and source URL in logs.
- [ ] Never log secrets or full sensitive payloads.
- [ ] Throw retryable errors so BullMQ marks the attempt failed.
- [ ] Add worker concurrency and rate limiting through environment variables.
- [ ] Close the worker gracefully.
- [ ] Remove unused imports.

### Done when

- [ ] A manually queued valid event produces HTTP `201` and appears in MongoDB.
- [ ] An API outage causes a retry.
- [ ] Invalid API data is visible and not silently lost.
- [ ] The API receives string values that match all C# enums.

### Review request

Ask: **“Review checkpoint 8: my ingestion worker and CreateEventDto mapping.”**

---

## Checkpoint 9: Add a review/dead-letter path

Do this only after the complete happy path works.

Create a review queue for jobs that require human attention:

- missing required scrape fields;
- unknown municipality mapping;
- invalid date format;
- API `400`/`422` responses;
- retry attempts exhausted;
- selector changes that cause zero extracted events.

Suggested review payload:

```ts
type ReviewJob = {
  stage: 'crawl' | 'extract' | 'ingest';
  reason: string;
  sourceUrl: string;
  payload?: unknown;
  originalJobId?: string;
  occurredAt: string;
};
```

### Tasks

- [ ] Define and validate the review schema.
- [ ] Add a retention policy.
- [ ] Avoid storing full page HTML unless necessary; it can be large or contain personal data.
- [ ] Add a small command/report for viewing failed and review jobs.
- [ ] Define how a corrected job is resubmitted.

### Done when

- [ ] Permanent failures are visible in one place.
- [ ] Review jobs contain enough context to diagnose the problem.
- [ ] A corrected event can be safely resubmitted.

### Review request

Ask: **“Review checkpoint 9: my review/dead-letter queue.”**

---

## Checkpoint 10: Test the complete pipeline

Test from the smallest unit to the full system.

### Unit tests

- [ ] Zod crawl job schema.
- [ ] Zod event schema.
- [ ] URL normalization and job-ID hashing.
- [ ] engine detector with HTML fixtures.
- [ ] event-type normalization.
- [ ] API DTO mapping.
- [ ] HTTP status retry classification.

### Integration tests

- [ ] BullMQ producer adds a job to test Redis.
- [ ] Worker consumes it once.
- [ ] A thrown processor error retries the job.
- [ ] Duplicate job IDs behave as expected.
- [ ] Worker shutdown closes Redis connections.

### End-to-end test

Run these processes separately so failures are easy to see:

1. Redis, MongoDB, and API.
2. Ingestion worker.
3. Crawl worker.
4. Crawl queue producer.

Verify:

- [ ] a crawl job is added;
- [ ] the crawl worker selects and logs an engine;
- [ ] event pages are extracted;
- [ ] ingestion jobs are created;
- [ ] ingestion jobs receive HTTP `201`;
- [ ] events appear in MongoDB/API results;
- [ ] no unexpected duplicate events appear;
- [ ] failed jobs contain useful error messages.

Run static checks:

```bash
npm run typecheck
dotnet test Scrappy.Tests
dotnet build Scrappy/Scrappy.csproj
```

### Review request

Ask: **“Review checkpoint 10: here are my end-to-end logs and test results.”**

---

## Checkpoint 11: Containerize workers and operate safely

Do this last. Local processes are easier to debug while developing.

Add separate Compose services for:

- crawl worker;
- ingestion worker;
- optional crawl scheduler/producer.

Each service should use the same Node image/build but a different command.

### Tasks

- [ ] Add a Node worker Dockerfile.
- [ ] Install the Playwright browser and its Linux dependencies in the image.
- [ ] Do not run the container as root.
- [ ] Pass Redis/API configuration through environment variables.
- [ ] Use health checks and `depends_on` health conditions where helpful.
- [ ] Add restart policies for long-running workers.
- [ ] Set CPU/memory limits, especially for Playwright.
- [ ] Keep Cheerio concurrency higher than Playwright concurrency.
- [ ] Do not publish Redis or MongoDB ports publicly in production.
- [ ] Add Redis authentication/TLS if Redis is not on a trusted private network.
- [ ] Persist Redis data only if queue survival across restarts is required.

### Observability

At minimum, log structured fields:

- queue name;
- job ID;
- source URL;
- selected engine;
- attempt number;
- duration;
- number of pages/events;
- final status and error category.

Useful later additions:

- Bull Board or another protected BullMQ dashboard;
- Prometheus metrics;
- alerts for growing failed/review queues;
- alerts when a normally productive source extracts zero events.

Never expose a queue dashboard without authentication.

### Done when

- [ ] All services start with one Compose command.
- [ ] Restarting a worker does not lose queued jobs.
- [ ] Playwright runs successfully inside its container.
- [ ] Resource usage remains bounded.
- [ ] Production databases are not publicly exposed.

### Review request

Ask: **“Review checkpoint 11: my worker containers and production settings.”**

---

## Recommended implementation order

Do not build everything at once. Use this order:

1. Infrastructure health.
2. Queue schemas.
3. Redis connection.
4. Crawl queue producer.
5. Engine detector with tests.
6. One Cheerio crawl worker/source.
7. Ingestion queue hardening.
8. Ingestion worker/API mapping.
9. End-to-end test with Cheerio.
10. Add Playwright for one dynamic source.
11. Review/dead-letter queue.
12. Containers, scheduling, dashboards, and production hardening.

## Definition of complete

The first useful version is complete when:

- [ ] A configured source becomes a BullMQ crawl job.
- [ ] A worker selects Cheerio or Playwright using an override or tested auto-detection.
- [ ] Extracted events pass runtime validation.
- [ ] Each event becomes an ingestion job with safe retry and deduplication behavior.
- [ ] The ingestion worker sends a valid `CreateEventDto` to `POST /events`.
- [ ] The .NET API validates and stores the event in MongoDB.
- [ ] Missing/bad data and infrastructure errors are visible rather than silently swallowed.
- [ ] Workers shut down cleanly and Redis job retention is bounded.
