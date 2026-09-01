

import { createCheerioRouter } from 'crawlee';
import { load } from 'cheerio';
import { chromium, type Browser } from 'playwright';
import blacklist from './config/blacklist.json';
import {
    extractViralAgendaCoordinates,
    extractViralAgendaJsonLd,
    extractViralAgendaNormalizedEvent,
} from './sources/viralAgenda/extract';
import { classifyEventType } from './src/enrichment/eventType';
import { rawEventSchema } from '../shared/rawEvent';
import { normalizedUrl } from '../shared/jobId';
import { pushToIngestionQueue } from '../ingestion/queue';
import { extractEventMetadata } from './src/enrichment/eventMetadata';
import { resolveLocation } from './src/enrichment/location';
import { extractBolNormalizedEvent } from './sources/bol/extract';
import type { NormalizedEvent } from './src/types/normalizedEvent';
import { rejectBolCookies } from './src/crawlers/bol/extractors';
import { scrapeViralAgendaEvent, getViralAgendaEventUrls } from './src/crawlers/viralAgenda';
import { logEventFound as printEventFound } from '../shared/eventLog';


let eventsFound = 0;

type ScraperLog = {
    warning(message: string): void;
};

const bolEventPathPattern =
    /^\/Comprar\/Bilhetes\/\d+-[^/?#]+\/?$/i;
const viralAgendaEventPathPattern =
    /^\/pt\/events\/\d+\/[^/?#]+\/?$/i;

let playwrightBrowser: Browser | undefined;
let playwrightBrowserPromise: Promise<Browser> | undefined;

const playwrightUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/131.0.0.0 Safari/537.36';

function logEventFound(url: string): void {
    eventsFound += 1;
    printEventFound(url, eventsFound);
}

export function isBolEventDetailUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);

        return (
            parsedUrl.hostname === 'bol.pt' ||
            parsedUrl.hostname.endsWith('.bol.pt')
        ) && bolEventPathPattern.test(parsedUrl.pathname);
    } catch {
        return false;
    }
}

async function getPlaywrightBrowser(): Promise<Browser> {
    if (playwrightBrowser?.isConnected()) {
        return playwrightBrowser;
    }

    if (!playwrightBrowserPromise) {
        playwrightBrowserPromise = chromium.launch({
            headless: true,
        });
    }

    try {
        playwrightBrowser = await playwrightBrowserPromise;
        return playwrightBrowser;
    } finally {
        playwrightBrowserPromise = undefined;
    }
}

export async function discoverViralAgendaEventUrls(
    sourceUrl: string,
): Promise<string[]> {
    const browser =
        await getPlaywrightBrowser();

    const page =
        await browser.newPage({
            userAgent:
                playwrightUserAgent,

            locale:
                'pt-PT',
        });

    try {
        console.log(
            `Discovering Viral Agenda URLs: ` +
            `${sourceUrl}`,
        );

        const eventUrls =
            await getViralAgendaEventUrls(
                page,
                sourceUrl,
            );

        console.log(
            `Viral Agenda discovery finished: ` +
            `${eventUrls.length} URL(s).`,
        );

        return eventUrls;
    } finally {
        await page
            .close()
            .catch(() => undefined);
    }
}

export function isViralAgendaEventDetailUrl(url: string): boolean {
    try {
        const parsedUrl = new URL(url);

        return (
            parsedUrl.hostname === 'viralagenda.com' ||
            parsedUrl.hostname.endsWith('.viralagenda.com')
        ) && viralAgendaEventPathPattern.test(parsedUrl.pathname);
    } catch {
        return false;
    }
}

export async function closePlaywrightFallback(): Promise<void> {
    const pendingBrowser = playwrightBrowserPromise;

    if (pendingBrowser) {
        await pendingBrowser.catch(() => undefined);
    }

    const browser = playwrightBrowser;
    playwrightBrowser = undefined;
    playwrightBrowserPromise = undefined;

    if (browser?.isConnected()) {
        await browser.close();
    }
}

