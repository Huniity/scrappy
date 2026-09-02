

export type PublishedFilter = 'all' | 'published' | 'unpublished';
export type PriceFilter = 'all' | 'free' | 'paid';
export type DataSortOption = 'data-asc' | 'data-desc' | 'price-asc' | 'price-desc' | 'title-asc' | 'title-desc';

export interface EventItem {
    id: string;
    event: {
        title: string;
        description: string;
        isPublished: boolean;
        location: {
            latitude: number | null;
            longitude: number | null;
        };
    };
}

export interface EventsResponse {
    items: EventItem[];
    totalCount: number;
}


export interface EventSearchFilters {
    municipality: string;
    publishedFilter: PublishedFilter;
    startDate?: string;
    endDate?: string;
    priceFilter?: PriceFilter;
    searchTerm?: string;
    dataSort?: DataSortOption;
}


export async function fetchEvents(filters: EventSearchFilters) {
    const params = new URLSearchParams();

    params.set('Locality', filters.municipality);

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

    if (filters.searchTerm) {
        params.set('SearchTerm', filters.searchTerm.trim());
    }

    if (filters.priceFilter === 'free') {
        params.set('IsAccessibleForFree', 'true');
    }
    
    if (filters.priceFilter === 'paid') {
        params.set('IsAccessibleForFree', 'false');
    }

    if (filters.dataSort === 'data-asc') {
        params.set('SortBy', 'data-asc');
    }

    if (filters.dataSort === 'data-desc') {
        params.set('SortBy', 'data-desc');
    }

    if (filters.dataSort === 'price-asc') {
        params.set('SortBy', 'price-asc');
    }

    if (filters.dataSort === 'price-desc') {
        params.set('SortBy', 'price-desc');
    }

    if (filters.dataSort === 'title-asc') {
        params.set('SortBy', 'title-asc');
    }

    if (filters.dataSort === 'title-desc') {
        params.set('SortBy', 'title-desc');
    }


    const response = await fetch(
        `http://localhost:5000/events/search?${params.toString()}`,
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch events (${response.status})`);
    }

    return response.json();
}