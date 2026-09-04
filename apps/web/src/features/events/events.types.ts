export type EventView = 'map' | 'list';

export type PriceFilter = 'all' | 'free' | 'paid';

export type PublishedFilter = 'all' | 'published' | 'unpublished';

export type ActivePanel = 'actions' | 'details';

export type SortOption =
    | 'date-asc'
    | 'date-desc'
    | 'price-asc'
    | 'price-desc'
    | 'title-asc'
    | 'title-desc';

export type EventEntity = {
    type?: string | null;
    name?: string | null;
    url?: string | null;
    sameAs?: string | null;
    imageUrl?: string | null;
};

export type EventAudience = {
    name?: string | null;
    audienceType?: string | null;
};

export type EventSchedule = {
    startDate?: string | null;
    endDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    timeZone?: string | null;
    repeatDays?: string[] | null;
};

export type EventOffer = {
    name?: string | null;
    price: number | null;
    priceCurrency?: string | null;
    availability?: string | null;
    url?: string | null;
    validFrom?: string | null;
};

export type EventLocation = {
    name: string;
    streetAddress?: string | null;
    postalCode?: string | null;
    locality: string;
    district: string;
    region: string;
    country?: string | null;
    dicoCode?: string | null;
    url?: string | null;
    sameAs?: string | null;
    latitude?: number | null;
    longitude?: number | null;
};

export type EventItem = {
    id: string;
    title: string;
    description: string;
    alternateName?: string | null;
    startDate: string;
    endDate: string | null;
    duration?: string | null;
    doorTime?: string | null;
    qualityScore?: number;
    status?: string | null;
    location: EventLocation;
    sourceUrl: string;
    sourceUrls: string[];
    type: string;
    imageUrl: string | null;
    isPublished?: boolean | null;
    isFinished?: boolean | null;
    isAccessibleForFree?: boolean | null;
    physicalAccessibility?: boolean;
    ageRating?: number | null;
    maximumAttendeeCapacity?: number | null;
    keywords: string[];
    organizer: EventEntity[];
    promoter: EventEntity[];
    performers: EventEntity[];
    maintainer: EventEntity[];
    funder: EventEntity[];
    actor: EventEntity[];
    director: EventEntity[];
    composer: EventEntity[];
    audience: EventAudience[];
    attendanceMode?: string | null;
    schedule?: EventSchedule | null;
    offers: EventOffer[];
};

export type EventRecord = {
    id: string;
    district: string;
    event: EventItem;
};
