

import { type Page } from 'playwright';
import { load } from 'cheerio';

import {
    extractViralAgendaNormalizedEvent,
    getViralAgendaMapRequest,
    parseViralAgendaCoordinatesResponse,
} from '../../sources/viralAgenda/extract';
import { type NormalizedEvent } from '../types/normalizedEvent';

async function extractViralAgendaCoordinatesWithPlaywright(
    page: Page,
    eventUrl: string,
) {
    const request = getViralAgendaMapRequest(eventUrl);

    try {
        const response = await page.request.post(
            request.url,
            {
                form: request.form,
                headers: request.headers,
                failOnStatusCode: false,
            },
        );

        return parseViralAgendaCoordinatesResponse(
            response.status(),
            await response.text(),
        );
    } catch {
        return undefined;
    }
}

export async function scrapeViralAgendaEvent(
    page: Page,
    eventUrl: string
): Promise<NormalizedEvent | null> {
    await page.goto(eventUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
    });

    await page
        .waitForSelector(
            'script[type="application/ld+json"]',
            { timeout: 15_000 },
        )
        .catch(() => undefined);

    await page
        .waitForLoadState('networkidle', { timeout: 5_000 })
        .catch(() => undefined);

    const coordinates =
        await extractViralAgendaCoordinatesWithPlaywright(
            page,
            eventUrl,
        );

    const $ = load(await page.content());

    return extractViralAgendaNormalizedEvent(
        $,
        eventUrl,
        coordinates,
    );
}

export async function getViralAgendaEventUrls(
    page: Page
): Promise<string[]> {
    await page.goto(
        'https://www.viralagenda.com/pt/faro/',
        {
            waitUntil:
                'domcontentloaded',
        }
    );

    const eventUrls =
        new Set<string>();

    while (true) {
        const pastMarker =
            page.locator(
                'li.viral-event-past'
            );

        const eventLinks =
            page.locator(
                'a[href*="/pt/events/"]'
            );

        const links =
            await eventLinks
                .evaluateAll(
                    (elements) =>
                        elements.map(
                            (element) =>
                                (
                                    element as HTMLAnchorElement
                                ).href
                        )
                );

        for (
            const href of links
        ) {
            const url =
                new URL(href);

            if (
                !/^\/pt\/events\/\d+\/[^/]+\/?$/i.test(
                    url.pathname
                )
            ) {
                continue;
            }

            eventUrls.add(
                url.origin +
                url.pathname.replace(
                    /\/+$/,
                    ''
                )
            );
        }

        console.log(
            `Viral Agenda carregados: ${eventUrls.size}`
        );


        if (
            await pastMarker.count() > 0
        ) {
            console.log(
                'Marcador "Passados" encontrado.'
            );

            break;
        }


        const previousCount =
            await eventLinks.count();

        if (
            previousCount === 0
        ) {
            break;
        }


        const lastEventLink =
            eventLinks.nth(
                previousCount - 1
            );

        await lastEventLink
            .scrollIntoViewIfNeeded();


        // Faz mais um pequeno scroll para garantir
        // que atingimos o trigger do infinite scroll.
        await page.mouse.wheel(
            0,
            1000
        );


        try {
            await page.waitForFunction(
                (previousLinkCount) => {
                    const currentCount =
                        document.querySelectorAll(
                            'a[href*="/pt/events/"]'
                        ).length;

                    const past =
                        document.querySelector(
                            'li.viral-event-past'
                        );

                    return (
                        currentCount >
                            previousLinkCount ||
                        past !==
                            null
                    );
                },
                previousCount,
                {
                    timeout:
                        8000,
                }
            );
        }
        catch {
            console.log(
                'Não foram carregados mais eventos.'
            );

            break;
        }
    }


    return [
        ...eventUrls,
    ];
}
