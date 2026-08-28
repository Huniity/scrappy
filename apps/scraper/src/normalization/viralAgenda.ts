

import { type NormalizedEvent, type ValidViralAgendaEvent} from "../types/events";

/**
 * Cleans up text by removing HTML tags and extra whitespace.
 * @param value The string to clean.
 * @returns The cleaned string, or undefined if the input is undefined or empty after cleaning.
 */
function cleanText(value: string | undefined): string | undefined {
    if (!value) {
        return undefined;
    }

    const result = value
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    return result ? result : undefined;
}

/**
 * Limits the length of a string, appending an ellipsis if it exceeds the maximum length.
 * @param value The string to limit.
 * @param maxLength The maximum length of the string.
 * @returns The limited string, or undefined if the input is undefined or empty after limiting.
 */
function limitText(
    value: string | undefined,
    maxLength: number,
): string | undefined {
    if (!value) {
        return undefined;
    }

    if (value.length <= maxLength) {
        return value;
    }

    return `${value.slice(0, maxLength - 1).trim()}…`;
}


/**
 * Normalizes a viral agenda event by cleaning up its text fields.
 * @param data The event data to normalize.
 * @returns The normalized event object.
 */
export function normalizeViralAgendaEvent(
    data: ValidViralAgendaEvent
): NormalizedEvent {

    const rawType = data['@type'];

    const normalizedType = Array.isArray(rawType)
        ? rawType[0]
        : rawType;

    return {
        title: cleanText(data.name) ?? data.name,
        sourceUrl: data.url,
        startDate: data.startDate,
        endDate: data.endDate,
        description: limitText(cleanText(data.description), 2000),
        imageUrl: data.image,
        type: normalizedType,

        venueName: cleanText(data.location?.name),

        municipality: 
            cleanText(data.municipality),

        locality:
            cleanText(data.location?.address?.addressLocality),

        streetAddress:
            cleanText(data.location?.address?.streetAddress),

        country:
            cleanText(data.location?.address?.addressCountry),

        latitude:
            data.latitude,

        longitude:
            data.longitude,
    };
}
