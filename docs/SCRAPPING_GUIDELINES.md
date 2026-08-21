# Scraping Guidelines & Rules

This guide explains how to write new web crawlers for municipal websites within `apps/scraper`.

---

## 🛠️ Technology Stack
* **Crawlee:** Framework for crawling and scraping orchestration.
* **Cheerio:** Fast HTML parser for static server-rendered pages.
* **Playwright:** Headless browser rendering for SPAs (React, Angular, Vue) or JS-protected sites.

---

## 📋 Steps to Implement a New Municipality

### 1. Select the Engine

**Cheerio is the default.** Most Portuguese municipal and agenda pages are
server-rendered, so plain HTTP + Cheerio gets the full content and is far cheaper.

**Playwright is the fallback**, used only when content genuinely does not exist in the
initial HTML response — content injected after JS runs, click-to-reveal elements,
infinite scroll, or XHR-loaded data.

The choice is made **per crawl job, before a crawler is constructed** — Crawlee's
`CheerioCrawler` and `PlaywrightCrawler` are separate classes with separate,
non-interchangeable routers. A source may set `engine` explicitly in its configuration;
otherwise a preflight fetch inspects the HTML and decides. See `docs/CONTEXT.md` §5.

> Beware User-Agent gating. Some sites return a near-empty stub to a bot-looking UA and
> the full page to a browser UA. Always preflight with a browser-like User-Agent, or you
> will misclassify a static site as dynamic.

### 2. Payload Requirements

Every crawler — Cheerio or Playwright — MUST produce a value that passes
**`rawEventSchema`** in `apps/shared/rawEvent.ts`. That schema is the single source of
truth; this snippet is a summary and the schema wins if they ever disagree.

```typescript
type RawEvent = {
  // Required
  title: string;          // 3–250 chars
  description: string;    // 10–2000 chars
  sourceUrl: string;      // canonical event URL
  startDate: string;      // ISO-8601 WITH offset, e.g. 2026-08-20T20:00:00+01:00
  locationName: string;   // venue name
  locality: string;       // municipality, e.g. "Faro"
  district: District;     // API enum name, e.g. "Faro"
  region: Nuts2Region;    // API enum name, e.g. "PT15"
  dicoCode: string;       // exactly four digits, e.g. "0805"

  // Defaulted
  type: EventType;        // API enum name; defaults to "Outro"
  keywords: string[];     // defaults to []

  // Optional
  endDate?: string;       // ISO-8601 with offset; must not precede startDate
  imageUrl?: string;
};
```

Enum values are the **C# member names**, not display labels — `FestaPopular`, never
`"Festa Popular"`. Validate against `Scrappy/Models/Entities/Enums/`.

A crawler will usually produce a looser intermediate shape first. Convert it before
queueing:

```text
extract → normalize → enrich (territory) → rawEventSchema.parse → ingestion queue
```

### 3. Data Quality Rules
* **Never invent data.** No fabricated dates, venues, or municipalities. A missing
  required field means skip the event with a logged reason, or send it to the review
  queue — never substitute `new Date()` for a missing `startDate`.
* **Prefer JSON-LD.** When a page exposes a schema.org `Event` block, parse it. It is far
  more stable than visual CSS selectors. Watch for `@graph`-wrapped variants.
* **Normalize dates** to ISO-8601 with an explicit offset. Date-only values such as
  `"2026-08-20"` will fail validation.
* **Map unknown event types to `Outro` deliberately**, and log the original value.
* **Preserve the canonical event URL** as `sourceUrl`.

### 4. Rules & Etiquette
* **Rate Limiting:** Set `maxRequestsPerCrawl`, per-site concurrency, and requests per
  minute in Crawlee settings to avoid overloading municipal servers.
* **Scope the crawl:** restrict links to the intended domain and known event URL patterns.
  Do not enqueue every link on a site. Keep the `config/blacklist.json` exclusions.
* **Respect `robots.txt`** and the target site's terms of access.
* **Identify yourself:** use a clear User-Agent with contact information where appropriate.
* **Sanitization:** Strip scripts and HTML tags and collapse whitespace before pushing
  payloads to BullMQ.