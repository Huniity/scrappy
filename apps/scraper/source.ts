

import { z } from "zod";

export const crawlerEngineSchema = z.enum(["auto", "cheerio", "playwright"]);

/**
 * Schema for a single crawl job, which includes the source URL, the crawler engine to use, the source ID, and the timezone.
 * The source URL must be a valid URL, the source ID must be a non-empty string with a maximum length of 100 characters, and the timezone must also be a non-empty string with a maximum length of 100 characters.
 * The crawler engine defaults to 'auto' if not specified.
 */
export const crawlJobSchema = z.object({
    sourceUrl: z.string().url(),
    engine: crawlerEngineSchema.default('auto'),
    sourceId: z.string().trim().min(1).max(100),
    timezone: z.string().trim().min(1).max(100),
});

export const crawlJobsSchema = z.array(crawlJobSchema);

export type CrawlerEngine = z.infer<typeof crawlerEngineSchema>;
export type CrawlJob = z.infer<typeof crawlJobSchema>;
export type CrawlJobs = z.infer<typeof crawlJobsSchema>;