export type EventMetadata = {
    price?: number;
    ageRating?: number;
    maximumAttendeeCapacity?: number;
};

export function extractEventMetadata(
    description: string | undefined
): EventMetadata {


    if (!description) {
        return {};
    }

    const metadata: EventMetadata = {};

    const normalizedDescription =
        description.toLowerCase();

    const priceMatches = [
        ...normalizedDescription.matchAll(
            /(\d+(?:[.,]\d{1,2})?)\s*€/g
        ),
    ];

    const excludedKeywords = [
        'gratuito',
        'free',
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

    const capacityMatch =
        normalizedDescription.match(
            /(?:lotação(?:\s+máxima|\s+limitada)?\s*(?:a\s+)?(?::\s*)?(\d{1,5})|capacidade\s+máxima\s*:?\s*(\d{1,5})|máximo(?:\s+de)?\s+(\d{1,5})\s+(?:pessoas|participantes|lugares)|máx\.?\s*(\d{1,5}))/i
        );

    const capacityValue =
        capacityMatch?.[1] ??
        capacityMatch?.[2] ??
        capacityMatch?.[3] ??
        capacityMatch?.[4];

    const capacity =
        capacityValue
            ? Number(capacityValue)
            : undefined;



    const hasNonPriceContext =
        excludedKeywords.some((keyword) =>
            normalizedDescription.includes(keyword)
        );



    if (
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

    if (
        ageRating !== undefined &&
        Number.isFinite(ageRating)
    ) {
        metadata.ageRating = ageRating;
    }

    if (
        capacity !== undefined &&
        Number.isFinite(capacity)
    ) {
        metadata.maximumAttendeeCapacity =
            capacity;
    }

    return metadata;
}