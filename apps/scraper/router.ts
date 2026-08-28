

import { createCheerioRouter } from 'crawlee';
import blacklist from './config/blacklist.json';
import { extractViralAgendaCoordinates, extractViralAgendaJsonLd } from './sources/viralAgenda/extract';
import { normalizeViralAgendaDates } from './src/normalization/dates';
import { normalizeViralAgendaEvent } from './src/normalization/viralAgenda';
import { classifyEventType } from './src/enrichment/eventType';
import { rawEventSchema } from '../shared/rawEvent';
import { normalizedUrl } from '../shared/jobId';
import { pushToIngestionQueue } from '../ingestion/queue';
import { extractEventMetadata } from './src/enrichment/eventMetadata';
import { resolveLocation } from './src/enrichment/location';

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
    async ({ request, $, log, sendRequest }) => {
        const extracted =
            extractViralAgendaJsonLd($, request.url);

        if (!extracted) {
            log.warning(
                `No Viral Agenda event found: ${request.url}`,
            );
            return;
        }

        const coordinates = await extractViralAgendaCoordinates(
            request.url,
            sendRequest,
        );

        const extractedWithCoordinates = {
            ...extracted,
            latitude: coordinates?.latitude,
            longitude: coordinates?.longitude,
        }

        //   log.info(`Coordinates: ${coordinates?.latitude}, ${coordinates?.longitude}`);

        const normalized = normalizeViralAgendaEvent(extractedWithCoordinates);
        const normalizedDates = normalizeViralAgendaDates(normalized);

        if (!normalizedDates) {
            log.warning(
                `Invalid dates for event: ${request.url}`,
            );
            return;
        }

        const resolvedLocation = resolveLocation(normalizedDates);

        const normalizedWithLocation = resolvedLocation
            ? {
                ...normalizedDates,
                municipality: resolvedLocation.municipality,
                latitude: resolvedLocation.latitude,
                longitude: resolvedLocation.longitude,
            }
            : normalizedDates;

        const metadata = extractEventMetadata(
            normalizedWithLocation.description,
        );

        const normalizedEvent = {
            ...normalizedWithLocation,
            ...metadata,
            type: classifyEventType(normalizedWithLocation),
        };

        log.info(
            `Event found: ${JSON.stringify(normalizedEvent)}`,
        );

        const apiMunicipality =
            normalizedEvent.municipality ??
            normalizedEvent.locality;

        if (!apiMunicipality) {
            log.warning(
                `Missing municipality for event: ${request.url}`,
            );
            return;
        }

        const rawEventCandidate = {
            title: normalizedEvent.title,
            description: normalizedEvent.description,
            sourceUrl: normalizedUrl(normalizedEvent.sourceUrl),
            startDate: normalizedEvent.startDate,
            endDate: normalizedEvent.endDate,
            type: normalizedEvent.type,
            locationName: normalizedEvent.venueName,
            locationUrl: normalizedEvent.locationUrl,
            locationSameAs: normalizedEvent.locationSameAs,
            sourceLocality: normalizedEvent.locality,
            municipality: apiMunicipality,
            imageUrl: normalizedEvent.imageUrl,
            latitude: normalizedEvent.latitude,
            longitude: normalizedEvent.longitude,
            price: normalizedEvent.price,
            ageRating: normalizedEvent.ageRating,
            maximumAttendeeCapacity: normalizedEvent.maximumAttendeeCapacity,
            alternateName: normalizedEvent.alternateName,
            isAccessibleForFree: normalizedEvent.isAccessibleForFree,
            eventAttendanceMode: normalizedEvent.eventAttendanceMode,
            doorTime: normalizedEvent.doorTime,
            duration: normalizedEvent.duration,
            eventStatus: normalizedEvent.eventStatus,
            keywords: normalizedEvent.keywords,
            offers: normalizedEvent.offers,
            schedule: normalizedEvent.schedule,
            organizer: normalizedEvent.organizer,
            promoter: normalizedEvent.promoter,
            maintainer: normalizedEvent.maintainer,
            performers: normalizedEvent.performers,
            funder: normalizedEvent.funder,
            actor: normalizedEvent.actor,
            director: normalizedEvent.director,
            composer: normalizedEvent.composer,
        };

        const validation = rawEventSchema.safeParse(rawEventCandidate);

        if (!validation.success) {
            log.warning(
                `Invalid raw event data: ${JSON.stringify(validation.error.issues)}`,
            );
            return;
        }

        // log.info(
        //     `Valid raw event data: ${JSON.stringify(validation.data)}`,
        // );

        await pushToIngestionQueue(validation.data);

    },
);
