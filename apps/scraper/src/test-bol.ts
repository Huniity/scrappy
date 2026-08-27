import {
    chromium,
} from 'playwright';

import {
    writeFile,
} from 'node:fs/promises';

import {
    getBolEventUrlsForDistrict,
    scrapeBolEvent,
    type BolIgnoreReason,
} from './crawlers/bol';

import {
    type NormalizedEvent,
} from './types/events';


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
        const urls =
            await getBolEventUrlsForDistrict(
                page,
                'Faro'
            );

        console.log(
            `Encontrados ${urls.length} URLs da BOL`
        );

        let successCount = 0;
        let ignoredCount = 0;
        let errorCount = 0;

        const successfulEvents:
            NormalizedEvent[] = [];

        const ignoredEvents: {
            url: string;
            reason: BolIgnoreReason;
        }[] = [];

        const errorEvents: {
            url: string;
            error: string;
        }[] = [];


        for (
            let index = 0;
            index < urls.length;
            index++
        ) {
            const url =
                urls[index];

            console.log(
                `[${index + 1}/${urls.length}] ${url}`
            );

            try {
                let ignoreReason:
                    BolIgnoreReason | undefined;

                const event =
                    await scrapeBolEvent(
                        page,
                        url,
                        (reason) => {
                            ignoreReason =
                                reason;
                        }
                    );

                if (!event) {
                    ignoredCount++;

                    ignoredEvents.push({
                        url,
                        reason:
                            ignoreReason ??
                            'unknown',
                    });

                    continue;
                }

                successCount++;

                successfulEvents.push(
                    event
                );
            }
            catch (error) {
                errorCount++;

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : String(error);

                errorEvents.push({
                    url,
                    error:
                        errorMessage,
                });

                console.error(
                    `ERRO: ${errorMessage}`
                );
            }
        }


        const ignoredByReason =
            ignoredEvents.reduce<
                Record<
                    BolIgnoreReason,
                    number
                >
            >(
                (
                    accumulator,
                    event
                ) => {
                    accumulator[
                        event.reason
                    ]++;

                    return accumulator;
                },
                {
                    continuous_attraction:
                        0,

                    multiple_dates_or_sessions:
                        0,

                    multiple_session_candidates:
                        0,

                    unstable_date:
                        0,

                    missing_title:
                        0,

                    unknown:
                        0,
                }
            );


        const output = {
            generatedAt:
                new Date().toISOString(),

            district:
                'Faro',

            summary: {
                totalUrls:
                    urls.length,

                successful:
                    successCount,

                ignored:
                    ignoredCount,

                errors:
                    errorCount,

                ignoredByReason,
            },

            successfulEvents,

            ignoredEvents,

            errorEvents,
        };


        const outputPath =
            'apps/scraper/bol-faro-results.json';

        await writeFile(
            outputPath,
            JSON.stringify(
                output,
                null,
                2
            ),
            'utf8'
        );


        console.log(
            '\n=============================='
        );

        console.log(
            'RESUMO BOL FARO'
        );

        console.log(
            '=============================='
        );

        console.log(
            `Total URLs: ${urls.length}`
        );

        console.log(
            `Eventos válidos: ${successCount}`
        );

        console.log(
            `Ignorados: ${ignoredCount}`
        );

        console.log(
            `Erros: ${errorCount}`
        );


        console.log(
            '\nIgnorados por motivo:'
        );

        for (
            const [
                reason,
                count,
            ] of Object.entries(
                ignoredByReason
            )
        ) {
            if (
                count === 0
            ) {
                continue;
            }

            console.log(
                `- ${reason}: ${count}`
            );
        }


        console.log(
            `\nResultados guardados em: ${outputPath}`
        );


        if (
            errorEvents.length > 0
        ) {
            console.log(
                '\nEVENTOS COM ERRO'
            );

            for (
                const item of errorEvents
            ) {
                console.log(
                    item.url
                );

                console.log(
                    `  ${item.error}`
                );
            }
        }
    }
    finally {
        await browser.close();
    }
}


main().catch(
    (error) => {
        console.error(
            'Erro fatal:',
            error
        );

        process.exit(1);
    }
);