import { createHash } from "node:crypto";

const trackingParameterNames = new Set([
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
]);

function isTrackingParameter(name: string): boolean {
  const normalizedName = name.toLowerCase();

  return (
    normalizedName.startsWith('utm_') ||
    trackingParameterNames.has(normalizedName)
  );
}

export function normalizeUrl(rawUrl: string): string {
  const url = new URL(rawUrl);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Invalid URL protocol: ${url.protocol}`);
  }

  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  url.hash = '';

  if (
    (url.protocol === 'http:' && url.port === '80') ||
    (url.protocol === 'https:' && url.port === '443')
  ) {
    url.port = '';
  }

  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }

  for (const parameterName of [...url.searchParams.keys()]) {
    if (isTrackingParameter(parameterName)) {
      url.searchParams.delete(parameterName);
    }
  }

  url.searchParams.sort();

  return url.toString();
}

function hash(value: string): string {
  return createHash('sha256')
    .update(value)
    .digest('hex');
}

export function crawlJobId(sourceUrl: string): string {
  return `crawl-${hash(normalizeUrl(sourceUrl))}`;
}

export function ingestionJobId(sourceUrl: string): string {
  return `ingestion-${hash(normalizeUrl(sourceUrl))}`;
}
