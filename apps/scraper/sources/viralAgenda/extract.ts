

import type { CheerioAPI } from 'cheerio';
import type { CheerioCrawlingContext } from 'crawlee';
import type { SchemaAgent } from '../../src/types/agent';
import type { SchemaAudience } from '../../src/types/audience';
import type { SchemaOffer } from '../../src/types/offer';
import type { SchemaSchedule } from '../../src/types/schedule';
import type { ValidViralAgendaEvent } from './types';
import type {
    MapCoordinates, ViralAgendaMapResponse, JsonObject  
} from './types';
import type { NormalizedEvent } from '../../src/types/normalizedEvent';
import { normalizeViralAgendaDates } from '../../src/normalization/dates';
import { normalizeViralAgendaEvent } from '../../src/normalization/viralAgenda';



function isRecord(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const result = value.trim();

    return result.length > 0 ? result : undefined;
}

function asNonNegativeInteger(value: unknown): number | undefined {
    const number = typeof value === 'number'
        ? value
        : typeof value === 'string'
            ? Number(value)
            : NaN;

    return Number.isInteger(number) && number >= 0
        ? number
        : undefined;
}

function readType(value: unknown): string | undefined {
    if (typeof value === 'string') {
        return value;
    }

    if (Array.isArray(value)) {
        return value.find(
            (item): item is string =>
                typeof item === 'string',
        );
    }

    return undefined;
}

function collectJsonLdNodes(
    value: unknown,
): JsonObject[] {
    if (Array.isArray(value)) {
        return value.flatMap(collectJsonLdNodes);
    }

    if (!isRecord(value)) {
        return [];
    }

    const graph = value['@graph'];

    if (Array.isArray(graph)) {
        return graph.flatMap(collectJsonLdNodes);
    }

    return [value];
}

function isEventNode(node: JsonObject): boolean {
    const rawType = node['@type'];

    const types = Array.isArray(rawType)
        ? rawType.filter(
            (value): value is string =>
                typeof value === 'string',
        )
        : typeof rawType === 'string'
            ? [rawType]
            : [];

    return types.some((type) => {
        const normalizedType = type.toLowerCase();

        return (
            normalizedType === 'event' ||
            normalizedType.endsWith('event') ||
            normalizedType === 'festival'
        );
    });
}


function readLocalityFromPage(
    $: CheerioAPI,
): string | undefined {
    return asString(
        $('[itemprop="streetAddress"]')
            .first()
            .text(),
    );
}

function readMunicipalityFromPage(
    $: CheerioAPI,
): string | undefined {
    return asString(
        $('a.event-node-link')
            .first()
            .text(),
    );
}


export function getViralAgendaMapRequest(
    eventUrl: string,
) {
    const pageUrl = new URL(eventUrl);

    return {
        url: `${pageUrl.origin}${pageUrl.pathname}/map`,
        method: 'POST' as const,
        form: {
            ajax: '1',
        },
        headers: {
            'x-requested-with':
                'XMLHttpRequest',
            referer: `${pageUrl.origin}/`,
            accept: 'application/json, text/javascript, */*; q=0.01',
        },
    };
}

export function parseViralAgendaCoordinatesResponse(
    statusCode: number,
    body: string,
): MapCoordinates | undefined {
    if (statusCode !== 200) {
        return undefined;
    }

    let data: ViralAgendaMapResponse;

    try {
        data = JSON.parse(body);
    } catch {
        return undefined;
    }

    const mapPage = data.events_pages?.[0];

    const latitude =
        asString(mapPage?.latitude);
    const longitude =
        asString(mapPage?.longitude);

    if (!latitude || !longitude) {
        return undefined;
    }

    return {
        latitude,
        longitude,
    };
}

export async function extractViralAgendaCoordinates(
    eventUrl: string,
    sendRequest: CheerioCrawlingContext['sendRequest'],
): Promise<MapCoordinates | undefined> {
    const request = getViralAgendaMapRequest(eventUrl);
    const response = await sendRequest<string>({
        ...request,
        throwHttpErrors: false,
    });

    return parseViralAgendaCoordinatesResponse(
        response.statusCode,
        response.body,
    );
}

