import assert from 'node:assert/strict';
import test from 'node:test';
import {
  crawlJobId,
  ingestionJobId,
  normalizeUrl,
} from './jobId';

test('normalizes Viral Agenda URLs', () => {
  const result = normalizeUrl(
    'HTTPS://WWW.VIRALAGENDA.COM:443/pt/events/123/?utm_source=facebook&b=2&a=1#map',
  );

  assert.equal(
    result,
    'https://www.viralagenda.com/pt/events/123?a=1&b=2',
  );
});

test('removes tracking parameters case-insensitively', () => {
  assert.equal(
    normalizeUrl(
      'https://example.com/event?UTM_SOURCE=x&fbclid=y&id=42',
    ),
    'https://example.com/event?id=42',
  );
});

test('preserves non-default ports', () => {
  assert.equal(
    normalizeUrl('https://example.com:8443/event/'),
    'https://example.com:8443/event',
  );
});

test('keeps the root path', () => {
  assert.equal(
    normalizeUrl('https://EXAMPLE.COM/#fragment'),
    'https://example.com/',
  );
});

test('rejects non-http URLs', () => {
  assert.throws(
    () => normalizeUrl('ftp://example.com/file'),
    /Invalid URL protocol: ftp:/,
  );
});

test('creates stable BullMQ-safe job IDs', () => {
  const firstUrl = 'https://example.com/event/?utm_campaign=test';
  const equivalentUrl = 'HTTPS://EXAMPLE.COM/event';

  assert.equal(crawlJobId(firstUrl), crawlJobId(equivalentUrl));
  assert.equal(ingestionJobId(firstUrl), ingestionJobId(equivalentUrl));
  assert.match(crawlJobId(firstUrl), /^crawl-[0-9a-f]{64}$/);
  assert.match(ingestionJobId(firstUrl), /^ingestion-[0-9a-f]{64}$/);
});
