import { type Page } from 'playwright';
import { load } from 'cheerio';

import {
    extractBolNormalizedEvent,
} from '../../../sources/bol/extract';
import {
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

/**
 * Renders a BOL page with Playwright and sends the resulting HTML through
 * the exact same extractor used by the Cheerio crawler.
 */
export async function scrapeBolEvent(
    page: Page,
    eventUrl: string,
    onIgnore?: (
        reason: BolIgnoreReason
    ) => void,
): Promise<ReturnType<typeof extractBolNormalizedEvent>> {
    await page.goto(eventUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
    });

    await page
        .waitForSelector(
            '#infoNomeEsp, script[type="application/ld+json"]',
            { timeout: 15_000 },
        )
        .catch(() => undefined);

    await page
        .waitForLoadState('networkidle', { timeout: 5_000 })
        .catch(() => undefined);

    await rejectBolCookies(page);

    const event = extractBolNormalizedEvent(
        load(await page.content()),
        eventUrl,
    );

    if (!event) {
        onIgnore?.('missing_title');
    }

    return event;
}
