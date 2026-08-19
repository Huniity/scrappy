export type ViralAgendaJsonLd = {
    '@type'?: string;
    name?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    image?: string;

    location?: {
        name?: string;

        address?: {
            addressLocality?: string;
            streetAddress?: string;
            addressCountry?: string;
        };
    };
};

export type ValidViralAgendaEvent = ViralAgendaJsonLd & {
    name: string;
    url: string;
    startDate: string;
};

export type NormalizedEvent = {
    title: string;
    sourceUrl: string;
    startDate: string;
    endDate?: string;
    description?: string;
    imageUrl?: string;
    type?: string;
    venueName?: string;
    locality?: string;
    streetAddress?: string;
    country?: string;
    latitude?: string;
    longitude?: string;
};