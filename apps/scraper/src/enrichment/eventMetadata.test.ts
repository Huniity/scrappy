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
              isAccessibleForFree: false,
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
              isAccessibleForFree: true,
          },
      );
  });

  test('extracts Portuguese decimal prices', () => {
      assert.deepEqual(
          extractEventMetadata('Preço: 12,50 €.'),
          {
              price: 12.5,
              isAccessibleForFree: false,
          },
      );
  });

  test('infers free access from Portuguese and English markers', () => {
      assert.equal(
          extractEventMetadata('Entrada gratuita.').isAccessibleForFree,
          true,
      );

      assert.equal(
          extractEventMetadata('Free entrance.').isAccessibleForFree,
          true,
      );
  });

  test('infers free access when there are no offers or prices', () => {
      assert.equal(
          extractEventMetadata('Evento cultural ao ar livre.').isAccessibleForFree,
          true,
      );
  });

  test('does not infer free access when a paid price exists', () => {
      assert.equal(
          extractEventMetadata('Bilhete: 15€.').isAccessibleForFree,
          false,
      );
  });
