import type { CheerioAPI } from 'cheerio';
import type { ValidViralAgendaEvent } from '../../src/types/events';

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

function readLocation(
    value: unknown,
): ValidViralAgendaEvent['location'] | undefined {
    const locationValue = Array.isArray(value)
        ? value.find(isRecord)
        : value;

    if (!isRecord(locationValue)) {
        return undefined;
    }

    const name = asString(locationValue.name);
    const addressValue = locationValue.address;

    const address = isRecord(addressValue)
        ? {
            addressLocality: asString(
                addressValue.addressLocality,
            ),
            streetAddress: asString(
                addressValue.streetAddress,
            ),
            addressCountry: asString(
                addressValue.addressCountry,
            ),
        }
        : undefined;

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
): ValidViralAgendaEvent | null {
    if (!isEventNode(node)) {
        return null;
    }

    const name = asString(node.name);
    const startDate = asString(node.startDate);

    if (!name || !startDate) {
        return null;
    }

    return {
        '@type': readType(node['@type']),
        name,
        url: asString(node.url) ?? fallbackUrl,
        startDate,
        endDate: asString(node.endDate),
        description: asString(node.description),
        image: readImage(node.image),
        location: readLocation(node.location),
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
            );

            if (event) {
                return event;
            }
        }
    }

    return null;
}