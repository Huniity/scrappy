 import assert from 'node:assert/strict';
  import test from 'node:test';
  import { rawEventSchema } from './rawEvent';

  const validEvent = {
    title: 'Concerto',
    description: 'Descrição válida do concerto.',
    sourceUrl: 'https://example.com/event/1',
    startDate: '2026-08-20T20:00:00+01:00',
    locationName: 'Teatro',
    locality: 'Faro',
    district: 'Faro',
    region: 'PT15',
    dicoCode: '0805',
  };

  test('applies default event type and keywords', () => {
    const result = rawEventSchema.parse(validEvent);

    assert.equal(result.type, 'Outro');
    assert.deepEqual(result.keywords, []);
  });

  test('keeps a valid coordinate pair', () => {
    const result = rawEventSchema.parse({
      ...validEvent,
      latitude: '37.1378',
      longitude: '-8.0201',
    });

    assert.equal(result.latitude, '37.1378');
    assert.equal(result.longitude, '-8.0201');
  });

  test('rejects incomplete coordinate pairs', () => {
    const result = rawEventSchema.safeParse({
      ...validEvent,
      latitude: '37.1378',
    });

    assert.equal(result.success, false);
  });

  test('rejects a short description', () => {
    const result = rawEventSchema.safeParse({
      ...validEvent,
      description: 'Curta',
    });

    assert.equal(result.success, false);
  });

  test('rejects an end date earlier than the start date', () => {
    const result = rawEventSchema.safeParse({
      ...validEvent,
      endDate: '2026-08-19T20:00:00+01:00',
    });

    assert.equal(result.success, false);
  });

  test('rejects an unknown district', () => {
    const result = rawEventSchema.safeParse({
      ...validEvent,
      district: 'Algarve',
    });

    assert.equal(result.success, false);
  });

  test('rejects an unknown NUTS2 region', () => {
    const result = rawEventSchema.safeParse({
      ...validEvent,
      region: 'Algarve',
    });

    assert.equal(result.success, false);
  });

  test('rejects an event without a location name', () => {
    const eventWithoutLocation = {
      ...validEvent,
      locationName: undefined,
    };

    const result = rawEventSchema.safeParse(eventWithoutLocation);

    assert.equal(result.success, false);
  });


  test('rejects an unknown event type', () => {
    const result = rawEventSchema.safeParse({
      ...validEvent,
      type: 'Party',
    });

    assert.equal(result.success, false);
  });
