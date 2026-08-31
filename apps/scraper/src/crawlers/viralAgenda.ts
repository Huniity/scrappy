

import { type Page } from 'playwright';

import {
    
    type ValidViralAgendaEvent,
    type ViralAgendaJsonLd,
} from '../../sources/viralAgenda/types';

import {
    type NormalizedEvent
} from '../types/normalizedEvent';


import {
    normalizeViralAgendaEvent,
} from '../normalization/viralAgenda';

export async function scrapeViralAgendaEvent(
    page: Page,
    eventUrl: string
): Promise<NormalizedEvent | null> {
    await page.goto(eventUrl, {
        waitUntil: 'domcontentloaded',
    });

    const municipalityName = (
        await page
            .locator('a.event-node-link')
            .first()
            .textContent()
    )?.trim();

    let latitude: string | undefined;
    let longitude: string | undefined;

    const mapButton = page.getByText(
        'Ver mapa',
        {
            exact: true,
        }
    );

    const mapButtonCount =
        await mapButton.count();

    if (mapButtonCount > 0) {
        try {
            await mapButton
                .first()
                .click({
                    force: true,
                });

            const mapLink = page.locator(
                'a[href*="maps.google.com/maps?ll="]'
            );

            await mapLink
                .first()
                .waitFor({
                    state: 'attached',
                    timeout: 5000,
                });

            const href =
                await mapLink
                    .first()
                    .getAttribute(
                        'href'
                    );

            if (href) {
                const url =
                    new URL(href);

                const coordinates =
                    url.searchParams.get(
                        'll'
                    );

                if (coordinates) {
                    [
                        latitude,
                        longitude,
                    ] =
                        coordinates.split(
                            ','
                        );
                }
            }
        } catch {
            console.log(
                'Mapa abriu, mas não encontrei coordenadas.'
            );
        }
    } else {
        console.log(
            'Este evento não tem botão "Ver mapa".'
        );
    }

    const jsonLdScripts = await page
        .locator(
            'script[type="application/ld+json"]'
        )
        .allTextContents();

    if (
        jsonLdScripts.length === 0
    ) {
        return null;
    }

    for (
        const jsonText
        of jsonLdScripts
    ) {
        try {
            const data:
                ViralAgendaJsonLd =
                JSON.parse(
                    jsonText
                );

            if (
                !data.name ||
                !data.url ||
                !data.startDate
            ) {
                continue;
            }

            const validData:
                ValidViralAgendaEvent = {
                    ...data,
                    name: data.name,
                    url: data.url,
                    startDate:
                        data.startDate,
                };

            const normalizedEvent =
                normalizeViralAgendaEvent(
                    validData
                );

            if (municipalityName) {
                normalizedEvent.locality =
                    municipalityName;
            }

            normalizedEvent.latitude =
                latitude;

            normalizedEvent.longitude =
                longitude;

            return normalizedEvent;
        } catch {
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