import { chromium } from 'playwright';

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

        console.log(
            'Primeiros 5:',
            uniqueEventUrls.slice(0, 5)
        );

        // 4. Criar array onde vamos guardar
        // os eventos encontrados
        const events: NormalizedEvent[] = [];

        // 5. Percorrer todos os URLs encontrados
        for (const eventUrl of uniqueEventUrls) {
            console.log('\nA abrir evento:');
            console.log(eventUrl);

            const event =
                await scrapeViralAgendaEvent(
                    page,
                    eventUrl
                );

            if (!event) {
                console.log(
                    'Nenhum evento válido encontrado nesta página.'
                );

                continue;
            }

            console.log(
                'Tipo classificado:',
                classifyEventType(event)
            );

            events.push(event);

            console.log(
                'Evento guardado:',
                event.title
            );
        }

        // 6. Mostrar quantos eventos foram normalizados
        console.log(
            '\nTOTAL DE EVENTOS NORMALIZADOS:',
            events.length
        );

        // 7. Remover eventos duplicados
        const uniqueEvents =
            deduplicateEvents(events);

        console.log(
            'TOTAL APÓS DEDUPLICAÇÃO:',
            uniqueEvents.length
        );

        // 8. Mostrar apenas os eventos finais,
        // depois da deduplicação
        console.log(
            JSON.stringify(
                uniqueEvents,
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