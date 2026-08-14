import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';
import { error } from 'console';


dotenv.config();


const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);



export const redisConnection = new Redis(
    {
    port: redisPort,
    host: redisHost,
    maxRetriesPerRequest: null
    }
);

redisConnection.on('connect', () => {
    console.log(`Connected to Redis at: ${redisHost}:${redisPort}`);
});

redisConnection.on('error', error => {
    console.error('Redis connection error:', error);
});