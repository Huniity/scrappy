

import type { CheerioAPI } from 'cheerio';
import type {
    BolJsonLdEvent,
    BolJsonLdLocation,
    BolJsonLdOffer,
    JsonObject,
    BolCoordinates,
} from './types';
import type { NormalizedEvent } from '../../src/types/normalizedEvent';
import { normalizeBolEvent } from '../../src/normalization/bol';


function isRecord(value: unknown): value is
    JsonObject {
    return typeof value === 'object' &&
        value !== null;
}

function asString(value: unknown): string |
    undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const result = value.trim();

    return result.length > 0 ? result :
        undefined;
}

function validateCoordinates(
    latitude: string | undefined,
    longitude: string | undefined,
): BolCoordinates | undefined {
    if (!latitude || !longitude) {
        return undefined;
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
        return undefined;
    }

    return {
        latitude,
        longitude,
    };
}

function parseCoordinatePair(
    value: string | undefined,
): BolCoordinates | undefined {
    if (!value) {
        return undefined;
    }

    let decoded = value;

    try {
        decoded = decodeURIComponent(value);
    } catch {
        // mantém o valor original
    }

    const patterns = [
        /(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/,
        /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
        /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    ];

    for (const pattern of patterns) {
        const match = decoded.match(pattern);

        if (!match) {
            continue;
        }

        const coordinates = validateCoordinates(
            match[1],
            match[2],
        );

        if (coordinates) {
            return coordinates;
        }
    }

    return undefined;
}

function readCoordinatesFromIframe(
    $: CheerioAPI,
): BolCoordinates | undefined {
    let coordinates: BolCoordinates | undefined;

    $('iframe[src]').each((_index, element) => {
        if (coordinates) {
            return false;
        }

        const source = asString(
            $(element).attr('src'),
        );

        if (!source) {
            return;
        }

        let iframeUrl: URL;

        try {
            iframeUrl = new URL(
                source,
                'https://www.bol.pt',
            );
        } catch {
            return;
        }

        for (const parameter of [
            'q',
            'll',
            'center',
            'query',
            'destination',
        ]) {
            coordinates = parseCoordinatePair(
                iframeUrl.searchParams.get(parameter)
                ?? undefined,
            );

            if (coordinates) {
                return false;
            }
        }

        coordinates =
            parseCoordinatePair(iframeUrl.href);

        return false;
    });

    return coordinates;
}

function readType(value: unknown): string |
    undefined {
    if (typeof value === 'string') {
        return asString(value);
    }

    if (Array.isArray(value)) {
        return value.find(
            (item): item is string =>
                typeof item === 'string' && item.trim().length > 0,
        );
    }

    return undefined;
}

function readImage(value: unknown): string
    | undefined {
    if (typeof value === 'string') {
        return asString(value);
    }

    if (Array.isArray(value)) {
        return value.find(
            (item): item is string =>
                typeof item === 'string' && item.trim().length > 0,
        );
    }

    return undefined;
}

function readStringOrStrings(
    value: unknown,
): string | string[] | undefined {
    if (typeof value === 'string') {
        return asString(value);
    }

    if (!Array.isArray(value)) {
        return undefined;
    }

    const values = value
        .map(asString)
        .filter(
            (item): item is string => item !== undefined,
        );

    if (values.length === 0) {
        return undefined;
    }

    return values.length === 1 ? values[0] : values;
}

function collectJsonLdNodes(value: unknown): JsonObject[] {
    if (Array.isArray(value)) {
        return value.flatMap(collectJsonLdNodes);
    }

    if (!isRecord(value)) {
        return [];
    }

    if (value['@graph'] !== undefined) {
        return collectJsonLdNodes(value['@graph']);
    }

    return [value];
}

function isEventNode(node: JsonObject):
    boolean {
    const type = node['@type'];

    const types = Array.isArray(type)
        ? type.filter(
            (item): item is string => typeof item === 'string',
        )
        : typeof type === 'string' ? [type] : [];

    return types.some(
        (item) => item.toLowerCase() === 'event',
    );
}

function readLocation(value: unknown): BolJsonLdLocation | undefined {
    const locationValue =
        Array.isArray(value) ? value.find(isRecord) : value;

    if (!isRecord(locationValue)) {
        return undefined;
    }

    const addressValue =
        isRecord(locationValue.address) ? locationValue.address : undefined;

    const geoValue =
        isRecord(locationValue.geo) ? locationValue.geo : undefined;

    const location: BolJsonLdLocation = {
        '@type': readType(locationValue['@type']),
        name: asString(locationValue.name),
        url: asString(locationValue.url),
        geo: geoValue
            ? {
                latitude:
                    typeof
                        geoValue.latitude === 'number' ? geoValue.latitude : asString(geoValue.latitude),
                longitude:
                    typeof
                        geoValue.longitude === 'number' ? geoValue.longitude : asString(geoValue.longitude),
            }
            : undefined,
        address: addressValue
            ? {
                streetAddress:
                    asString(addressValue.streetAddress),

                postalCode:
                    asString(addressValue.postalCode),

                addressLocality:
                    asString(addressValue.addressLocality),

                addressCountry:
                    asString(addressValue.addressCountry),
            }
            : undefined,
    };

    const hasData =
        location.name ||
        location.url ||
        location.geo?.latitude ||
        location.geo?.longitude ||
        location.address?.streetAddress ||
        location.address?.postalCode ||
        location.address?.addressLocality;

    return hasData ? location : undefined;
}

function readOffer(
    value: unknown,
): BolJsonLdOffer | undefined {
    if (!isRecord(value)) {
        return undefined;
    }

    const price = typeof value.price === 'number' ? value.price : asString(value.price);

    const offer: BolJsonLdOffer = {
        '@type': readType(value['@type']),
        availability: asString(value.availability),
        url: asString(value.url),
        price,
        priceCurrency: asString(value.priceCurrency),
    };

    return offer.price !== undefined ? offer : undefined;
}

function readOffers(value: unknown): BolJsonLdOffer[] | undefined {
    const values = Array.isArray(value) ? value : [value];

    const offers = values
        .map(readOffer)
        .filter(
            (offer): offer is BolJsonLdOffer => offer !== undefined,
        );

    return offers.length > 0 ? offers : undefined;
}

function toBolEvent(
    node: JsonObject,
    fallbackUrl: string,
    $: CheerioAPI
): BolJsonLdEvent | null {
    if (!isEventNode(node)) {
        return null;
    }

    const name = asString(node.name);
    const startDate = asString(node.startDate);

    if (!name || !startDate) {
        return null;
    }

    const location = readLocation(node.location);
    const iframeCoordinates =
        readCoordinatesFromIframe($);

    const latitude =
        location?.geo?.latitude ??
        iframeCoordinates?.latitude;

    const longitude =
        location?.geo?.longitude ??
        iframeCoordinates?.longitude;

    const locationWithCoordinates =
        location || latitude || longitude
            ? {
                ...location,
                geo: latitude || longitude
                    ? {
                        latitude,
                        longitude,
                    }
                    : undefined,
            }
            : undefined;

    return {
        '@context': asString(node['@context']),
        '@type': readType(node['@type']),
        productID: asString(node.productID),
        name,
        url: asString(node.url) ?? fallbackUrl,
        image: readImage(node.image),
        startDate,
        endDate: asString(node.endDate),
        duration: asString(node.duration),
        description: asString(node.description),
        performers: readStringOrStrings(node.performers),
        location: locationWithCoordinates,
        offers: readOffers(node.offers),
    };
}

export function extractBolJsonLd(
    $: CheerioAPI,
    fallbackUrl: string,
): BolJsonLdEvent | null {
    const scripts = $(
        'script[type="application/ld+json"]',
    ).toArray();

    for (const script of scripts) {
        const scriptText = $(script)
            .text()
            .trim();

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
            const event = toBolEvent(node, fallbackUrl, $);

            if (event) {
                return event;
            }
        }
    }

    return null;
}

export function extractBolDescription(
    $: CheerioAPI,
): string | undefined {
    const metaDescription = asString(
        $('meta[name="description"]')
            .attr('content'),
    );

    if (metaDescription) {
        return metaDescription;
    }

    for (const selector of [
        '[itemprop="description"]',
        '.event-description',
        '.event-description',
        '.description',
        '.descricao',
    ]) {
        const description = asString(
            $(selector)
                .first()
                .text(),
        );

        if (description) {
            return description;
        }
    }

    return undefined;
}

/**
 * Extracts and normalizes a BOL event from HTML.
 *
 * This is intentionally shared by Cheerio and the Playwright fallback so
 * both paths produce the same normalized event shape and values.
 */
export function extractBolNormalizedEvent(
    $: CheerioAPI,
    fallbackUrl: string,
): NormalizedEvent | null {
    const extracted = extractBolJsonLd($, fallbackUrl);

    if (!extracted) {
        return null;
    }

    return normalizeBolEvent({
        ...extracted,
        description:
            extracted.description ??
            extractBolDescription($),
    });
}
