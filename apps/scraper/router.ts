

import { createCheerioRouter } from 'crawlee';
import { rawEventSchema } from "../shared/rawEvent";
import { pushToIngestionQueue } from "../ingestion/queue";
import blacklist from "./config/blacklist.json";


export const router = createCheerioRouter();

router.addDefaultHandler(async ({ enqueueLinks, log, request}) => {
    log.info(`Processing URL: ${request.url}`);

    await enqueueLinks({
        selector: 'a',
        label: 'EVENT_DETAIL',
        exclude: blacklist,
    });
});

router.addHandler('EVENT_DETAIL', async ({ request, $, log }) => {
  const title = $('h1').first().text().trim();

  if (!title) return;

  log.info(`[Scraper] Evento detetado: "${title}"`);

  const description = $('p').first().text().trim() || title;
  const startDateRaw = $('time').attr('datetime') || new Date().toISOString();

  const scrapedPayload = rawEventSchema.parse({
    title,
    description,
    sourceUrl: request.loadedUrl || request.url,
    startDate: startDateRaw,
    locationName: 'Faro',
    locality: 'Faro',
    district: 'Faro',
    region: 'PT15',
    dicoCode: '0805',
  });

  await pushToIngestionQueue(scrapedPayload);
});


