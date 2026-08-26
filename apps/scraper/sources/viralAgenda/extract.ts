
import type { CheerioAPI } from 'cheerio';
import type { CheerioCrawlingContext } from 'crawlee';
import type { ValidViralAgendaEvent } from '../../src/types/events';


type ViralAgendaMapResponse = {
    events_pages?: Array<{
        latitude?: unknown;
        longitude?: unknown;
    }>;
}

type MapCoordinates = {
    latitude: string;
    longitude: string;
};


type JsonObject = Record<string, unknown>;

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


export async function extractViralAgendaCoordinates(
        eventUrl: string,
        sendRequest: CheerioCrawlingContext['sendRequest'],
    ): Promise<MapCoordinates | undefined> {
    const pageUrl = new URL(eventUrl);

    const mapUrl =`${pageUrl.origin}${pageUrl.pathname}/map`;

    const response = await sendRequest<string>({
        url: mapUrl,
        method: 'POST',
        form: {
            ajax: '1',
        },
        headers: {
            'x-requested-with':
                'XMLHttpRequest',
            referer: `${pageUrl.origin}/`,
            accept: 'application/json, text/javascript, */*; q=0.01',
        },
        throwHttpErrors: false,
    });

    if (response.statusCode !== 200) {
        return undefined;
    }

    let data: ViralAgendaMapResponse;

    try {
        data = JSON.parse(response.body);
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
