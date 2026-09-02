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

export type EventOffer = {
    price: number;
};

export type EventItem = {
    id: string;
    title: string;
    startDate: string;
    location: {
        name: string;
        locality: string | null;
    };
    sourceUrl: string;
    type: string;
    imageUrl: string | null;
    isPublished?: boolean | null;
    offers: EventOffer[];
};

export type EventRecord = {
    id: string;
    district: string;
    event: EventItem;
};
