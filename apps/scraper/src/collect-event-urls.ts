

import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { collectEventUrls } from './discovery/collectEventUrls';
import sources from '../config/sources.json';
import { crawlJobsSchema } from '../source';


const crawlJobs =
    crawlJobsSchema.parse(
        sources,
    );

const viralAgendaJob =
    crawlJobs.find(
        (job) =>
            job.sourceId ===
            'viral-agenda' ||
            job.sourceId.startsWith(
                'viral-agenda-',
            ),
    );

if (!viralAgendaJob) {
    throw new Error(
        'No Viral Agenda source configured.',
    );
}

  const viralAgendaSourceUrl =
      viralAgendaJob.sourceUrl;


async function main() {
    const browser =
        await chromium.launch({
            headless: true,
        });

    const context =
        await browser.newContext();

    const page =
        await context.newPage();

    try {
        const events =
            await collectEventUrls(
                page,
                viralAgendaSourceUrl
            );

        const bolCount =
            events.filter(
                (event) =>
                    event.source ===
                    'bol'
            ).length;

        const viralAgendaCount =
            events.filter(
                (event) =>
                    event.source ===
                    'viralAgenda'
            ).length;

        console.log(
            `BOL: ${bolCount}`
        );

        console.log(
            `Viral Agenda: ${viralAgendaCount}`
        );

        console.log(
            `Total único: ${events.length}`
        );


        await writeFile(
            'apps/scraper/event-urls-debug.json',
            JSON.stringify(
                events,
                null,
                2
            ),
            'utf8'
        );


        const finalUrls =
            events.map(
                (event) =>
                    event.url
            );

        await writeFile(
            'apps/scraper/event-urls.json',
            JSON.stringify(
                finalUrls,
                null,
                2
            ),
            'utf8'
        );

        console.log(
            'Guardado em: apps/scraper/event-urls.json'
        );
    }
    finally {
        await browser.close();
    }
}


main().catch(
    (error) => {
        console.error(
            error
        );

        process.exit(1);
    }
);