function readCoordinatesFromMap(
    $: CheerioAPI,
): MapCoordinates | undefined {
    let coordinates: MapCoordinates | undefined;

    $('a[href]').each((_index, element) => {
        const href = asString($(element).attr('href'));

        if (!href) {
            return;
        }

        let mapUrl: URL;

        try {
            mapUrl = new URL(
                href,
                'https://www.viralagenda.com',
            );
        } catch {
            return;
        }

        const hostname = mapUrl.hostname.toLowerCase();
        const isGoogleMapsUrl =
            hostname === 'maps.google.com' ||
            hostname.startsWith('maps.google.') ||
            ((hostname === 'google.com' ||
                hostname.startsWith('www.google.')) &&
                mapUrl.pathname.startsWith('/maps'));

        if (!isGoogleMapsUrl) {
            return;
        }

        const rawCoordinates = mapUrl.searchParams.get('ll');
        const coordinateParts = rawCoordinates
            ?.split(',')
            .map((part) => part.trim());

        if (
            !coordinateParts ||
            coordinateParts.length < 2
        ) {
            return;
        }

        const latitude = coordinateParts[0];
        const longitude = coordinateParts[1];

        if (!latitude || !longitude) {
            return;
        }

        const latitudeNumber = Number(latitude);
        const longitudeNumber = Number(longitude);

        if (
            !Number.isFinite(latitudeNumber) ||
            !Number.isFinite(longitudeNumber) ||
            latitudeNumber < -90 ||
            latitudeNumber > 90 ||
            longitudeNumber < -180 ||
            longitudeNumber > 180
        ) {
            return;
        }

        coordinates = {
            latitude,
            longitude,
        };

        return false;
    });

    return coordinates;
}


function readLocation(
    value: unknown,
    $: CheerioAPI,
): ValidViralAgendaEvent['location'] | undefined {
    const locationValue = Array.isArray(value)
        ? value.find(isRecord)
        : value;

    if (!isRecord(locationValue)) {
        return undefined;
    }

    const name = asString(locationValue.name);
    const addressValue = locationValue.address;
    const addressObject = isRecord(addressValue)
        ? addressValue
        : {};

    const address = {
        addressLocality:
            asString(addressObject.addressLocality
            ),


        streetAddress: asString(
            addressObject.streetAddress,
        ),

        addressCountry: asString(
            addressObject.addressCountry,
        ),
    };

    const hasAddress = Boolean(
        address &&
        Object.values(address).some(Boolean),
    );

    if (!name && !hasAddress) {
        return undefined;
    }

    return {
        name,
        sameAs: asString(locationValue.sameAs),
        url: asString(locationValue.url),
        address: hasAddress ? address : undefined,
    };
}

function readImage(
    value: unknown,
): string | undefined {
    if (typeof value === 'string') {
        return asString(value);
    }

    if (Array.isArray(value)) {
        const firstImage = value.find(
            (item): item is string =>
                typeof item === 'string',
        );

        return asString(firstImage);
    }

    return undefined;
}

function readStringOrStrings(
    value: unknown,
): string | string[] | undefined {
    if (typeof value === 'string') {
        return asString(value);
    }

    if (Array.isArray(value)) {
        const values = value
            .map(asString)
            .filter(
                (item): item is string =>
                    Boolean(item),
            );

        return values.length === 1
            ? values[0]
            : values.length > 0
                ? values
                : undefined;
    }

    return undefined;
}

