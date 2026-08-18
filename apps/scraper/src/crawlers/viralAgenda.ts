import { type Page } from 'playwright';
import {
    type NormalizedEvent,
    type ValidViralAgendaEvent,
    type ViralAgendaJsonLd,
} from '../types/events';

import { normalizeViralAgendaEvent } from '../normalization/viralAgenda';


export async function scrapeViralAgendaEvent(
    page: Page,
    eventUrl: string
): Promise<NormalizedEvent | null> {
    await page.goto(eventUrl, {
        waitUntil: 'domcontentloaded',
    });

    const jsonLdScripts = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();

    console.log(
        'Quantidade de JSON-LD:',
        jsonLdScripts.length
    );

    if (jsonLdScripts.length === 0) {
        return null;
    }

    for (const jsonText of jsonLdScripts) {
        try {
            const data: ViralAgendaJsonLd =
                JSON.parse(jsonText);

            if (
                !data.name ||
                !data.url ||
                !data.startDate
            ) {
                continue;
            }

            const validData: ValidViralAgendaEvent = {
                ...data,
                name: data.name,
                url: data.url,
                startDate: data.startDate,
            };

            return normalizeViralAgendaEvent(validData);
        } catch (error) {
            console.log(
                'Este JSON-LD não conseguiu ser convertido.'
            );
        }
    }

    return null;
}

export async function getViralAgendaEventUrls(
    page: Page
): Promise<string[]> {
    await page.goto(
        'https://www.viralagenda.com/pt/faro/faro',
        {
            waitUntil: 'domcontentloaded',
        }
    );

    console.log('Página:', await page.title());

    const eventUrls = await page
        .locator('a[href*="/pt/events/"]')
        .evaluateAll((elements) =>
            elements.map(
                (element) =>
                    (element as HTMLAnchorElement).href
            )
        );

    const uniqueEventUrls = [...new Set(eventUrls)];

    return uniqueEventUrls;
}