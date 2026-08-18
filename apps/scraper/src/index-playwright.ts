import { chromium, type Page } from 'playwright';
import {
    type NormalizedEvent,
} from './types/events';

import { scrapeViralAgendaEvent, getViralAgendaEventUrls } from './crawlers/viralAgenda';




async function main() {
    const browser = await chromium.launch({
        headless: true,
    });

    try {
        const page = await browser.newPage();

      const uniqueEventUrls = await getViralAgendaEventUrls(page);

        console.log(
            'Eventos únicos encontrados:',
            uniqueEventUrls.length
        );

        console.log(
            'Primeiros 5:',
            uniqueEventUrls.slice(0, 5)
        );

        // 4. Criar array onde vamos guardar os eventos
        const events: NormalizedEvent[] = [];

        // 5. Percorrer todos os URLs encontrados
        for (const eventUrl of uniqueEventUrls) {
            console.log('\nA abrir evento:');
            console.log(eventUrl);

            const event = await scrapeViralAgendaEvent(
                page,
                eventUrl
            );

            if (!event) {
                console.log(
                    'Nenhum evento válido encontrado nesta página.'
                );

                continue;
            }

            events.push(event);

            console.log(
                'Evento guardado:',
                event.title
            );
        }

        // 6. Mostrar resultado final
        console.log(
            '\nTOTAL DE EVENTOS NORMALIZADOS:',
            events.length
        );

        console.log(
            JSON.stringify(events, null, 2)
        );
    } finally {
        await browser.close();
    }
}

main().catch((error) => {
    console.error('Erro:', error);
    process.exit(1);
});