export const closeBolPlaywrightFallback =
    closePlaywrightFallback;

async function enqueueBolNormalizedEvent(
    normalized: NormalizedEvent,
    requestUrl: string,
    log: ScraperLog,
): Promise<boolean> {
    const resolvedLocation = resolveLocation(normalized);

    if (!resolvedLocation) {
        log.warning(
            `BOL location is not an exact Portuguese municipality: ` +
            `${normalized.municipality ?? normalized.locality ?? 'missing'} ` +
            `(${requestUrl})`,
        );
        return false;
    }

    const normalizedWithLocation = {
        ...normalized,
        municipality: resolvedLocation.municipality,
        latitude:
            resolvedLocation.latitude ?? normalized.latitude,
        longitude:
            resolvedLocation.longitude ?? normalized.longitude,
    };

    const metadata = extractEventMetadata(
        normalizedWithLocation.description,
        normalizedWithLocation.offers,
    );

    const normalizedEvent = {
        ...normalizedWithLocation,
        ...metadata,
        price:
            normalizedWithLocation.price ??
            metadata.price,
        isAccessibleForFree:
            normalizedWithLocation.isAccessibleForFree ??
            metadata.isAccessibleForFree,
        maximumAttendeeCapacity:
            normalizedWithLocation.maximumAttendeeCapacity ??
            metadata.maximumAttendeeCapacity,
        type: classifyEventType(
            normalizedWithLocation,
        ),
    };

    const apiMunicipality =
        normalizedEvent.municipality ??
        normalizedEvent.locality;

    if (!apiMunicipality) {
        log.warning(
            `Missing BOL municipality: ${requestUrl}`,
        );
        return false;
    }

    const rawEventCandidate = {
        title: normalizedEvent.title,
        description: normalizedEvent.description,
        sourceUrl: normalizedUrl(
            normalizedEvent.sourceUrl,
        ),
        startDate: normalizedEvent.startDate,
        endDate: normalizedEvent.endDate,
        type: normalizedEvent.type,
        locationName: normalizedEvent.venueName,
        locationUrl: normalizedEvent.locationUrl,
        locationSameAs: normalizedEvent.locationSameAs,
        sourceLocality: normalizedEvent.locality,
        municipality: apiMunicipality,
        streetAddress: normalizedEvent.streetAddress,
        postalCode: normalizedEvent.postalCode,
        imageUrl: normalizedEvent.imageUrl,
        latitude: normalizedEvent.latitude,
        longitude: normalizedEvent.longitude,
        price: normalizedEvent.price,
        ageRating: normalizedEvent.ageRating,
        maximumAttendeeCapacity:
            normalizedEvent.maximumAttendeeCapacity,
        alternateName: normalizedEvent.alternateName,
        isAccessibleForFree:
            normalizedEvent.isAccessibleForFree,
        eventAttendanceMode:
            normalizedEvent.eventAttendanceMode,
        doorTime: normalizedEvent.doorTime,
        duration: normalizedEvent.duration,
        eventStatus: normalizedEvent.eventStatus,
        keywords: normalizedEvent.keywords,
        offers: normalizedEvent.offers,
        schedule: normalizedEvent.schedule,
        audience: normalizedEvent.audience,
        organizer: normalizedEvent.organizer,
        promoter: normalizedEvent.promoter,
        maintainer: normalizedEvent.maintainer,
        performers: normalizedEvent.performers,
        funder: normalizedEvent.funder,
        actor: normalizedEvent.actor,
        director: normalizedEvent.director,
        composer: normalizedEvent.composer,
    };

    const validation = rawEventSchema.safeParse(
        rawEventCandidate,
    );

    if (!validation.success) {
        log.warning(
            `Invalid BOL raw event data: ${JSON.stringify(
                validation.error.issues,
            )}`,
        );
        return false;
    }

    logEventFound(requestUrl);
    await pushToIngestionQueue(validation.data);
    return true;
}

