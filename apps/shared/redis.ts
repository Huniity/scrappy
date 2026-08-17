

import { env } from './env'


export const redisConnection = {
    port: env.REDIS_PORT,
    host: env.REDIS_HOST,
    maxRetriesPerRequest: null,
    ...( env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
};