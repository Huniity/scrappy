

import { SchemaAgent } from "./agent";
import { SchemaAudience } from "./audience";
import { SchemaOffer } from "./offer";
import { SchemaSchedule } from "./schedule";



/**
 * Schema for a single audience (e.g., a target audience for the event)
 * This schema defines the expected properties and their types for an audience,
 * including name and audienceType. It is used for validation and type inference in TypeScript.
 */
export type OneOrMany<T> = T | T[];

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