import { chromium } from 'playwright';

import { resolveLocation } from './enrichment/location';
import {
    type NormalizedEvent,
} from './types/events';

import {
    scrapeViralAgendaEvent,
    getViralAgendaEventUrls,
} from './crawlers/viralAgenda';

import { classifyEventType } from './enrichment/eventType';

import { deduplicateEvents } from './deduplication/events';

async function main() {
    const browser = await chromium.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();

        const uniqueEventUrls =
            await getViralAgendaEventUrls(page);

        console.log(
            'Eventos únicos encontrados:',
            uniqueEventUrls.length
        );

        const events: NormalizedEvent[] = [];

        for (const eventUrl of uniqueEventUrls) {
            const event =
                await scrapeViralAgendaEvent(
                    page,
                    eventUrl
                );

            if (!event) {
                console.log(
                    'Nenhum evento válido encontrado:',
                    eventUrl
                );

                continue;
            }

            const resolvedLocation =
                resolveLocation(event);

            if (resolvedLocation) {
                event.locality =
                    resolvedLocation.locality;

                event.latitude =
                    resolvedLocation.latitude;

                event.longitude =
                    resolvedLocation.longitude;
            }

            event.type = classifyEventType(event);

            events.push(event);
        }

        const deduplicatedEvents =
            deduplicateEvents(events);

        const unresolvedLocationEvents =
            deduplicatedEvents.filter(
                (event) => !event.locality
            );

        const resolvedLocationsCount =
            deduplicatedEvents.length -
            unresolvedLocationEvents.length;

        console.log(
            '\nTOTAL DE EVENTOS NORMALIZADOS:',
            events.length
        );

        console.log(
            'TOTAL APÓS DEDUPLICAÇÃO:',
            deduplicatedEvents.length
        );

        console.log(
            'Eventos com localização resolvida:',
            resolvedLocationsCount
        );

        console.log(
            'Eventos sem localização resolvida:',
            unresolvedLocationEvents.length
        );

        if (
            unresolvedLocationEvents.length > 0
        ) {
            console.log(
                'Eventos sem localização resolvida:',
                unresolvedLocationEvents.map(
                    (event) => ({
                        title: event.title,
                        venueName:
                            event.venueName,
                        locality:
                            event.locality,
                        streetAddress:
                            event.streetAddress,
                    })
                )
            );
        }

        console.log(
            JSON.stringify(
                deduplicatedEvents,
                null,
                2
            )
        );
    } finally {
        await browser.close();
    }
}

main().catch((error) => {
    console.error('Erro:', error);
    process.exit(1);
});