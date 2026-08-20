

import { z } from "zod";
import { districtSchema, nuts2RegionSchema } from '../shared/territory';

export const crawlerEngineSchema = z.enum(["auto", "cheerio", "playwright"]);

export const crawlJobSchema = z.object({
    sourceUrl: z.string().url(),
    engine: crawlerEngineSchema.default('auto'),
    locality: z.string().trim().min(1).optional(),
    district: districtSchema.optional(),
    region: nuts2RegionSchema.optional(),
    dicoCode: z
        .string()
        .regex(
        /^\d{4}$/,
        'DICO code must contain exactly four digits',
        )
        .optional(), 
});

export type CrawlerEngine = z.infer<typeof crawlerEngineSchema>;
export type CrawlJob = z.infer<typeof crawlJobSchema>;