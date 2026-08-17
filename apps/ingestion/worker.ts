

import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { redisConnection } from '../shared/redis';
import * as dotenv from 'dotenv';
import { RawEvent } from '../shared/rawEvent';


dotenv.config();


const apiUrl = process.env.API_URL || 'http://localhost:5000/events';

console.log('Inicializing Worker... searching for jobs in the queue...');

const ingestionWorker = new Worker(
	'events-ingestion-queue', async (job: Job<RawEvent>) => {
		const rawData = job.data;
		const apiData = {
			title: rawData.title,
			description: rawData.description,
			sourceUrl: rawData.sourceUrl,
			startDate: rawData.startDate,
			type: rawData.type,
			location: {
				name: rawData.locationName ?? rawData.locality,
				locality: rawData.locality,
				district: rawData.district,
				region: rawData.region,
				dicoCode: rawData.dicoCode,
				country: 'PT',
			},
		};
		const timestamp = new Date();
		console.log('Processing job:', job.id, 'with data:', rawData, 'at: ', timestamp);

		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(apiData),
			});

			if (!response.ok){
				const errorData = await response.text();
				throw new Error(`Failed to send data to API. Status: ${response.status} | Response: ${errorData}`);
			}
		}
		catch (error: any) {
			console.error('Error sending data to API:', error);
			throw error;
		}
	},
	{
		connection: redisConnection,
		limiter: {
			max: 5,
			duration: 1000
		}
	}
);


ingestionWorker.on('completed', (job) => {
	console.log(`Job ${job.id} completed successfully.`);
});

ingestionWorker.on('failed', (job, err) => {
	console.error(`Job ${job?.id} failed with error:`, err);
});
