

import { CheerioCrawler } from 'crawlee';
import sources from './config/sources.json';
import { crawlJobsSchema } from './source';
import { router } from './router';


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

        preNavigationHooks: [
            async (_context, gotOptions) => {
                gotOptions.headers = {
                    ...gotOptions.headers,
                    'user-agent': browserUserAgent,
                };
            },
        ],

        maxRequestsPerCrawl: 40,
    });

    await crawler.run(
        crawlJobs.map((job) => ({
            url: job.sourceUrl,
            userData: {
                crawlJob: job,
            },
        })),
    );
}

/**
 * Runs the main function and handles any errors that occur during the crawling process. If an error is encountered, it logs the error message and sets the process exit code to 1.
 * This ensures that the application exits with a non-zero status code to indicate failure.
 * @returns {Promise<void>} A promise that resolves when the main function has completed or an error has been handled.
 */
main().catch((error) => {
    console.error('Crawler failed:', error);
    process.exitCode = 1;
});