function readKeywordsFromPage(
    $: CheerioAPI,
): string[] | undefined {
    const keywords = new Map<string, string>();
    const tagLinkSelector =
        'a[href*="/pt/tags/"], a[href*="/pt/tag/"]';

    const addKeyword = (value: string | undefined) => {
        const keyword = value
            ?.replace(/^#+\s*/, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (!keyword) {
            return;
        }

        const key = keyword.toLocaleLowerCase('pt-PT');

        if (!keywords.has(key)) {
            keywords.set(key, keyword);
        }
    };

    const collectTagLinks = (selector: string) => {
        $(selector)
            .find(tagLinkSelector)
            .each((_index, element) => {
                addKeyword(asString($(element).text()));
            });
    };

    for (const selector of [
        '.viral-tags',
        '.event-node-tags',
        '.event-tags',
        '.event-node',
    ]) {
        collectTagLinks(selector);

        if (keywords.size > 0) {
            break;
        }
    }

    if (keywords.size === 0) {
        $('*')
            .filter((_index, element) => {
                if ($(element).children().length > 0) {
                    return false;
                }

                return asString($(element).text())
                    ?.toLocaleLowerCase('pt-PT') === 'tags';
            })
            .each((_index, element) => {
                $(element)
                    .parent()
                    .find(tagLinkSelector)
                    .each((_tagIndex, tagElement) => {
                        addKeyword(asString($(tagElement).text()));
                    });
            });
    }

    if (keywords.size === 0) {
        $('meta[name="keywords"], meta[property="article:tag"]')
            .each((_index, element) => {
                const content = asString($(element).attr('content'));

                content
                    ?.split(',')
                    .forEach((keyword) => {
                        addKeyword(keyword);
                    });
            });
    }

    return keywords.size > 0
        ? [...keywords.values()]
        : undefined;
}

function readSchemaAgent(
    value: unknown,
): SchemaAgent | undefined {
    if (typeof value === 'string') {
        const name = asString(value);
        return name ? { name } : undefined;
    }

    if (!isRecord(value)) {
        return undefined;
    }

    const name = asString(value.name);

    if (!name) {
        return undefined;
    }

    return {
        '@type': readType(value['@type']),
        name,
        url: asString(value.url),
        image: readImage(value.image),
        sameAs: readStringOrStrings(value.sameAs),
    };
}

function readSchemaAgents(
    value: unknown,
): SchemaAgent[] | undefined {
    const values = Array.isArray(value)
        ? value
        : [value];

    const agents = values
        .map(readSchemaAgent)
        .filter(
            (agent): agent is SchemaAgent =>
                Boolean(agent),
        );

    return agents.length > 0 ? agents : undefined;
}

function readSchemaAudience(
    value: unknown,
): SchemaAudience | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    return {
        '@type': readType(value['@type']),
        name: asString(value.name),
        audienceType: readStringOrStrings(
            value.audienceType,
        ),
    };
}

function readSchemaAudiences(
    value: unknown,
): SchemaAudience[] | undefined {
    const values = Array.isArray(value)
        ? value
        : [value];

    const audiences = values
        .map(readSchemaAudience)
        .filter(
            (audience): audience is SchemaAudience =>
                Boolean(audience),
        );

    return audiences.length > 0 ? audiences : undefined;
}

function readNumericPrice(
    value: unknown,
): number | undefined {
    if (typeof value === 'number') {
        return Number.isFinite(value) && value >= 0
            ? value
            : undefined;
    }

    const parsed = Number(
        asString(value)?.replace(',', '.'),
    );

    return Number.isFinite(parsed) && parsed >= 0
        ? parsed
        : undefined;
}

function readSchemaOffer(
    value: unknown,
): SchemaOffer | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const price = readNumericPrice(value.price);

    if (price === undefined) {
        return undefined;
    }

    return {
        '@type': readType(value['@type']),
        name: asString(value.name) ?? 'Bilhete',
        price,
        priceCurrency: asString(value.priceCurrency),
        availability: asString(value.availability),
        validFrom: asString(value.validFrom),
        url: asString(value.url),
    };
}

function readSchemaOffers(
    value: unknown,
): SchemaOffer[] | undefined {
    const values = Array.isArray(value)
        ? value
        : [value];

    const offers = values
        .map(readSchemaOffer)
        .filter(
            (offer): offer is SchemaOffer =>
                Boolean(offer),
        );

    return offers.length > 0 ? offers : undefined;
}

