# 🏗️ Scrappy System Architecture & Data Flow

This document details the complete data flow, architecture layers, dependencies, and ecosystem integration for the **Scrappy** platform.

---

## 📑 Table of Contents
1. [Ecosystem Overview](#-ecosystem-overview)
2. [Data Processing Pipelines](#-data-processing-pipelines)
   - [A. Asynchronous Ingestion Flow (Scraping -> DB)](#a-asynchronous-ingestion-flow-scraping---db)
   - [B. Synchronous Consumption Flow (API -> Clients)](#b-synchronous-consumption-flow-api---clients)
3. [Internal API Architecture (.NET 10 Clean Architecture)](#-internal-api-architecture-net-10-clean-architecture)
4. [Monorepo Layout](#-monorepo-layout)
5. [Component Dependencies Summary](#-component-dependencies-summary)

---

## 🛠️ Ecosystem Overview

```text
 [ EXTERNAL MUNICIPAL SITES ] 
            │
            ▼ (Crawlee / Playwright / Cheerio)
   [ SCRAPER WORKERS ] (`apps/scraper`)
            │
            ▼ (Push Ingestion Jobs)
   [ REDIS + BULLMQ QUEUE ] 
            │
            ▼ (Pop Jobs & Process Rate Limits)
  [ QUEUE WORKER ] (`apps/queue-worker`)
            │
            ▼ (HTTP POST /events)
  [ SCRAPPY API Engine ] (`apps/api`)
            │
            ▼ (Validate, Infer Territory, Calculate QualityScore, Map)
    [ MONGODB DATABASE ]
            ▲
            │
  ┌─────────┴────────────────────────┐
  │                                  │
  ▼ (HTTP REST / JSON)               ▼ (HTTP / application/ld+json)
[ NEXT.JS FRONTEND ]               [ AMA / ARTE PORTALS & PUBLIC CONSUMERS ]
 (`apps/web`)
```

---

## 🔄 Data Processing Pipelines

### A. Asynchronous Ingestion Flow (Scraping -> DB)
1. **Extraction:** Scrapers inside `apps/scraper` extract raw HTML/JSON from Portuguese municipal event pages using Crawlee (Cheerio for fast static extraction, Playwright for dynamic SPAs).
2. **Buffering & Queueing:** Raw event payloads are pushed as jobs into Redis queues managed by **BullMQ**. This provides fault tolerance, rate limiting, and exponential backoff retries.
3. **Queue Processing:** `apps/queue-worker` consumes jobs from BullMQ and sends them via HTTP `POST /events` to the .NET API.
4. **Ingestion & Validation (.NET API):**
   - **Validator:** Cleans raw HTML text and validates mandatory fields (`Title`, `StartDate`, `SourceUrl`).
   - **GeoDataService:** Automatically infers `DistrictName`, `Nuts2Region`, and the 4-digit `DicoCode` based on municipal locality mappings.
   - **Quality Score Engine:** Computes an event `QualityScore` (0-100) based on metadata completeness (presence of image, geocoordinates, schedule, age ratings, etc.).
   - **Request Mapper:** Maps the sanitized DTO payload into the `DistrictEvent` domain entity using zero-reflection static extension methods.
   - **Persistence:** Upserts the document into the MongoDB database (`DistrictEvents` collection).

---

### B. Synchronous Consumption Flow (API -> Clients)

#### 1. REST Frontend Client Flow (React / Next.js / Mobile)
```text
HTTP Request (GET /events/search)
  └──> EventsController
        └──> EventQueryService (Applies MongoDB FilterDefinition, Pagination, Sorting)
              └──> MongoDB Execution
                    └──> EventResponseMapper (Converts DistrictEvent -> EventSummaryDto)
                          └──> HTTP 200 OK (JSON Wrapped in ApiResultDto)
```

#### 2. Interoperability Public Flow (AMA / ARTE / Schema.org)
```text
HTTP Request (GET /events/{id} with Accept: application/ld+json)
  └──> EventsController
        └──> EventService (GetByIdAsync)
              └──> EventSchemaOrgMapper (Converts DistrictEvent -> SchemaOrgEventDto)
                    └──> Injects @context, @type, ISO-8601 dates, DICO code, and QualityScore
                          └──> HTTP 200 OK (application/ld+json)
```

---

## 🧱 Internal API Architecture (.NET 10 Clean Architecture)

Data strictly moves through defined responsibilities inside `apps/api`:

```text
HTTP Request ──> [ Controller ] ──> [ Validator ] ──> [ Extension Mappers ] ──> [ Service Layer ] ──> [ Data Models / MongoDB ]
                                                                                      │
HTTP Response <── [ Controller ] <── [ Extension Mappers ] <──────────────────────────┘
```

### Component Breakdown
* **`Models/Entities/`:** Domain entities and embedded sub-models mapped to MongoDB (`DistrictEvent`, `EventModel`, `LocationModel`, `AgentModel`, `ScheduleModel`, `OfferModel`).
* **`DTOs/`:** Contracts for Requests (`CreateEventDto`, `EventQueryParameters`), REST Responses (`EventResponseDto`), and Semantic Interoperability (`SchemaOrgEventDto`).
* **`Validators/`:** FluentValidation rules guarding the API boundary.
* **`Mappers/`:** Static extension methods (`EventRequestMapper`, `EventResponseMapper`, `EventSchemaOrgMapper`) providing high-performance data transformations.
* **`Services/`:** Business logic, territorial inference (`GeoDataService`), QualityScore calculations, and MongoDB queries (`EventQueryService`).
* **`Exceptions/` & `Middlewares/`:** Custom domain exceptions intercepted by `GlobalExceptionMiddleware` to output standard RFC 7807 `ProblemDetails`.
* **`Extensions/`:** Infrastructure bootstrappers (`ServiceCollectionExtensions`) and helper utility methods.

---

## 📁 Monorepo Layout

```text
scrappy/
├── apps/
│   ├── api/          # C# .NET 10 Web API Core
│   ├── scraper/      # Ingestion Crawler Engine (Node.js + Crawlee)
│   ├── queue-worker/ # BullMQ Async Queue Consumer
│   └── web/          # Next.js / React Frontend Application
├── packages/
│   ├── shared-types/ # Shared TypeScript Contracts
│   └── eslint-config/ # Uniform Code Formatting
├── docker/           # Docker Compose Infrastructure (MongoDB + Redis + Services)
└── docs/             # Technical Specs & Guidelines
```

---

## 📦 Component Dependencies Summary

| Layer / Tool | Primary Responsibility | Tech Stack |
| :--- | :--- | :--- |
| **Scraper** | Web crawling & raw data extraction | Crawlee, Playwright, Cheerio, Node.js |
| **Queue Manager** | Job scheduling, rate limiting, and retries | BullMQ, Redis |
| **Queue Worker** | Bridge between Redis queues and API ingestion | Node.js, TypeScript, Axios |
| **Web API** | Ingestion pipeline, queries, and REST/JSON-LD endpoints | .NET 10, C# |
| **Database** | Flexible document storage & geospatial queries | MongoDB |
| **Frontend** | User UI, event search, and filtering | Next.js, React, Tailwind CSS |