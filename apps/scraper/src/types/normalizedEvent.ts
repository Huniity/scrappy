

import { NormalizedAgent } from "./agent";
import { NormalizedAudience } from "./audience";
import { NormalizedOffer } from "./offer";
import { NormalizedSchedule } from "./schedule";


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
    locationUrl?: string;
    locationSameAs?: string;
    locality?: string;
    municipality?: string;
    streetAddress?: string;
    postalCode?: string;
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