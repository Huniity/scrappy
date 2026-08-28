import {
    type Page,
} from 'playwright';

import {
    type BolAddress,
    type BolCoordinates,
    type BolDateRange,
} from './types';

export async function rejectBolCookies(
    page: Page
): Promise<void> {
    const rejectCookiesButton =
        page.getByRole(
            'button',
            {
                name:
                    /Rejeitar não essenciais/i,
            }
        );

    if (
        await rejectCookiesButton
            .isVisible()
            .catch(() => false)
    ) {
        await rejectCookiesButton.click();
    }
}

export async function extractBolTitle(
    page: Page
): Promise<string | undefined> {
    const titleLocator =
        page.locator(
            '#infoNomeEsp'
        );

    if (
        await titleLocator.count() === 0
    ) {
        return undefined;
    }

    const title =
        (
            await titleLocator
                .textContent()
        )?.trim();

    return title || undefined;
}

export async function extractBolCategory(
    page: Page
): Promise<string | undefined> {
    const titleLocator =
        page.locator(
            '#infoNomeEsp'
        );

    if (
        await titleLocator.count() === 0
    ) {
        return undefined;
    }

    const categoryLocator =
        titleLocator.locator(
            'xpath=following::*[contains(text(), "|")][1]'
        );

    if (
        await categoryLocator.count() === 0
    ) {
        return undefined;
    }

    return (
        (
            await categoryLocator
                .textContent()
        )?.trim() || undefined
    );
}

export async function extractBolVenueName(
    page: Page
): Promise<string | undefined> {
    const titleLocator =
        page.locator(
            '#infoNomeEsp'
        );

    if (
        await titleLocator.count() === 0
    ) {
        return undefined;
    }

    const venueLocator =
        titleLocator.locator(
            'xpath=following::h4[1]'
        );

    if (
        await venueLocator.count() === 0
    ) {
        return undefined;
    }

    return (
        (
            await venueLocator
                .textContent()
        )?.trim() || undefined
    );
}

export async function extractBolAgeRatingText(
    page: Page
): Promise<string | undefined> {
    const ageRatingHeading =
        page.getByRole(
            'heading',
            {
                name:
                    'Classificação Etária',
                exact: true,
            }
        );

    if (
        await ageRatingHeading.count() === 0
    ) {
        return undefined;
    }

    return (
        (
            await ageRatingHeading
                .locator(
                    'xpath=following::*[normalize-space()][1]'
                )
                .textContent()
        )?.trim() || undefined
    );
}

export async function extractBolSessionText(
    page: Page
): Promise<string | undefined> {
    const sessionHeading =
        page.getByRole(
            'heading',
            {
                name:
                    'Sessão',
                exact: true,
            }
        );

    if (
        await sessionHeading.count() === 0
    ) {
        return undefined;
    }

    return (
        (
            await sessionHeading
                .locator(
                    'xpath=following::*[normalize-space()][1]'
                )
                .textContent()
        )?.trim() || undefined
    );
}

export async function extractBolDescription(
    page: Page
): Promise<string | undefined> {
    const headings = [
        'Sinopse',
        'Breve Introdução',
    ];

    for (
        const headingName of headings
    ) {
        const heading =
            page.getByRole(
                'heading',
                {
                    name:
                        headingName,
                    exact:
                        true,
                }
            );

        if (
            await heading.count() === 0
        ) {
            continue;
        }

        const description =
            (
                await heading
                    .locator(
                        'xpath=following::*[normalize-space()][1]'
                    )
                    .textContent()
            )?.trim();

        if (description) {
            return description;
        }
    }

    return undefined;
}

