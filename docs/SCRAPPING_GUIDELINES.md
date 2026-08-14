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
* **Cheerio Crawler:** Use for simple HTML sites (fastest, low memory usage). Place in `apps/scraper/src/crawlers/static/`.
* **Playwright Crawler:** Use if events require clicking, infinite scrolling, or JS execution. Place in `apps/scraper/src/crawlers/dynamic/`.

### 2. Payload Requirements
Every crawler MUST map scraped HTML data into the standard ingestion contract:

```typescript
export interface RawScrapedEvent {
  title: string;          // Mandatory
  sourceUrl: string;      // Mandatory (canonical event link)
  locality: string;       // Mandatory (e.g., "Albufeira", "Faro", "Loule")
  startDate: string;      // Mandatory (ISO-8601 string)
  endDate?: string;       // Optional
  description?: string;   // Optional
  imageUrl?: string;      // Optional
  venueName?: string;     // Optional
  type?: string;          // Optional (maps to EnumType)
}
```

### 3. Rules & Etiquette
* **Rate Limiting:** Set `maxRequestsPerCrawl` and requests per minute in Crawlee settings to avoid overloading municipal servers.
* **Sanitization:** Strip dangerous scripts, HTML tags, and unnecessary whitespaces before pushing payloads to BullMQ.