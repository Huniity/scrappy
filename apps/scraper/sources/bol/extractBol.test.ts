

import assert from 'node:assert/strict';
import test from 'node:test';
import { load } from 'cheerio';

import {
    extractBolJsonLd,
    extractBolNormalizedEvent,
} from './extract';

test('extracts an event from BOL JSON-LD script and iframe coordinates', () => {
    const $ = load(`
      <iframe src="https://maps.google.com/maps?q=38.7108,-9.1412&z=15"></iframe>
      <script type="application/ld+json">
        {
          "@graph": [
            {
              "@type": "BreadcrumbList",
              "name": "Ignored Breadcrumb"
            },
            {
              "@type": "Event",
              "name": "Espectáculo no Teatro",
              "url": "https://www.bol.pt/Comprar/Bilhetes/12345-espectaculo",
              "startDate": "2026-09-15T21:00:00+01:00",
              "endDate": "2026-09-15T23:00:00+01:00",
              "description": "Um evento imperdível.",
              "location": {
                "@type": "Place",
                "name": "Teatro Nacional",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Praça do Rossio",
                  "postalCode": "1100-200",
                  "addressLocality": "Lisboa",
                  "addressCountry": "PT"
                }
              },
              "offers": {
                "@type": "Offer",
                "price": "15.00",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock"
              }
            }
          ]
        }
      </script>
    `);

    const fallbackUrl = 'https://www.bol.pt/Comprar/Bilhetes/fallback';
    const result = extractBolJsonLd($, fallbackUrl);

    assert.ok(result);
    assert.equal(result.name, 'Espectáculo no Teatro');
    assert.equal(result.url, 'https://www.bol.pt/Comprar/Bilhetes/12345-espectaculo');
    assert.equal(result.startDate, '2026-09-15T21:00:00+01:00');
    assert.equal(result.endDate, '2026-09-15T23:00:00+01:00');
    assert.equal(result.description, 'Um evento imperdível.');
    
    // Location assertions
    assert.equal(result.location?.name, 'Teatro Nacional');
    assert.equal(result.location?.address?.streetAddress, 'Praça do Rossio');
    assert.equal(result.location?.address?.postalCode, '1100-200');
    assert.equal(result.location?.address?.addressLocality, 'Lisboa');
    
    // Extracted from iframe coordinates as fallback/enrichment
    assert.equal(result.location?.geo?.latitude, '38.7108');
    assert.equal(result.location?.geo?.longitude, '-9.1412');

    // Offer assertions
    assert.ok(Array.isArray(result.offers));
    const firstOffer = result.offers[0];
    assert.equal(firstOffer.price, '15.00');
    assert.equal(firstOffer.priceCurrency, 'EUR');
    assert.equal(firstOffer.availability, 'https://schema.org/InStock');
});

test('uses fallbackUrl when JSON-LD lacks url property', () => {
    const $ = load(`
      <script type="application/ld+json">
        {
          "@type": "Event",
          "name": "Concerto Sem URL",
          "startDate": "2026-10-01T20:00:00+01:00"
        }
      </script>
    `);

    const fallbackUrl = 'https://www.bol.pt/Comprar/Bilhetes/99999-fallback';
    const result = extractBolJsonLd($, fallbackUrl);

    assert.ok(result);
    assert.equal(result.name, 'Concerto Sem URL');
    assert.equal(result.url, fallbackUrl);
});

test('uses the same normalized event pipeline for rendered HTML', () => {
    const html = `
      <script type="application/ld+json">
        {
          "@type": "Event",
          "name": "Evento de teste",
          "url": "https://www.bol.pt/Comprar/Bilhetes/12345-evento",
          "startDate": "2026-10-01T20:00:00+01:00",
          "endDate": "2026-10-01T21:00:00+01:00",
          "description": "Descrição suficientemente longa para validar o evento.",
          "duration": "PT1H",
          "location": {
            "name": "Teatro de Teste",
            "address": {
              "addressLocality": "Lisboa",
              "addressCountry": "PT"
            }
          },
          "offers": {
            "price": "10",
            "priceCurrency": "EUR"
          }
        }
      </script>
    `;

    const fallbackUrl =
        'https://www.bol.pt/Comprar/Bilhetes/12345-evento';

    const cheerioEvent = extractBolNormalizedEvent(
        load(html),
        fallbackUrl,
    );

    // Playwright's fallback reads page.content() and sends that rendered HTML
    // through this same function.
    const playwrightRenderedEvent = extractBolNormalizedEvent(
        load(html),
        fallbackUrl,
    );

    assert.deepEqual(
        playwrightRenderedEvent,
        cheerioEvent,
    );
});