export async function extractBolAddress(
    page: Page
): Promise<BolAddress> {
    const addressHeading =
        page.getByRole(
            'heading',
            {
                name:
                    'Morada',
                exact: true,
            }
        );

    if (
        await addressHeading.count() === 0
    ) {
        return {};
    }

    const addressContainer =
        addressHeading.locator(
            'xpath=parent::*'
        );

    const addressText =
        (
            await addressContainer
                .innerText()
        )
            .split('\n')
            .map(
                (line) =>
                    line.trim()
            )
            .filter(Boolean);

    const addressLines =
        addressText.filter(
            (line) =>
                line
                    .toLowerCase() !==
                'morada' &&
                !line
                    .toLowerCase()
                    .startsWith(
                        'direcções para'
                    )
        );

    const streetAddress =
        addressLines[0];

    const postalLocality =
        addressLines[1];

    const localityMatch =
        postalLocality?.match(
            /^\d{4}-\d{3}\s+(.+)$/
        );

    const locality =
        localityMatch?.[1]
            ?.trim();

    return {
        streetAddress,
        postalLocality,
        locality,
    };
}

export async function extractBolImageUrl(
    page: Page
): Promise<string | undefined> {
    const imageLocator =
        page
            .locator(
                'img[src*="bolimg"]'
            )
            .first();

    if (
        await imageLocator.count() === 0
    ) {
        return undefined;
    }

    return (
        await imageLocator
            .getAttribute(
                'src'
            )
    ) ?? undefined;
}

export async function extractBolDateRange(
    page: Page
): Promise<BolDateRange> {
    const dateRangeText =
        await page
            .locator('body')
            .innerText();

    const normalizedText =
        dateRangeText
            .replace(
                /\s+/g,
                ' '
            )
            .trim();

    const match =
        normalizedText.match(
            /(\d{4})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s+(\d{1,2})\s+a\s+(\d{4})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s+(\d{1,2})/i
        );

    if (!match) {
        return {};
    }

    const [
        ,
        startYear,
        startMonth,
        startDay,
        endYear,
        endMonth,
        endDay,
    ] = match;

    return {
        startDateText:
            `${startDay} ${startMonth} ${startYear}`,

        endDateText:
            `${endDay} ${endMonth} ${endYear}`,
    };
}

export async function extractBolCoordinates(
    page: Page
): Promise<BolCoordinates> {
    const mapIframe =
        page.locator(
            'iframe#stay22-widget'
        );

    if (
        await mapIframe.count() === 0
    ) {
        return {};
    }

    const src =
        await mapIframe.getAttribute(
            'src'
        );

    if (!src) {
        return {};
    }

    try {
        const url =
            new URL(src);

        const latitude =
            url.searchParams.get(
                'lat'
            );

        const longitude =
            url.searchParams.get(
                'lng'
            );

        return {
            latitude:
                latitude ??
                undefined,

            longitude:
                longitude ??
                undefined,
        };
    }
    catch {
        return {};
    }
}

export async function extractBolPriceText(
    page: Page
): Promise<string | undefined> {
    const priceHeading =
        page.getByRole(
            'heading',
            {
                name: 'Preços',
                exact: true,
            }
        );

    if (
        await priceHeading.count() === 0
    ) {
        return undefined;
    }

    const siblingTexts =
        await priceHeading
            .locator(
                'xpath=following-sibling::*'
            )
            .allTextContents();

    const cleanedTexts =
        siblingTexts
            .map(
                (text) =>
                    text.trim()
            )
            .filter(Boolean);

    const priceText =
        cleanedTexts.join(
            '\n'
        );

    return (
        priceText ||
        undefined
    );
}

export async function findBolDateCandidates(
    page: Page
): Promise<string[]> {
    const elements =
        page.locator(
            'text=/^\\d{1,2}\\s+[a-zç]+\\s+\\d{4}\\s+\\d{2}:\\d{2}$/i'
        );

    const count =
        await elements.count();

    const candidates:
        string[] = [];

    for (
        let index = 0;
        index < count;
        index++
    ) {
        const text =
            (
                await elements
                    .nth(index)
                    .textContent()
            )?.trim();

        if (
            text &&
            /^\d{1,2}\s+[a-zç]+\s+\d{4}\s+\d{2}:\d{2}$/i.test(
                text
            )
        ) {
            candidates.push(
                text
            );
        }
    }

    return [
        ...new Set(
            candidates
        ),
    ];
}
