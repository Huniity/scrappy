  import assert from 'node:assert/strict';
  import test from 'node:test';
  import { extractEventMetadata } from './eventMetadata';

  test('extracts price, age rating, and capacity', () => {
      assert.deepEqual(
          extractEventMetadata(
              'Bilhete: 15€. M/6. Máximo de 30 participantes.',
          ),
          {
              price: 15,
              ageRating: 6,
              maximumAttendeeCapacity: 30,
          },
      );
  });

  test('does not create a price for free events', () => {
      assert.deepEqual(
          extractEventMetadata(
              'Entrada gratuita. M/12. Lotação máxima: 60 pessoas.',
          ),
          {
              ageRating: 12,
              maximumAttendeeCapacity: 60,
          },
      );
  });

  test('extracts Portuguese decimal prices', () => {
      assert.deepEqual(
          extractEventMetadata('Preço: 12,50 €.'),
          { price: 12.5 },
      );
  });