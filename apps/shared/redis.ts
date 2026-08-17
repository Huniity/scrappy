

import { Redis } from 'ioredis';
import { env } from './env'


export function redisConnection(): Redis {
    const client = new Redis({
        port: env.REDIS_PORT,
        host: env.REDIS_HOST,
        password: env.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
    });

    client.on('connect', () => {
        console.log(`Connected to Redis at: ${env.REDIS_HOST}:${env.REDIS_PORT}`);
    });

    client.on('error', (error) => {
        console.error('Redis connection error:', error);
    });

    return client;
}