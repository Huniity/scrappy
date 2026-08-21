

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
 * Normalizes a viral agenda event by cleaning up its text fields.
 * @param data The event data to normalize.
 * @returns The normalized event object.
 */
export function normalizeViralAgendaEvent(
    data: ValidViralAgendaEvent
): NormalizedEvent {
    return {
        title: cleanText(data.name) ?? data.name,
        sourceUrl: data.url,
        startDate: data.startDate,
        endDate: data.endDate,
        description: cleanText(data.description),
        imageUrl: data.image,
        type: data['@type'],

        venueName: cleanText(data.location?.name),

        locality:
            cleanText(data.location?.address?.addressLocality),

        streetAddress:
            cleanText(data.location?.address?.streetAddress),

        country:
            cleanText(data.location?.address?.addressCountry),
    };
}