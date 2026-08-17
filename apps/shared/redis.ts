

import { Redis } from 'ioredis';
import { env } from './env.ts'


export function redisConnection(): Redis {
    return new Redis({
    port: env.REDIS_PORT,
    host: env.REDIS_HOST,
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null
    });
}

redisConnection.on('connect', () => {
    console.log(`Connected to Redis at: ${redisHost}:${redisPort}`);
});

redisConnection.on('error', error => {
    console.error('Redis connection error:', error);
});