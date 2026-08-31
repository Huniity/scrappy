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
      <a
        href="https://maps.google.com/maps?zoom=16&ll=37.1378%2C-8.0201"
      >
        Ver mapa
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
    assert.equal(result.latitude, '37.1378');
    assert.equal(result.longitude, '-8.0201');
    assert.equal(normalized.locality, 'Almancil');
    assert.equal(normalized.municipality, 'Loulé');
    assert.equal(normalized.latitude, '37.1378');
    assert.equal(normalized.longitude, '-8.0201');
});

test('falls back to HTML tags when JSON-LD keywords are empty', () => {
    const $ = load(`
      <ul class="viral-informations-items viral-tags">
        <li>
          <a href="/pt/tags/tradi%C3%A7ao"><span>#tradição</span></a>
        </li>
        <li>
          <a href="/pt/tags/musica"><span>#musica</span></a>
        </li>
        <li>
          <a href="/pt/tags/cultura"><span>#cultura</span></a>
        </li>
      </ul>
      <script type="application/ld+json">
        {
          "@type": "Event",
          "name": "Feira dos Moços 2026",
          "url": "https://www.viralagenda.com/pt/events/1838299",
          "startDate": "2026-08-28T17:00:00+01:00",
          "keywords": []
        }
      </script>
    `);

    const result = extractViralAgendaJsonLd(
        $,
        'https://www.viralagenda.com/pt/events/fallback',
    );

    assert.deepEqual(result?.keywords, [
        'tradição',
        'musica',
        'cultura',
    ]);
});
