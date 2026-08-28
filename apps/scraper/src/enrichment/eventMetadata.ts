import type { NormalizedOffer } from '../types/offer';

export type EventMetadata = {
    price?: number;
    ageRating?: number;
    maximumAttendeeCapacity?: number;
    isAccessibleForFree?: boolean;
};

export function extractDoorTimeFromDescription(
    description: string | undefined,
): string | undefined {
    if (!description) {
        return undefined;
    }

    const match = description.match(
        /\b(?:abertura\s+de\s+portas?|portas?|entrada\s+do\s+público)\b[^0-9]{0,30}(\d{1,2}\s*(?:h|:)\s*\d{2})\b/i,
    );

    return match?.[1];
}

export function extractDurationFromDescription(
    description: string | undefined,
): string | undefined {
    if (!description) {
        return undefined;
    }

    const match = description.match(
        /(?:duração|duration)\b[^0-9]{0,30}((?:\d{1,2}\s*h\s*\d{1,2})|(?:\d{1,3}\s*(?:horas?|hours?|h))|(?:\d{1,4}\s*(?:minutos?|minutes?|min|m)))/i,
    );

    return match?.[1];
}

export function extractMaximumAttendeeCapacityFromDescription(
    description: string | undefined,
): number | undefined {
    if (!description) {
        return undefined;
    }

    const normalizedDescription = description.toLowerCase();

    const labelledCapacityMatch = normalizedDescription.match(
        /(?:lotação(?:\s+(?:máxima|limitada))?|capacidade(?:\s+máxima)?)\b[^0-9]{0,30}(\d{1,5})/i,
    );

    const maximumCapacityMatch = normalizedDescription.match(
        /\b(?:máximo(?:\s+de)?|máx\.?)\b[^0-9]{0,20}(\d{1,5})\s*(?:pessoas?|participantes?|lugares?)/i,
    );

    const vacanciesMatch = normalizedDescription.match(
        /\b(\d{1,5})\s+vagas?\b/i,
    );

    const capacityValue =
        labelledCapacityMatch?.[1] ??
        maximumCapacityMatch?.[1] ??
        vacanciesMatch?.[1];

    if (!capacityValue) {
        return undefined;
    }

    const capacity = Number(capacityValue);

    return Number.isInteger(capacity) && capacity >= 0
        ? capacity
        : undefined;
}

export function extractEventMetadata(
    description: string | undefined,
    offers: NormalizedOffer[] = [],
): EventMetadata {


    if (!description && offers.length === 0) {
        return {};
    }

    const metadata: EventMetadata = {};

    const normalizedDescription =
        description?.toLowerCase() ?? '';

    const priceMatches = [
        ...normalizedDescription.matchAll(
            /(\d+(?:[.,]\d{1,2})?)\s*€/g
        ),
    ];

    const excludedKeywords = [
        'gratuito',
        'free',
        'doação',
        'doacão',
        'donativo',
        'donation',
        'contributo',
        'contribution',
        'entrada livre',
        'entrada gratuita',
        'free entry',
        'free admission',
        'taxa',
        'parque',
        'estacionamento',
        'parking'
    ]

    const ageRatingMatch =
    normalizedDescription.match(
        /\bm\/?\s*(\d{1,2})(?!\d)|\+\s*(\d{1,2})(?!\d)|maiores\s+de\s+(\d{1,2})\s+anos/i
    );

    const ageRatingValue =
        ageRatingMatch?.[1] ??
        ageRatingMatch?.[2] ??
        ageRatingMatch?.[3];

    const ageRating =
        ageRatingValue
            ? Number(ageRatingValue)
            : undefined;

    const capacity = extractMaximumAttendeeCapacityFromDescription(
        description,
    );

    const hasNonPriceContext =
        excludedKeywords.some((keyword) =>
            normalizedDescription.includes(keyword)
        );



    if (
        offers.length === 0 &&
        !hasNonPriceContext &&
        priceMatches.length === 1
    ) {
        const normalizedPrice =
            priceMatches[0][1].replace(',', '.');

        const price =
            Number(normalizedPrice);

        if (Number.isFinite(price)) {
            metadata.price = price;
        }
    }

    const hasFreeMarker = /(?:entrada\s+(?:gratuita|gratuito|livre)|gratuit[oa]|free\s+(?:entrance|entry|admission))\b/i.test(
        normalizedDescription,
    );

    if (offers.length > 0) {
        metadata.isAccessibleForFree = offers.every(
            (offer) => offer.price === 0,
        );
    } else if (hasFreeMarker) {
        metadata.isAccessibleForFree = true;
    } else if (metadata.price !== undefined) {
        metadata.isAccessibleForFree = false;
    }

    if (
        ageRating !== undefined &&
        Number.isFinite(ageRating)
    ) {
        metadata.ageRating = ageRating;
    }

    if (
        capacity !== undefined
    ) {
        metadata.maximumAttendeeCapacity =
            capacity;
    }

    return metadata;
}
