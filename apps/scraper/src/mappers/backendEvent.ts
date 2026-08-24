import { type NormalizedEvent } from '../types/events';

export type CreateEventPayload = {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    type?: string;
    sourceUrl: string;
    imageUrl?: string;

    location: {
        name: string;
        locality: string;
        country: string;
        latitude?: string;
        longitude?: string;
    };

    ageRating?: number;
    maximumAttendeeCapacity?: number;

    offers?: {
        name: string;
        price: number;
        priceCurrency: string;
    }[];
};

export function mapEventToCreatePayload(
    event: NormalizedEvent
): CreateEventPayload {
    const payload: CreateEventPayload = {
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        type: event.type,
        sourceUrl: event.sourceUrl,
        imageUrl: event.imageUrl,

        location: {
            name:
                event.venueName ??
                event.locality ??
                'Local desconhecido',

            locality:
                event.locality ?? '',

            country:
                event.country ?? 'PT',

            latitude:
                event.latitude,

            longitude:
                event.longitude,
        },

        ageRating:
            event.ageRating,

        maximumAttendeeCapacity:
            event.maximumAttendeeCapacity,
    };

    if (event.price !== undefined) {
        payload.offers = [
            {
                name: 'Bilhete',
                price: event.price,
                priceCurrency: 'EUR',
            },
        ];
    }

    return payload;
}