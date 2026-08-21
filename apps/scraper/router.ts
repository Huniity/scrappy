

import { createCheerioRouter } from 'crawlee';
import { extractViralAgendaJsonLd } from './sources/viralAgenda/extract';
import { normalizeViralAgendaEvent } from './src/normalization/viralAgenda';
import blacklist from './config/blacklist.json';


export const router = createCheerioRouter();

/**
 * Default handler for the router that processes URLs and enqueues links to event detail pages.
 * It looks for anchor tags with href attributes containing "/pt/events/" and excludes any URLs that match the blacklist.
 * @param {Object} context - The context object provided by Crawlee, containing methods for enqueuing links and logging.
 * @param {Function} context.enqueueLinks - Function to enqueue links for further processing.
 * @param {Object} context.log - Logger object for logging messages.
 * @param {Object} context.request - The current request being processed.
 */
router.addDefaultHandler(async ({ enqueueLinks, log, request }) => {
  log.info(`Processing URL: ${request.url}`);

  await enqueueLinks({
    selector: 'a[href*="/pt/events/"]',
    label: 'EVENT_DETAIL',
    exclude: blacklist,
  });
});

/**
 * Handler for processing event detail pages. It extracts event data from JSON-LD scripts and normalizes it.
 * If no valid event data is found, it logs a warning message.
 * @param {Object} context - The context object provided by Crawlee, containing methods for logging and accessing the request and Cheerio instance.
 * @param {Object} context.request - The current request being processed.
 * @param {Object} context.$ - The Cheerio instance for parsing the HTML of the page.
 * @param {Object} context.log - Logger object for logging messages.
 */
router.addHandler(
    'EVENT_DETAIL',
    async ({ request, $, log }) => {
      const extracted =
        extractViralAgendaJsonLd($, request.url);

      if (!extracted) {
        log.warning(
          `No Viral Agenda event found: ${request.url}`,
        );
        return;
      }

      const normalized =
        normalizeViralAgendaEvent(extracted);

      log.info(
        `Event found: ${JSON.stringify(normalized)}`,
      );
    },
);