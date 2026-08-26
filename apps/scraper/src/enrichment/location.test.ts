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

test('prioritizes CAOP over an ambiguous textual municipality', () => {
    const result = resolveLocation({
        title: 'Torres Vedras Night Run',
        sourceUrl: 'https://example.com/event/2',
        startDate: '2026-08-26T20:15:00+01:00',
        locality: 'Santa Cruz',
        municipality: 'Santa Cruz',
        latitude: '39.135009800000000',
        longitude: '-9.381620300000000',
    });

    assert.deepEqual(result, {
        locality: 'Torres Vedras',
        latitude: '39.135009800000000',
        longitude: '-9.381620300000000',
    });
});

test('preserves coordinates when locality and coordinates agree', () => {
    const result = resolveLocation({
        title: 'Evento em Faro',
        sourceUrl: 'https://example.com/event/3',
        startDate: '2026-08-20T20:00:00+01:00',
        locality: 'Faro',
        latitude: '37.0194',
        longitude: '-7.9304',
    });

    assert.deepEqual(result, {
        locality: 'Faro',
        latitude: '37.0194',
        longitude: '-7.9304',
    });
});
