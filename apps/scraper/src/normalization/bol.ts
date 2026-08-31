

import { getLisbonOffset } from './dates';
import type { NormalizedEvent } from '../types/normalizedEvent';
import type { NormalizedOffer } from '../types/offer';
import type {
    BolJsonLdEvent,
    BolJsonLdOffer,
} from '../../sources/bol/types';

export function normalizeBolJsonLdDate(
    value: string | undefined,
): string | undefined {
    const cleaned = value?.trim();

    if (!cleaned) {
        return undefined;
    }

    const match = cleaned.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?(Z|[+-]\d{2}:?\d{2})?$/,
    );

    if (!match) {
        return undefined;
    }

    const [
        ,
        year,
        month,
        day,
        hour,
        minute,
        seconds,
        fraction,
        rawOffset,
    ] = match;

    const numericYear = Number(year);
    const numericMonth = Number(month);
    const numericDay = Number(day);
    const numericHour = Number(hour);
    const numericMinute = Number(minute);

    const second = seconds ?? '00';

    const milliseconds = fraction
        ? `.${fraction.slice(0, 3).padEnd(3, '0')}`
        : '';

    const offset = rawOffset
        ? rawOffset.toUpperCase() === 'Z'
            ? 'Z'
            : rawOffset.replace(
                /([+-]\d{2})(\d{2})$/,
                '$1:$2',
            )
        : getLisbonOffset(
            numericYear,
            numericMonth,
            numericDay,
            numericHour,
            numericMinute,
        );

    const result =
        `${year}-${month}-${day}` +
        `T${hour}:${minute}:${second}` +
        `${milliseconds}${offset}`;

    return Number.isNaN(
        new Date(result).getTime(),
    )
        ? undefined
        : result;
}

export function isBolContinuousAttraction(
    additionalTypeText: string | undefined
): boolean {
    if (!additionalTypeText) {
        return false;
    }

    const normalizedadditionalType =
        additionalTypeText
            .toLowerCase()
            .trim();

    const continuousCategories = [
        'monumento',
        'parques temáticos',
        'exposição',
        'museu',
    ];

    return continuousCategories.some(
        (additionalType) =>
            normalizedadditionalType.includes(
                additionalType
            )
    );
}

export function parseBolAgeRating(
    ageRatingText: string | undefined
): number | undefined {
    if (!ageRatingText) {
        return undefined;
    }

    const ageRatingMatch =
        ageRatingText.match(
            /(\d{1,2})/
        );

    return ageRatingMatch
        ? Number(
            ageRatingMatch[1]
        )
        : undefined;
}

export function parseBolSessionDate(
    sessionText: string | undefined
): string | undefined {
    if (!sessionText) {
        return undefined;
    }

    const monthMap: Record<
        string,
        string
    > = {
        jan: '01',
        fev: '02',
        mar: '03',
        abr: '04',
        mai: '05',
        jun: '06',
        jul: '07',
        ago: '08',
        set: '09',
        out: '10',
        nov: '11',
        dez: '12',
    };

    const match =
        sessionText.match(
            /^(\d{1,2})\s+([a-zç]+)\s+(\d{4})\s+(\d{2}):(\d{2})$/i
        );

    if (!match) {
        return undefined;
    }

    const [
        ,
        day,
        monthText,
        year,
        hour,
        minute,
    ] = match;

    const month =
        monthMap[
        monthText
            .toLowerCase()
            .slice(0, 3)
        ];

    if (!month) {
        return undefined;
    }

    const numericYear =
        Number(year);

    const numericMonth =
        Number(month);

    const numericDay =
        Number(day);

    const numericHour =
        Number(hour);

    const numericMinute =
        Number(minute);

    const offset =
        getLisbonOffset(
            numericYear,
            numericMonth,
            numericDay,
            numericHour,
            numericMinute
        );

    return (
        `${year}-${month}-${day.padStart(2, '0')}` +
        `T${hour}:${minute}:00${offset}`
    );
}

export function parseBolPrice(
    priceText: string | undefined
): number | undefined {
    if (!priceText) {
        return undefined;
    }

    const matches = [
        ...priceText.matchAll(
            /(\d+(?:[.,]\d{1,2})?)\s*€/g
        ),
    ];

    const prices =
        matches
            .map(
                (match) =>
                    Number(
                        match[1]
                            .replace(
                                ',',
                                '.'
                            )
                    )
            )
            .filter(
                (value) =>
                    Number.isFinite(
                        value
                    )
            );

    const uniquePrices = [
        ...new Set(prices),
    ];

    return (
        uniquePrices.length === 1
            ? uniquePrices[0]
            : undefined
    );
}

