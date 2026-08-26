import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveLocation } from './location';

test('resolves a municipality from CAOP coordinates', () => {
    const result = resolveLocation({
        title: 'Evento em Loulé',
        sourceUrl: 'https://example.com/event/1',
        startDate: '2026-08-20T20:00:00+01:00',
        locality: 'Almancil',
        latitude: '37.1378',
        longitude: '-8.0201',
    });

    assert.deepEqual(result, {
        locality: 'Loulé',
        latitude: '37.1378',
        longitude: '-8.0201',
    });
});
