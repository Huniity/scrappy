import assert from 'node:assert/strict';
import test from 'node:test';
import { load } from 'cheerio';

import {
    extractViralAgendaJsonLd,
} from './extract';
import { normalizeViralAgendaEvent } from '../../src/normalization/viralAgenda';

test('extracts an event from JSON-LD graph', () => {
    const $ = load(`
      <a class="event-node-link" href="/pt/loule">
        Loulé
      </a>
      <script type="application/ld+json">
        {
          "@graph": [
            {
              "@type": "BreadcrumbList",
              "name": "Ignored breadcrumb"
            },
            {
              "@type": "MusicEvent",
              "name": "Concerto de Verão",
              "url":
              "https://www.viralagenda.com/pt/events/123",
              "startDate": "2026-08-20T20:00:00+01:00",
              "description": "Um concerto de verão no Algarve.",
              "location": {
                "name": "Teatro das Figuras",
                "address": {
                  "addressLocality": "Almancil",
                  "streetAddress": "Largo de São Francisco",
                  "addressCountry": "PT"
                }
              }
            }
          ]
        }
      </script>
    `);

    const result = extractViralAgendaJsonLd(
        $,
        'https://www.viralagenda.com/pt/events/fallback',
    );

    assert.ok(result);

    const normalized =
        normalizeViralAgendaEvent(result);

    assert.equal(
        normalized.title,
        'Concerto de Verão',
    );

    assert.equal(
        normalized.sourceUrl,
        'https://www.viralagenda.com/pt/events/123',
    );

    assert.equal(
        normalized.venueName,
        'Teatro das Figuras',
    );

    assert.equal(
        normalized.locality,
        'Almancil',
    );

    assert.equal(result.name, 'Concerto de Verão');
    assert.equal(
        result.startDate,
        '2026-08-20T20:00:00+01:00',
    );
    assert.equal(
        result.location?.name,
        'Teatro das Figuras',
    );
    assert.equal(
        result.location?.address?.addressLocality,
        'Almancil',
    );
    assert.equal(result.municipality, 'Loulé');
    assert.equal(normalized.locality, 'Almancil');
    assert.equal(normalized.municipality, 'Loulé');
});