function readSchemaSchedule(
    value: unknown,
): SchemaSchedule | undefined {
    const schedule = Array.isArray(value)
        ? value.find(isRecord)
        : value;

    if (!isRecord(schedule)) {
        return undefined;
    }

    const startDate = asString(schedule.startDate);

    if (!startDate) {
        return undefined;
    }

    return {
        '@type': readType(schedule['@type']),
        startDate,
        endDate: asString(schedule.endDate),
        startTime: asString(schedule.startTime),
        endTime: asString(schedule.endTime),
        scheduleTimezone: asString(
            schedule.scheduleTimezone,
        ),
        byDay: readStringOrStrings(schedule.byDay),
    };
}


function toValidEvent(
    node: JsonObject,
    fallbackUrl: string,
    $: CheerioAPI,
): ValidViralAgendaEvent | null {
    if (!isEventNode(node)) {
        return null;
    }

    const name = asString(node.name);
    const startDate = asString(node.startDate);

    if (!name || !startDate) {
        return null;
    }

    const coordinates = readCoordinatesFromMap($);
    const structuredKeywords = readStringOrStrings(
        node.keywords,
    );


    return {
        '@type': readType(node['@type']),
        name,
        url: asString(node.url) ?? fallbackUrl,
        startDate,
        endDate: asString(node.endDate),
        description: asString(node.description),
        image: readImage(node.image),
        location: readLocation(node.location, $),
        municipality: readMunicipalityFromPage($),
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        organizer: readSchemaAgents(node.organizer),
        promoter: readSchemaAgents(node.promoter),
        maintainer: readSchemaAgents(node.maintainer),
        performer: readSchemaAgents(node.performer),
        funder: readSchemaAgents(node.funder),
        actor: readSchemaAgents(node.actor),
        director: readSchemaAgents(node.director),
        composer: readSchemaAgents(node.composer),
        alternateName: asString(node.alternateName),
        maximumAttendeeCapacity:
            asNonNegativeInteger(node.maximumAttendeeCapacity),
        isAccessibleForFree: typeof node.isAccessibleForFree === 'boolean' ? node.isAccessibleForFree : undefined,
        eventAttendanceMode: asString(node.eventAttendanceMode),
        eventStatus: asString(node.eventStatus),
        doorTime: asString(node.doorTime),
        duration: asString(node.duration),
        keywords:
            structuredKeywords ??
            readKeywordsFromPage($),
        offers: readSchemaOffers(node.offers),
        eventSchedule: readSchemaSchedule(node.eventSchedule),
        audience: readSchemaAudiences(node.audience),
    };
}

export function extractViralAgendaJsonLd(
    $: CheerioAPI,
    fallbackUrl: string,
): ValidViralAgendaEvent | null {
    const scripts = $(
        'script[type="application/ld+json"]',
    ).toArray();

    for (const script of scripts) {
        const scriptText = $(script).text().trim();

        if (!scriptText) {
            continue;
        }

        let parsed: unknown;

        try {
            parsed = JSON.parse(scriptText);
        } catch {
            continue;
        }

        const nodes = collectJsonLdNodes(parsed);

        for (const node of nodes) {
            const event = toValidEvent(
                node,
                fallbackUrl,
                $,
            );

            if (event) {
                return event;
            }
        }
    }

    return null;
}

/**
 * Extracts and normalizes a Viral Agenda event from HTML.
 *
 * Cheerio and Playwright deliberately use this same function. Playwright
 * only supplies the rendered `page.content()` and, when available, the same
 * map endpoint coordinates used by the Cheerio crawler.
 */
export function extractViralAgendaNormalizedEvent(
    $: CheerioAPI,
    fallbackUrl: string,
    coordinates?: MapCoordinates,
    timezone = 'Europe/Lisbon',
): NormalizedEvent | null {
    const extracted = extractViralAgendaJsonLd(
        $,
        fallbackUrl,
    );

    if (!extracted) {
        return null;
    }

    const normalized = normalizeViralAgendaEvent({
        ...extracted,
        ...(coordinates
            ? {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
            }
            : {}),
    });

    return normalizeViralAgendaDates(
        normalized,
        timezone,
    );
}
