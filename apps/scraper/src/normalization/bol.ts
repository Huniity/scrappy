import { getLisbonOffset } from './dates';

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
