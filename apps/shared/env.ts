

import 'dotenv/config';
import { z } from 'zod';


const envSchema = z.object({
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    API_URL: z.string().url().default('http://localhost:5000/events'),
})

export const env = envSchema.parse(process.env)