async function extractRenderedBolEvent(
    page: import('playwright').Page,
    eventUrl: string,
): Promise<NormalizedEvent | null> {
    await page.goto(eventUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
    });

    await page
        .waitForSelector(
            '#infoNomeEsp, script[type="application/ld+json"]',
            { timeout: 15_000 },
        )
        .catch(() => undefined);

    await page
        .waitForLoadState('networkidle', { timeout: 5_000 })
        .catch(() => undefined);

    await rejectBolCookies(page);

    const $ = load(await page.content());
    return extractBolNormalizedEvent($, eventUrl);
}

async function enqueueViralAgendaNormalizedEvent(
    normalized: NormalizedEvent,
    requestUrl: string,
    log: ScraperLog,
): Promise<boolean> {
    const resolvedLocation = resolveLocation(normalized);

    if (!resolvedLocation) {
        log.warning(
            `Location is not an exact Portuguese municipality: ` +
            `${normalized.municipality ?? normalized.locality ?? 'missing'} ` +
            `(${requestUrl})`,
        );
        return false;
    }

    const normalizedWithLocation = {
        ...normalized,
        municipality: resolvedLocation.municipality,
        latitude: resolvedLocation.latitude ?? normalized.latitude,
        longitude: resolvedLocation.longitude ?? normalized.longitude,
    };

    const metadata = extractEventMetadata(
        normalizedWithLocation.description,
        normalizedWithLocation.offers,
    );

    const normalizedEvent = {
        ...normalizedWithLocation,
        ...metadata,
        isAccessibleForFree:
            normalizedWithLocation.isAccessibleForFree ??
            metadata.isAccessibleForFree,
        maximumAttendeeCapacity:
            normalizedWithLocation.maximumAttendeeCapacity ??
            metadata.maximumAttendeeCapacity,
        type: classifyEventType(normalizedWithLocation),
    };

    const apiMunicipality =
        normalizedEvent.municipality ?? normalizedEvent.locality;

    if (!apiMunicipality) {
        log.warning(`Missing municipality for event: ${requestUrl}`);
        return false;
    }

    const validation = rawEventSchema.safeParse({
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
        streetAddress: normalizedEvent.streetAddress,
        postalCode: normalizedEvent.postalCode,
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
        audience: normalizedEvent.audience,
        organizer: normalizedEvent.organizer,
        promoter: normalizedEvent.promoter,
        maintainer: normalizedEvent.maintainer,
        performers: normalizedEvent.performers,
        funder: normalizedEvent.funder,
        actor: normalizedEvent.actor,
        director: normalizedEvent.director,
        composer: normalizedEvent.composer,
    });

    if (!validation.success) {
        log.warning(
            `Invalid raw event data: ${JSON.stringify(validation.error.issues)}`,
        );
        return false;
    }

    logEventFound(requestUrl);
    await pushToIngestionQueue(validation.data);
    return true;
}

export async function fallbackViralAgendaEventWithPlaywright(
    eventUrl: string,
    log: ScraperLog,
): Promise<boolean> {
    if (!isViralAgendaEventDetailUrl(eventUrl)) {
        return false;
    }

    for (let attempt = 1; attempt <= 3; attempt++) {
        let browser: Browser;

        try {
            browser = await getPlaywrightBrowser();
        } catch {
            continue;
        }

        let page: import('playwright').Page;

        try {
            page = await browser.newPage({
                userAgent: playwrightUserAgent,
                locale: 'pt-PT',
            });
        } catch {
            continue;
        }

        try {
            let renderedEvent: NormalizedEvent | null;

            try {
                renderedEvent = await scrapeViralAgendaEvent(
                    page,
                    eventUrl,
                );
            } catch {
                continue;
            }

            if (
                renderedEvent &&
                await enqueueViralAgendaNormalizedEvent(
                    renderedEvent,
                    eventUrl,
                    log,
                )
            ) {
                return true;
            }
        } finally {
            await page.close().catch(() => undefined);
        }
    }

    return false;
}

