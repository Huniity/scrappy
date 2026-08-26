

import { Job, Worker } from 'bullmq';
import { toApiLocalityName } from './locality';
import { env } from '../shared/env';
import { redisConnection } from '../shared/redis';
import { rawEventSchema, RawEvent } from '../shared/rawEvent';

const apiUrl = env.API_URL;

console.log('Inicializing Worker... searching for jobs in the queue...');

const ingestionWorker = new Worker(
	'events-ingestion-queue', async (job: Job<RawEvent>) => {
		const rawData = rawEventSchema.parse(job.data);
		const apiLocality = toApiLocalityName(rawData.municipality, {
			longitude: rawData.longitude,
			region: rawData.region,
		});
		const apiData = {
			title: rawData.title,
			description: rawData.description,
			sourceUrl: rawData.sourceUrl,
			startDate: rawData.startDate,
			endDate: rawData.endDate,
			imageUrl: rawData.imageUrl,
			type: rawData.type,
			ageRating: rawData.ageRating,
			maximumAttendeeCapacity: rawData.maximumAttendeeCapacity,
			offers: rawData.price === undefined ? [] : [
				{
					name: 'Bilhete',
					price: rawData.price,
					priceCurrency: 'EUR',
				},
			],
			location: {
				name: rawData.locationName ?? rawData.sourceLocality ?? rawData.municipality,
				locality: apiLocality,
				district: rawData.district,
				region: rawData.region,
				dicoCode: rawData.dicoCode,
				country: 'PT',
				latitude: rawData.latitude,
				longitude: rawData.longitude,
			},

		};
		console.log(
			`Processing job ${job.id} for ${rawData.sourceUrl} ` +
			`(attempt ${job.attemptsMade + 1}) with locality ${apiLocality}`,
		);

		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				signal: AbortSignal.timeout(30_000),
				body: JSON.stringify(apiData),
			});
			const responseBody = await response.text();
			const isDuplicate =
				response.status === 400 &&
				responseBody.includes(
					'An event with the same district, title, and start date already exists.',
				);

			if (isDuplicate) {
				console.warn(
					`Event from ${rawData.sourceUrl} already exists in the API; ` +
					'treating it as successfully ingested.',
				);
				return;
			}

			if (!response.ok){
				throw new Error(
					`Failed to send ${rawData.sourceUrl} to API. ` +
					`Status: ${response.status} | Response: ${responseBody}`,
				);
			}

			console.log(
				`API accepted job ${job.id} for ${rawData.sourceUrl} ` +
				`with status ${response.status}.`,
			);
		}
		catch (error) {
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

ingestionWorker.on('error', err => {
	console.error('Worker encountered an error:', err);
})

let isShuttingDown = false;

  async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;

    console.log(
      `${signal} received; closing ingestion worker...`,
    );

    try {
      await ingestionWorker.close();
      console.log('Ingestion worker closed.');
      process.exitCode = 0;
    } catch (error) {
      console.error(
        'Failed to close ingestion worker:',
        error,
      );
      process.exitCode = 1;
    }
  }

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
