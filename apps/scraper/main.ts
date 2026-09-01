

import { CheerioCrawler, log, LogLevel } from 'crawlee';
import sources from './config/sources.json';
import { crawlJobsSchema } from './source';
import {
    closePlaywrightFallback,
    fallbackBolEventWithPlaywright,
    fallbackViralAgendaEventWithPlaywright,
    isBolEventDetailUrl,
    isViralAgendaEventDetailUrl,
    router,
} from './router';
import { logCrawlFinished, logError } from '../shared/eventLog';
import {
    closeIngestionQueue,
    flushIngestionBatch,
} from '../ingestion/queue';

// Crawlee logs the final request error before calling failedRequestHandler.
// Keep its internal output silent so we can hand off to Playwright first and
// only print one error after both engines have exhausted their attempts.
log.setLevel(LogLevel.OFF);
const crawlJobs =
    crawlJobsSchema.parse(sources);


const browserUserAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/131.0.0.0 Safari/537.36';

/**
 * Main function to run the web crawler. It initializes a CheerioCrawler with the specified request handler and pre-navigation hooks, and then runs the crawler with the provided crawl jobs.
 * If the crawler encounters an error, it logs the error and sets the process exit code to 1.
 * @returns {Promise<void>} A promise that resolves when the crawler has finished running.
 */
async function main(): Promise<void> {
    const crawler = new CheerioCrawler({
        requestHandler: router,
        failedRequestHandler: async ({ request, log }) => {
            if (
                isBolEventDetailUrl(request.url) ||
                isViralAgendaEventDetailUrl(request.url)
            ) {
                try {
                    const recovered = isBolEventDetailUrl(request.url)
                        ? await fallbackBolEventWithPlaywright(
                            request.url,
                            log,
                        )
                        : await fallbackViralAgendaEventWithPlaywright(
                            request.url,
                            log,
                        );

                    if (recovered) {
                        return;
                    }
                } catch (error) {
                    logError(
                        `Request failed after 3 Cheerio + 3 Playwright attempts: ${request.url}`,
                        error,
                    );
                    return;
                }

                logError(
                    `Request failed after 3 Cheerio + 3 Playwright attempts: ${request.url} ` +
                    `error=${request.errorMessages?.at(-1) ?? 'unknown'}`,
                );
                return;
            }

            logError(
                `Request failed: ${request.url} ` +
                `retries=${request.retryCount} ` +
                `error=${request.errorMessages?.at(-1) ?? 'unknown'}`,
            );
        },

        preNavigationHooks: [
            async (_context, gotOptions) => {
                gotOptions.headers = {
                    ...gotOptions.headers,
                    'user-agent': browserUserAgent,
                };
            },
        ],

        // Crawlee counts this as retries after the first request, so 2 means
        // 3 total Cheerio attempts before failedRequestHandler is called.
        maxRequestRetries: 2,
        maxRequestsPerCrawl: 5000,
    });

    try {
        await crawler.run(
            crawlJobs.map((job) => ({
                url: job.sourceUrl,
                userData: {
                    crawlJob: job,
                },
            })),
        );

        await flushIngestionBatch();

        logCrawlFinished();
    } finally {
        await closePlaywrightFallback();
        await closeIngestionQueue();
    }
}

/**
 * Runs the main function and handles any errors that occur during the crawling process. If an error is encountered, it logs the error message and sets the process exit code to 1.
 * This ensures that the application exits with a non-zero status code to indicate failure.
 * @returns {Promise<void>} A promise that resolves when the main function has completed or an error has been handled.
 */
main().catch((error) => {
    logError('Crawler failed:', error);
    process.exitCode = 1;
});
