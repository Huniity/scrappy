

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

};

export type ValidViralAgendaEvent = ViralAgendaJsonLd & {
    name: string;
    url: string;
    startDate: string;
    municipality?: string;
    latitude?: string;
    longitude?: string;
};

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

export type SchemaAgent = {
    '@type'?: string | string[];
    name?: string;
    url?: string;
    image?: string;
    sameAs?: string | string[];
};

export type OneOrMany<T> = T | T[];

export type NormalizedAgent = {
    name: string;
    type?: string;
    url?: string;
    image?: string;
    sameAs?: string;
};

export type NormalizedOffer = {
    name: string;
    price: number;
    priceCurrency?: string;
    availability?: string;
    validFrom?: string;
    url?: string;
};

export type NormalizedSchedule = {
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    timeZone?: string;
    repeatDays?: string[];
};

export type SchemaAudience = {
    '@type'?: string | string[];
    name?: string;
    audienceType?: string | string[];
}

export type NormalizedAudience = {
    name: string;
    type?: string;
    audienceType?: string;
}