export function parseBolDateOnly(
    value: string | undefined
): string | undefined {
    if (!value) {
        return undefined;
    }

    const monthMap:
        Record<string, string> = {
        jan: '01',
        fev: '02',
        mar: '03',
        abr: '04',
        mai: '05',
        jun: '06',
        jul: '07',
        ago: '08',
        set: '09',
        out: '10',
        nov: '11',
        dez: '12',
    };

    const match =
        value.match(
            /^(\d{1,2})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s+(\d{4})$/i
        );

    if (!match) {
        return undefined;
    }

    const [
        ,
        day,
        monthText,
        year,
    ] = match;

    const month =
        monthMap[
        monthText.toLowerCase()
        ];

    if (!month) {
        return undefined;
    }

    return (
        `${year}-${month}-${day.padStart(
            2,
            '0'
        )}`
    );
}

function cleanBolText(
    value: string | undefined,
): string | undefined {
    if (!value) {
        return undefined;
    }

    const result = value
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return result || undefined;
}

function firstBolString(
    value: string | string[] | undefined,
): string | undefined {
    if (Array.isArray(value)) {
        return cleanBolText(value[0]);
    }

    return cleanBolText(value);
}

function normalizeBolCoordinate(
    value: string | number | undefined,
): string | undefined {
    if (value === undefined) {
        return undefined;
    }

    const result = String(value).trim();
    const number = Number(result);

    return Number.isFinite(number)
        ? result
        : undefined;
}

function normalizeBolOffer(
    offer: BolJsonLdOffer,
): NormalizedOffer | undefined {
    const rawPrice =
        typeof offer.price === 'number'
            ? offer.price
            : cleanBolText(offer.price);

    const price =
        typeof rawPrice === 'number'
            ? rawPrice
            : Number(rawPrice?.replace(',', '.'));

    if (!Number.isFinite(price) || price < 0) {
        return undefined;
    }

    return {
        name: 'Bilhete',
        price,
        priceCurrency:

            cleanBolText(offer.priceCurrency)?.toUpperCase()
            ?? 'EUR',
        availability: cleanBolText(offer.availability),
        url: cleanBolText(offer.url),
    };
}

function normalizeBolOffers(
    offers: BolJsonLdOffer | BolJsonLdOffer[] | undefined,
): NormalizedOffer[] {
    const values = offers === undefined
        ? []
        : Array.isArray(offers)
            ? offers
            : [offers];

    return values
        .map(normalizeBolOffer)
        .filter(
            (offer): offer is NormalizedOffer =>
                offer !== undefined,
        );
}

export function normalizeBolEvent(
    data: BolJsonLdEvent,
): NormalizedEvent | null {
    const title = cleanBolText(data.name);
    const sourceUrl = cleanBolText(data.url);
    const startDate =
        normalizeBolJsonLdDate(data.startDate);

    if (!title || !sourceUrl || !startDate) {
        return null;
    }

    const endDate =
        normalizeBolJsonLdDate(data.endDate);

    const location = data.location;
    const address = location?.address;
    const geo = location?.geo;

    const offers =
        normalizeBolOffers(data.offers);

    const prices = offers.map(
        (offer) => offer.price,
    );

    const price = prices.length > 0
        ? Math.min(...prices)
        : undefined;

    return {
        title,
        sourceUrl,
        startDate,
        endDate,

        description:
            cleanBolText(data.description),

        imageUrl:
            firstBolString(data.image),

        venueName:
            cleanBolText(location?.name),

        locationUrl:
            cleanBolText(location?.url),

        locality:
            cleanBolText(address?.addressLocality),

        municipality:
            cleanBolText(address?.addressLocality),

        streetAddress:
            cleanBolText(address?.streetAddress),

        postalCode:
            cleanBolText(address?.postalCode),

        country:
            cleanBolText(address?.addressCountry),

        latitude:
            normalizeBolCoordinate(geo?.latitude),

        longitude:
            normalizeBolCoordinate(geo?.longitude),

        duration:
            cleanBolText(data.duration),

        offers,
        price,

        organizer: [],
        promoter: [],
        maintainer: [],
        performers: [],
        funder: [],
        actor: [],
        director: [],
        composer: [],
    };
}
