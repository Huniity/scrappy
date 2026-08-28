

import {
    type NormalizedEvent,
    type NormalizedAgent,
    type NormalizedAudience,
    type NormalizedOffer,
    type NormalizedSchedule,
    type SchemaAgent,
    type SchemaAudience,
    type SchemaOffer,
    type SchemaSchedule,
    type ValidViralAgendaEvent,
} from "../types/events";


/**
 * Normalizes a viral agenda event by cleaning up its text fields.
 * @param data The event data to normalize.
 * @returns The normalized event object.
 */
function firstString(
    value: string | string[] | undefined,
): string | undefined {
    const selected = Array.isArray(value) ? value[0] : value;

    return cleanText(selected);
}

/**
 * Converts a value that can be a single item or an array of items into an array.
 * @param value The value to convert.
 * @returns An array containing the value(s).
 */
function asArray<T>(
    value: T | T[] | undefined,
): T[] {
    if (value === undefined) {
        return [];
    }

    return Array.isArray(value) ? value : [value];
}

/**
 * Normalizes a schema agent into a normalized agent.
 * @param agent The schema agent to normalize.
 * @returns The normalized agent, or undefined if the agent is invalid.
 */
function normalizeAgent(
    agent: SchemaAgent,
): NormalizedAgent | undefined {
    const name = cleanText(agent.name);

    if (!name) {
        return undefined;
    }

    return {
        name,
        type: firstString(agent['@type']),
        url: cleanText(agent.url),
        image: cleanText(agent.image),
        sameAs: firstString(agent.sameAs),
    };
}

/**
 * Normalizes an array of schema agents into an array of normalized agents.
 * @param agents The schema agents to normalize.
 * @returns An array of normalized agents.
 */
function normalizeAgents(
    agents: SchemaAgent | SchemaAgent[] | undefined,
): NormalizedAgent[] {
    return asArray(agents)
        .map(normalizeAgent)
        .filter(
            (agent): agent is NormalizedAgent =>
                Boolean(agent),
        );
}

/**
 * Normalizes a schema audience into a normalized audience.
 * @param audience The schema audience to normalize.
 * @returns The normalized audience, or undefined if the audience is invalid.
 */
function normalizeAudience(
    audience: SchemaAudience,
): NormalizedAudience | undefined {
    const audienceType = firstString(audience.audienceType);

    const name = cleanText(audience.name) ?? audienceType;

    if (!name) {
        return undefined;
    }

    return {
        name,
        type: firstString(audience['@type']),
        audienceType,
    };
}

/**
 * Normalizes an array of schema audiences into an array of normalized audiences.
 * @param audiences The schema audiences to normalize.
 * @returns An array of normalized audiences.
 */
function normalizeAudiences(
    audiences: SchemaAudience | SchemaAudience[] |
        undefined,
): NormalizedAudience[] {
    return asArray(audiences)
        .map(normalizeAudience)
        .filter(
            (audience): audience is NormalizedAudience => Boolean(audience),
        );
}

/**
 * Normalizes a schema offer into a normalized offer.
 * @param offer The schema offer to normalize.
 * @returns The normalized offer, or undefined if the offer is invalid.
 */
function normalizeOffer(
    offer: SchemaOffer,
): NormalizedOffer | undefined {
    const price = typeof offer.price === 'number' ? offer.price : Number
        (
            cleanText(offer.price)
                ?.replace(',', '.'),
        );

    if (!Number.isFinite(price) || price < 0) {
        return undefined;
    }

    return {
        name: cleanText(offer.name) ?? 'Bilhete',
        price,
        priceCurrency: cleanText(offer.priceCurrency) ?.toUpperCase() ?? 'EUR',
        availability: cleanText(offer.availability),
        validFrom: cleanText(offer.validFrom),
        url: cleanText(offer.url),
    };
}

/**
 * Normalizes an array of schema offers into an array of normalized offers.
 * @param offers The schema offers to normalize.
 * @returns An array of normalized offers.
 */
function normalizeOffers(
    offers: SchemaOffer | SchemaOffer[] | undefined,
): NormalizedOffer[] {
    return asArray(offers)
        .map(normalizeOffer)
        .filter(
            (offer): offer is NormalizedOffer => Boolean(offer),
        );
}

/**
 * Normalizes a schema schedule into a normalized schedule.
 * @param schedule The schema schedule to normalize.
 * @returns The normalized schedule, or undefined if the schedule is invalid.
 */
function normalizeSchedule(
    schedule: SchemaSchedule | SchemaSchedule[] |
        undefined,
): NormalizedSchedule | undefined {
    const value = asArray(schedule)[0];

    if (!value?.startDate) {
        return undefined;
    }

    const repeatDays = asArray(value.byDay)
        .map((day) => cleanText(day) ?.replace('https://schema.org/', ''),
        )
        .filter(
            (day): day is string => Boolean(day),
        );

    return {
        startDate: value.startDate,
        endDate: value.endDate,
        startTime: value.startTime,
        endTime: value.endTime,
        timeZone: value.scheduleTimezone,
        repeatDays:
            repeatDays.length > 0
                ? repeatDays
                : undefined,
    };
}

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

        alternateName:
            cleanText(data.alternateName),

        isAccessibleForFree:
            data.isAccessibleForFree,

        eventAttendanceMode:
            cleanText(data.eventAttendanceMode),
            
        eventStatus:
            cleanText(data.eventStatus),

        doorTime:
            cleanText(data.doorTime),
            
        duration:
            cleanText(data.duration),

        keywords:
            asArray(data.keywords)
                .map(cleanText)
                .filter(
                    (keyword): keyword is string =>
                        Boolean(keyword),
                ),
        
        offers:
            normalizeOffers(data.offers),

        schedule:
            normalizeSchedule(data.eventSchedule),
        
        audience:
            normalizeAudiences(data.audience),
    
        
        organizer:
            normalizeAgents(data.organizer),

        promoter:
            normalizeAgents(data.promoter),

        maintainer:
            normalizeAgents(data.maintainer),

        performers:
            normalizeAgents(data.performer),

        funder:
            normalizeAgents(data.funder),

        actor:
            normalizeAgents(data.actor),

        director:
            normalizeAgents(data.director),

        composer:
            normalizeAgents(data.composer),

    };
}
