import {
    type Page,
} from 'playwright';

import {
    type NormalizedEvent,
} from '../../types/events';

import {
    isBolContinuousAttraction,
    parseBolAgeRating,
    parseBolDateOnly,
    parseBolPrice,
    parseBolSessionDate,
} from '../../normalization/bol';

import {
    extractBolAddress,
    extractBolAgeRatingText,
    extractBolCategory,
    extractBolCoordinates,
    extractBolDateRange,
    extractBolDescription,
    extractBolImageUrl,
    extractBolPriceText,
    extractBolSessionText,
    extractBolTitle,
    extractBolVenueName,
    findBolDateCandidates,
    rejectBolCookies,
} from './extractors';

import {
    type BolIgnoreReason,
} from './types';

export {
    getBolEventUrlsForDistrict,
} from './discovery';

export type {
    BolAddress,
    BolCoordinates,
    BolDateRange,
    BolIgnoreReason,
} from './types';

export async function scrapeBolEvent(
    page: Page,
    eventUrl: string,
    onIgnore?: (
        reason: BolIgnoreReason
    ) => void
): Promise<NormalizedEvent | null> {
    await page.goto(eventUrl, {
        waitUntil: 'domcontentloaded',
    });

    await rejectBolCookies(
        page
    );

    const title =
        await extractBolTitle(
            page
        );

    if (!title) {
        onIgnore?.(
            'missing_title'
        );

        return null;
    }

    const {
        latitude,
        longitude,
    } = await extractBolCoordinates(
        page
    );

    const categoryText =
        await extractBolCategory(
            page
        );

    const continuousAttraction =
        isBolContinuousAttraction(
            categoryText
        );

    if (
        continuousAttraction
    ) {
        console.log(
            `IGNORADO: atração contínua - ${title}`
        );

        onIgnore?.(
            'continuous_attraction'
        );

        return null;
    }

    const venueName =
        await extractBolVenueName(
            page
        );

    const ageRatingText =
        await extractBolAgeRatingText(
            page
        );

    const ageRating =
        parseBolAgeRating(
            ageRatingText
        );

    const sessionText =
        await extractBolSessionText(
            page
        );

    const dateCandidates =
        await findBolDateCandidates(
            page
        );

    const {
        startDateText,
        endDateText,
    } = await extractBolDateRange(
        page
    );

    const rangeStartDate =
        parseBolDateOnly(
            startDateText
        );

    const rangeEndDate =
        parseBolDateOnly(
            endDateText
        );

    if (
        rangeStartDate &&
        rangeEndDate &&
        rangeStartDate !== rangeEndDate
    ) {
        console.log(
            `IGNORADO: várias datas/sessões - ${title}`
        );

        onIgnore?.(
            'multiple_dates_or_sessions'
        );

        return null;
    }

    if (
        dateCandidates.length > 1
    ) {
        console.log(
            `IGNORADO: múltiplas sessões - ${title}`
        );

        onIgnore?.(
            'multiple_session_candidates'
        );

        return null;
    }

    let effectiveSessionText =
        sessionText;

    if (
        !effectiveSessionText &&
        dateCandidates.length === 1
    ) {
        effectiveSessionText =
            dateCandidates[0];
    }

    const startDate =
        parseBolSessionDate(
            effectiveSessionText
        );

    if (!startDate) {
        console.log(
            `IGNORADO: sem data estável - ${title}`
        );

        onIgnore?.(
            'unstable_date'
        );

        return null;
    }

    const description =
        await extractBolDescription(
            page
        );

    const priceText =
        await extractBolPriceText(
            page
        );

    const price =
        parseBolPrice(
            priceText
        );

    const {
        streetAddress,
        postalLocality,
        locality,
    } = await extractBolAddress(
        page
    );

    const imageUrl =
        await extractBolImageUrl(
            page
        );

    console.log({
        title,
        venueName,
        ageRatingText,
        ageRating,

        categoryText,
        continuousAttraction,

        sessionText,
        effectiveSessionText,
        startDate,

        description,

        priceText,
        price,

        streetAddress,
        postalLocality,
        locality,

        imageUrl,
    });

    return {
        title,
        sourceUrl:
            eventUrl,
        startDate,
        description,
        imageUrl,
        venueName,
        locality,
        streetAddress,
        country:
            'PT',
        latitude,
        longitude,
        price,
        ageRating,
    };
}
