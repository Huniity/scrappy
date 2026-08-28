

/**
 * Schema for the JSON-LD structure of a ViralAgenda event.
 * This schema defines the expected properties and their types for a ViralAgenda event,
 * including details about the event, its location, audience, organizers, and other related entities.
 * It is used for validation and type inference in TypeScript.
 */
export type ViralAgendaJsonLd = {
    '@type'?: string | string[];
    name?: string;
    alternateName?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    image?: string;
    isAccessibleForFree?: boolean;
    eventAttendanceMode?: string;
    eventStatus?: string;
    doorTime?: string;
    duration?: string;
    keywords?: string | string[];
    location?: {
        name?: string;
        sameAs?: string;
        url?: string;
        address?: {
            addressLocality?: string;
            streetAddress?: string;
            addressCountry?: string;
        };
    };
    audience?: OneOrMany<SchemaAudience>;
    organizer?: OneOrMany<SchemaAgent>;
    promoter?: OneOrMany<SchemaAgent>;
    maintainer?: OneOrMany<SchemaAgent>;
    performer?: OneOrMany<SchemaAgent>;
    funder?: OneOrMany<SchemaAgent>;
    actor?: OneOrMany<SchemaAgent>;
    director?: OneOrMany<SchemaAgent>;
    composer?: OneOrMany<SchemaAgent>;
    offers?: OneOrMany<SchemaOffer>;
    eventSchedule?: OneOrMany<SchemaSchedule>;

};

/**
 * Schema for a valid ViralAgenda event, which extends the ViralAgendaJsonLd schema.
 * This schema includes additional required fields such as name, url, and startDate,
 * as well as optional fields for municipality, latitude, and longitude.
 * It is used for validation and type inference in TypeScript.
 */
export type ValidViralAgendaEvent = ViralAgendaJsonLd & {
    name: string;
    url: string;
    startDate: string;
    municipality?: string;
    latitude?: string;
    longitude?: string;
};

/**
 * Schema for normalized event data, which represents a standardized structure for event information.
 * This schema includes fields for title, description, source URL, start and end dates, event type,
 * location information, image URL, keywords, price, age rating, maximum attendee capacity,
 * latitude and longitude. It also includes nested schemas for agents, audiences, offers, and schedules.
 * It is used for validation and type inference in TypeScript.
 */
export type NormalizedEvent = {
    title: string;
    alternateName?: string;
    sourceUrl: string;
    startDate: string;
    endDate?: string;
    description?: string;
    imageUrl?: string;
    type?: string;
    isAccessibleForFree?: boolean;
    venueName?: string;
    locality?: string;
    municipality?: string;
    streetAddress?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
    organizer?: NormalizedAgent[];
    promoter?: NormalizedAgent[];
    maintainer?: NormalizedAgent[];
    performers?: NormalizedAgent[];
    funder?: NormalizedAgent[];
    actor?: NormalizedAgent[];
    director?: NormalizedAgent[];
    composer?: NormalizedAgent[];
    price?: number;
    ageRating?: number;
    maximumAttendeeCapacity?: number;
    audience?: NormalizedAudience[];
    eventStatus?: string;
    eventAttendanceMode?: string;
    doorTime?: string;
    duration?: string;
    keywords?: string[];
    offers?: NormalizedOffer[];
    schedule?: NormalizedSchedule;
};

/**
 * Schema for a single agent (e.g., an organizer, promoter, etc.)
 * This schema defines the expected properties and their types for an agent,
 * including name, type, URL, image, and sameAs. It is used for validation and type inference in TypeScript.
 */
export type SchemaAgent = {
    '@type'?: string | string[];
    name?: string;
    url?: string;
    image?: string;
    sameAs?: string | string[];
};

/**
 * Schema for a single audience (e.g., a target audience for the event)
 * This schema defines the expected properties and their types for an audience,
 * including name and audienceType. It is used for validation and type inference in TypeScript.
 */
export type OneOrMany<T> = T | T[];

/**
 * Schema for a single audience (e.g., a target audience for the event)
 * This schema defines the expected properties and their types for an audience,
 * including name and audienceType. It is used for validation and type inference in TypeScript.
 */
export type NormalizedAgent = {
    name: string;
    type?: string;
    url?: string;
    image?: string;
    sameAs?: string;
};

/**
 * Schema for a single offer (e.g., a ticket or admission)
 * This schema defines the expected properties and their types for an offer,
 * including name, price, priceCurrency, availability, validFrom, and URL.
 * It is used for validation and type inference in TypeScript.
 */
export type NormalizedOffer = {
    name: string;
    price: number;
    priceCurrency?: string;
    availability?: string;
    validFrom?: string;
    url?: string;
};

/**
 * Schema for a single schedule (e.g., the timing of the event)
 * This schema defines the expected properties and their types for a schedule,
 * including startDate, endDate, startTime, endTime, timeZone, and repeatDays.
 * It is used for validation and type inference in TypeScript.
 */
export type NormalizedSchedule = {
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    timeZone?: string;
    repeatDays?: string[];
};

/**
 * Schema for a single audience (e.g., a target audience for the event)
 * This schema defines the expected properties and their types for an audience,
 * including name and audienceType. It is used for validation and type inference in TypeScript.
 */
export type SchemaAudience = {
    '@type'?: string | string[];
    name?: string;
    audienceType?: string | string[];
}

/**
 * Schema for a single coordinate (latitude or longitude)
 * This schema defines the expected properties and their types for a coordinate,
 * including latitude and longitude. It is used for validation and type inference in TypeScript.
 */
export type NormalizedAudience = {
    name: string;
    type?: string;
    audienceType?: string;
}

/**
 * Schema for a single coordinate (latitude or longitude)
 * This schema defines the expected properties and their types for a coordinate,
 * including latitude and longitude. It is used for validation and type inference in TypeScript.
 */
export type SchemaOffer = {
    '@type'?: string | string[];
    name?: string;
    price?: string | number;
    priceCurrency?: string;
    availability?: string;
    validFrom?: string;
    url?: string;
};

/**
 * Schema for a single coordinate (latitude or longitude)
 * This schema defines the expected properties and their types for a coordinate,
 * including latitude and longitude. It is used for validation and type inference in TypeScript.
 */
export type SchemaSchedule = {
    '@type'?: string | string[];
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    scheduleTimezone?: string;
    byDay?: string | string[];
};