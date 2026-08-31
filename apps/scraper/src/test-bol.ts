import {
    type Page,
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
} from './types/normalizedEvent';


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

        const fieldCoverage = {
            description:
                successfulEvents.filter(
                    (event) =>
                        event.description
                ).length,

            price:
                successfulEvents.filter(
                    (event) =>
                        event.price !==
                        undefined
                ).length,

            ageRating:
                successfulEvents.filter(
                    (event) =>
                        event.ageRating !==
                        undefined
                ).length,

            coordinates:
                successfulEvents.filter(
                    (event) =>
                        event.latitude &&
                        event.longitude
                ).length,

            locality:
                successfulEvents.filter(
                    (event) =>
                        event.locality
                ).length,

            streetAddress:
                successfulEvents.filter(
                    (event) =>
                        event.streetAddress
                ).length,

            imageUrl:
                successfulEvents.filter(
                    (event) =>
                        event.imageUrl
                ).length,

            venueName:
                successfulEvents.filter(
                    (event) =>
                        event.venueName
                ).length,
        };

        const eventsWithoutPrice =
            successfulEvents.filter(
                (event) =>
                    event.price ===
                    undefined
            );

        const eventsWithoutAgeRating =
            successfulEvents.filter(
                (event) =>
                    event.ageRating ===
                    undefined
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

            fieldCoverage,

            eventsWithoutAgeRating,

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
            '\nCobertura dos campos:'
        );


        for (
            const [
                field,
                count,
            ] of Object.entries(
                fieldCoverage
            )
        ) {
            const percentage =
                successCount > 0
                    ? (
                        count /
                        successCount *
                        100
                    ).toFixed(1)
                    : '0.0';

            console.log(
                `- ${field}: ${count}/${successCount} (${percentage}%)`
            );
        }


        console.log(
            `\nResultados guardados em: ${outputPath}`
        );

        console.log(
            `\nEventos sem preço: ${eventsWithoutPrice.length}`
        );

        for (
            const event of eventsWithoutPrice
        ) {
            console.log(
                `- ${event.title}`
            );

            console.log(
                `  ${event.sourceUrl}`
            );
        }

        console.log(
            `\nEventos sem ageRating: ${eventsWithoutAgeRating.length}`
        );

        for (
            const event of eventsWithoutAgeRating
        ) {
            console.log(
                `- ${event.title}`
            );

            console.log(
                `  ${event.sourceUrl}`
            );
        }

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
