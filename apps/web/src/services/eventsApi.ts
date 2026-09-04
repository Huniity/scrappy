import type {
    EventAudience,
    EventEntity,
    EventItem,
    EventLocation,
    EventOffer,
    EventRecord,
    EventSchedule,
    PriceFilter,
    PublishedFilter,
    SortOption,
} from '../features/events/events.types';

const apiBaseUrl = (
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
).replace(/\/$/, '');
const pageSize = 100;

type ApiCodeName = {
    code?: string | null;
    name?: string | null;
} | string | null;

type ApiLocation = Omit<Partial<EventLocation>, 'region'> & {
    region?: ApiCodeName;
};

type ApiEvent = Omit<Partial<EventItem>, 'location' | 'offers'> & {
    id: string;
    title: string;
    startDate: string;
    location?: ApiLocation | null;
    offers?: EventOffer[] | null;
    organizer?: EventEntity[] | null;
    promoter?: EventEntity[] | null;
    performers?: EventEntity[] | null;
    maintainer?: EventEntity[] | null;
    funder?: EventEntity[] | null;
    actor?: EventEntity[] | null;
    director?: EventEntity[] | null;
    composer?: EventEntity[] | null;
    audience?: EventAudience[] | null;
    schedule?: EventSchedule | null;
};

type ApiDistrictEvent = {
    id: string;
    district?: string | null;
    event: ApiEvent;
};

type ApiEventsResponse = {
    items?: ApiDistrictEvent[];
    totalCount?: number;
};

export type EventSearchFilters = {
    municipality: string;
    publishedFilter?: PublishedFilter;
    startDate?: string;
    endDate?: string;
    priceFilter?: PriceFilter;
    searchTerm?: string;
    sortOption?: SortOption;
    signal?: AbortSignal;
};

function getRegionValue(region: ApiCodeName | undefined) {
    if (!region) {
        return '';
    }

    if (typeof region === 'string') {
        return region;
    }

    return region.code ?? region.name ?? '';
}

function mapEvent(item: ApiDistrictEvent): EventRecord {
    const apiEvent = item.event;
    const location = apiEvent.location;

    return {
        id: item.id,
        district: location?.district ?? item.district ?? '',
        event: {
            id: apiEvent.id,
            title: apiEvent.title,
            description: apiEvent.description ?? '',
            alternateName: apiEvent.alternateName ?? '',
            startDate: apiEvent.startDate,
            endDate: apiEvent.endDate ?? null,
            duration: apiEvent.duration ?? null,
            doorTime: apiEvent.doorTime ?? null,
            qualityScore: apiEvent.qualityScore ?? 0,
            status: apiEvent.status ?? '',
            isFinished: apiEvent.isFinished ?? false,
            retentionUntil: apiEvent.retentionUntil ?? null,
            location: {
                name: location?.name ?? '',
                streetAddress: location?.streetAddress ?? null,
                postalCode: location?.postalCode ?? null,
                locality: location?.locality ?? '',
                district: location?.district ?? item.district ?? '',
                region: getRegionValue(location?.region),
                country: location?.country ?? 'PT',
                dicoCode: location?.dicoCode ?? null,
                url: location?.url ?? null,
                sameAs: location?.sameAs ?? null,
                latitude: location?.latitude ?? null,
                longitude: location?.longitude ?? null,
            },
            sourceUrl: apiEvent.sourceUrl ?? '',
            sourceUrls: apiEvent.sourceUrls ?? [],
            type: apiEvent.type ?? 'Outro',
            imageUrl: apiEvent.imageUrl ?? null,
            isPublished: apiEvent.isPublished ?? null,
            isAccessibleForFree: apiEvent.isAccessibleForFree ?? null,
            physicalAccessibility: apiEvent.physicalAccessibility ?? false,
            ageRating: apiEvent.ageRating ?? null,
            maximumAttendeeCapacity: apiEvent.maximumAttendeeCapacity ?? null,
            keywords: apiEvent.keywords ?? [],
            organizer: apiEvent.organizer ?? [],
            promoter: apiEvent.promoter ?? [],
            performers: apiEvent.performers ?? [],
            maintainer: apiEvent.maintainer ?? [],
            funder: apiEvent.funder ?? [],
            actor: apiEvent.actor ?? [],
            director: apiEvent.director ?? [],
            composer: apiEvent.composer ?? [],
            audience: apiEvent.audience ?? [],
            attendanceMode: apiEvent.attendanceMode ?? null,
            schedule: apiEvent.schedule ?? null,
            offers: apiEvent.offers ?? [],
        },
    };
}

function createParams(filters: EventSearchFilters, page: number) {
    const params = new URLSearchParams({
        Locality: filters.municipality,
        Page: String(page),
        PageSize: String(pageSize),
        SortBy: 'date_asc',
    });

    if (filters.publishedFilter === 'published') {
        params.set('IsPublished', 'true');
    }

    if (filters.publishedFilter === 'unpublished') {
        params.set('IsPublished', 'false');
    }

    if (filters.startDate) {
        params.set('StartDate', filters.startDate);
    }

    if (filters.endDate) {
        params.set('EndDate', filters.endDate);
    }

    if (filters.searchTerm?.trim()) {
        params.set('SearchTerm', filters.searchTerm.trim());
    }

    if (filters.priceFilter === 'free') {
        params.set('IsAccessibleForFree', 'true');
    }

    if (filters.priceFilter === 'paid') {
        params.set('IsAccessibleForFree', 'false');
    }

    return params;
}

export async function fetchEvents(
    filters: EventSearchFilters,
): Promise<EventRecord[]> {
    if (!filters.municipality.trim()) {
        return [];
    }

    const events: EventRecord[] = [];
    let page = 1;
    let totalCount = 0;

    do {
        const response = await fetch(
            `${apiBaseUrl}/events/search?${createParams(filters, page)}`,
            { signal: filters.signal },
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch events (${response.status})`);
        }

        const data = (await response.json()) as ApiEventsResponse;
        const pageItems = data.items ?? [];

        events.push(...pageItems.map(mapEvent));
        totalCount = data.totalCount ?? events.length;
        page += 1;

        if (pageItems.length === 0) {
            break;
        }
    } while (events.length < totalCount);

    return events;
}
