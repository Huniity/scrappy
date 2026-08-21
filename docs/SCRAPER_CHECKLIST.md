# Scraper checklist

Current scope: normalize Viral Agenda nationally first. Add other sources only after this source is stable.

## Done

- [x] Added the Viral Agenda source configuration for `https://www.viralagenda.com/pt`.
- [x] Validate the source configuration in `apps/scraper/main.ts` with Zod.
- [x] Reused the existing crawler structure and added the Viral Agenda router.
- [x] Added JSON-LD extraction for event pages.
- [x] Added tests for JSON-LD extraction.
- [x] Normalize event URLs before using them.
- [x] Normalize start and end dates, including timezone offsets.
- [x] Convert date-only end dates to the end of that day (`23:59:59`).
- [x] Clean text and limit descriptions to the API limit of 2,000 characters.
- [x] Classify Viral Agenda event types into the project’s normalized types.
- [x] Validate crawler output with `rawEventSchema`.
- [x] Run the crawler successfully against 20 Viral Agenda requests with no request failures.
- [x] Make district, NUTS region, and DICO optional during the scraper’s first validation stage.
- [x] Register and call `GeoDataService` in the API so municipality data can fill district, region, and DICO.

## In progress

### Location semantics

- [ ] Keep these values separate:
  - `venueName`: the actual place, for example `Jardim Das Comunidades Almancil`.
  - `locality`: the place/locality from the source, for example `Almancil`.
  - `municipality`: the Portuguese municipality used by the API, for example `Loulé`.
  - `district`, `region`, and `dicoCode`: derived from the municipality.
- [ ] Do not infer locality or municipality from `venueName`, `streetAddress`, or a suffix such as `(cidade)`.
- [ ] Extract the municipality from an explicit Viral Agenda municipality link or another reliable page field.
- [ ] Preserve `addressLocality` when it is present. It can be a locality/freguesia and is not necessarily the municipality.
- [ ] Handle pages such as Almancil correctly: locality `Almancil`, municipality `Loulé`.
- [ ] Handle pages such as Viana where JSON-LD has `Viana do Castelo (cidade)` as the venue but no `addressLocality`.

### CAOP and geo data

- [ ] Reuse Gonçalo’s CAOP/geo work when it is available; do not duplicate it in the scraper.
- [ ] Use CAOP name relationships when a source locality can be mapped to its municipality.
- [ ] Use coordinates and CAOP point-in-polygon as a fallback or confirmation when coordinates exist.
- [ ] Leave the municipality unresolved when neither an explicit municipality nor a reliable CAOP result exists.
- [ ] Only after the municipality is known, call `GeoDataService.Lookup(municipality)` to derive district, NUTS region, and DICO.

## To do next

### 1. Add municipality to the normalized event model

- [ ] Add an optional `municipality` field to the normalized Viral Agenda event.
- [ ] Map the explicit municipality page value into this field.
- [ ] Keep `locality` mapped from `addressLocality`; do not overwrite it with the municipality.

### 2. Find and test the Viral Agenda municipality selector

- [ ] Inspect the HTML around the municipality link on a Viana event page.
- [ ] Inspect an Almancil event page where the locality and municipality differ.
- [ ] Add a small extraction helper for the explicit municipality link.
- [ ] Add fixtures/tests for both cases.
- [ ] Avoid broad selectors that could accidentally select the venue, category, or organizer.

### 3. Connect the location pipeline

- [ ] Resolve municipality from the explicit page value first.
- [ ] Use CAOP as the fallback when only a locality or coordinates are available.
- [ ] Call `GeoDataService.Lookup` with the municipality, not with a parish/locality such as Almancil.
- [ ] Build the API location payload with the correct municipality enum value.
- [ ] Confirm the API accepts canonical enum names such as `TorresVedras` where required.

### 4. Complete the crawler output

- [ ] Include `imageUrl` in the validated raw event candidate; it is currently extracted but not yet included there.
- [ ] Push valid events to the queue instead of only logging them.
- [ ] Add deduplication using the normalized source URL.
- [ ] Add pagination or controlled link discovery after the 20-request limit is removed.
- [ ] Keep the request limit low while testing, then increase it deliberately.

### 5. Verify end to end

- [ ] Run scraper unit tests.
- [ ] Run `npm run scraper` against a small request limit.
- [ ] Run the API build and fix any restore/build issues.
- [ ] Submit at least one event with a municipality that differs from its locality.
- [ ] Confirm the stored event has the correct venue, locality, municipality, district, region, and DICO.
- [ ] Confirm events without geo coordinates still work when the page provides a municipality.
- [ ] Confirm events without a reliable municipality are logged as unresolved instead of being guessed.

## Important examples

| Source data | Correct interpretation |
|---|---|
| Venue `Viana do Castelo (cidade)` | Venue name only; do not assume it is the municipality. |
| Locality `Almancil` | Source locality/freguesia. |
| Municipality for Almancil | `Loulé`. |
| `addressLocality: "Almancil"` | Keep as locality; map separately to municipality `Loulé`. |
| Coordinates without locality | Use CAOP as fallback if available. |

## Useful commands

```bash
node --import tsx --test apps/scraper/sources/viralAgenda/extract.test.ts
npm run scraper
```

The current `maxRequestsPerCrawl: 20` limit is for development only.