export async function fallbackBolEventWithPlaywright(
    eventUrl: string,
    log: ScraperLog,
): Promise<boolean> {
    if (!isBolEventDetailUrl(eventUrl)) {
        return false;
    }

    for (let attempt = 1; attempt <= 3; attempt++) {
        let browser: Browser;

        try {
            browser = await getPlaywrightBrowser();
        } catch {
            continue;
        }

        let page: import('playwright').Page;

        try {
            page = await browser.newPage({
                userAgent: playwrightUserAgent,
                locale: 'pt-PT',
            });
        } catch {
            continue;
        }

        try {
            let renderedEvent: NormalizedEvent | null;

            try {
                renderedEvent = await extractRenderedBolEvent(
                    page,
                    eventUrl,
                );
            } catch {
                continue;
            }

            if (
                renderedEvent &&
                await enqueueBolNormalizedEvent(
                    renderedEvent,
                    eventUrl,
                    log,
                )
            ) {
                return true;
            }
        } finally {
            await page.close().catch(() => undefined);
        }
    }

    return false;
}


export const router = createCheerioRouter();

/**
 * Default handler for the router that processes URLs and enqueues links to event detail pages.
 * It looks for anchor tags with href attributes containing "/pt/events/" and excludes any URLs that match the blacklist.
 * @param {Object} context - The context object provided by Crawlee, containing methods for enqueuing links and logging.
 * @param {Function} context.enqueueLinks - Function to enqueue links for further processing.
 * @param {Object} context.log - Logger object for logging messages.
 * @param {Object} context.request - The current request being processed.
 */
router.addDefaultHandler(async ({ enqueueLinks, log, request, $ }) => {
    log.info(`Processing URL: ${request.url}`);
    const urls = new Set<string>();

    $('a[href]').each((_index, element) => {
        const href = $(element).attr('href');

        if (!href) {
            return;
        }

        const url = new URL(href, request.url);

        const isBolEventUrl =
            /^\/Comprar\/Bilhetes\/\d+-[^/?#]+\/?$/i
                .test(url.pathname);

        if (isBolEventUrl) {
            urls.add(url.href);
        }
    });

    await enqueueLinks({
        urls: [...urls],
        label: 'BOL_EVENT_DETAIL',
    });
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
            await fallbackViralAgendaEventWithPlaywright(
                request.url,
                log,
            );
            return;
        }

        const coordinates = await extractViralAgendaCoordinates(
            request.url,
            sendRequest,
        );

        const normalizedDates = extractViralAgendaNormalizedEvent(
            $,
            request.url,
            coordinates,
        );

        if (!normalizedDates) {
            log.warning(
                `Invalid dates for event: ${request.url}`,
            );
            await fallbackViralAgendaEventWithPlaywright(
                request.url,
                log,
            );
            return;
        }

        if (
            !await enqueueViralAgendaNormalizedEvent(
                normalizedDates,
                request.url,
                log,
            )
        ) {
            await fallbackViralAgendaEventWithPlaywright(
                request.url,
                log,
            );
        }
    },
);

router.addHandler(
    'BOL_EVENT_DETAIL',
    async ({ request, $, log }) => {
        if (!isBolEventDetailUrl(request.url)) {
            return;
        }

        const normalized = extractBolNormalizedEvent(
            $,
            request.url,
        );

        if (!normalized) {
            await fallbackBolEventWithPlaywright(
                request.url,
                log,
            );
            return;
        }

        if (
            !await enqueueBolNormalizedEvent(
                normalized,
                request.url,
                log,
            )
        ) {
            await fallbackBolEventWithPlaywright(
                request.url,
                log,
            );
            return;
        }
    },
);
