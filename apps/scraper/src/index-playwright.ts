import { chromium } from 'playwright';

import {
    createEvent,
} from './api/events';

import {
    resolveLocation,
} from './enrichment/location';

import {
    type NormalizedEvent,
} from './types/normalizedEvent';

import {
    scrapeViralAgendaEvent,
    getViralAgendaEventUrls,
} from './crawlers/viralAgenda';

import {
    extractEventMetadata,
} from './enrichment/eventMetadata';

import {
    classifyEventType,
} from './enrichment/eventType';

import {
    deduplicateEvents,
} from './deduplication/events';

import {
    mapEventToCreatePayload,
} from './mappers/backendEvent';

async function main() {
    const browser = await chromium.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();

        const uniqueEventUrls =
            await getViralAgendaEventUrls(page);

        console.log(
            'Eventos encontrados:',
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
                    'IGNORADO: evento inválido:',
                    eventUrl
                );

                continue;
            }

            const resolvedLocation =
                resolveLocation(event);

            if (resolvedLocation) {
                event.municipality =
                    resolvedLocation.municipality;

                event.latitude =
                    resolvedLocation.latitude;

                event.longitude =
                    resolvedLocation.longitude;
            }

            event.type =
                classifyEventType(event);

            const metadata =
                extractEventMetadata(
                    event.description
                );

            Object.assign(
                event,
                metadata
            );

            events.push(event);
        }

        const deduplicatedEvents =
            deduplicateEvents(events);

        const unresolvedLocationEvents =
            deduplicatedEvents.filter(
                (event) => !event.locality
            );

        const eventsReadyForBackend =
            deduplicatedEvents.filter(
                (event) => event.locality
            );

        console.log(
            'Após deduplicação:',
            deduplicatedEvents.length
        );

        console.log(
            'Localizações resolvidas:',
            `${eventsReadyForBackend.length}/${deduplicatedEvents.length}`
        );

        if (
            unresolvedLocationEvents.length > 0
        ) {
            console.log(
                '\nEVENTOS SEM LOCALIZAÇÃO:'
            );

            for (
                const event
                of unresolvedLocationEvents
            ) {
                console.log(
                    `IGNORADO: ${event.title}`
                );
            }
        }

        const backendPayloads =
            eventsReadyForBackend.map(
                mapEventToCreatePayload
            );

        console.log(
            '\nA ENVIAR EVENTOS PARA O BACKEND...'
        );

        let createdCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        for (
            const payload
            of backendPayloads
        ) {
            try {
                const result =
                    await createEvent(payload);

                if (result.success) {
                    createdCount++;

                    console.log(
                        `CRIADO: ${payload.title}`
                    );

                    continue;
                }

                if (result.duplicate) {
                    duplicateCount++;

                    console.log(
                        `JÁ EXISTE: ${payload.title}`
                    );

                    continue;
                }

                errorCount++;

                console.error(
                    `ERRO ${result.status}: ${payload.title}`
                );

                console.error(
                    result.body
                );
            } catch (error) {
                errorCount++;

                console.error(
                    `ERRO DE LIGAÇÃO: ${payload.title}`
                );

                console.error(error);
            }
        }

        console.log(
            '\nRESULTADO'
        );

        console.log(
            'Criados:',
            createdCount
        );

        console.log(
            'Duplicados:',
            duplicateCount
        );

        console.log(
            'Erros:',
            errorCount
        );

        console.log(
            'Ignorados por falta de localização:',
            unresolvedLocationEvents.length
        );
    } finally {
        await browser.close();
    }
}

main().catch((error) => {
    console.error(
        'Erro fatal:',
        error
    );

    process.exit(1);
});
