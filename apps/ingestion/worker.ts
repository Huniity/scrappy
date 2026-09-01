

import { Job, UnrecoverableError, Worker } from 'bullmq';
import { toApiLocalityName } from './locality';
import { env } from '../shared/env';
import { redisConnection } from '../shared/redis';
import { rawEventSchema, RawEvent } from '../shared/rawEvent';
import { logDuplicatedEvent, logError } from '../shared/eventLog';


const apiUrl = env.API_URL;

type RawAgent = RawEvent['organizer'][number];

function toApiAgent(agent: RawAgent) {
	return {
		name: agent.name,
		type: agent.type,
		url: agent.url,
		imageUrl: agent.image,
		sameAs: typeof agent.sameAs === 'string' ? agent.sameAs : agent.sameAs?.[0],
	};
}

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
			location: {
				name: rawData.locationName ?? rawData.sourceLocality ?? rawData.municipality,
				streetAddress: rawData.streetAddress,
				postalCode: rawData.postalCode,
				locality: apiLocality,
				district: rawData.district,
				region: rawData.region,
				dicoCode: rawData.dicoCode,
				country: 'PT',
				url: rawData.locationUrl,
				sameAs: rawData.locationSameAs,
				latitude: rawData.latitude,
				longitude: rawData.longitude,
			},
			alternateName: rawData.alternateName,
			isAccessibleForFree: rawData.isAccessibleForFree,
			eventAttendanceMode: rawData.eventAttendanceMode,
			doorTime: rawData.doorTime,
			duration: rawData.duration,
			eventStatus: rawData.eventStatus,
			keywords: rawData.keywords,
			schedule: rawData.schedule,
			audience: rawData.audience,
			organizer: rawData.organizer?.map(toApiAgent),
			promoter: rawData.promoter?.map(toApiAgent),
			maintainer: rawData.maintainer?.map(toApiAgent),
			performers: rawData.performers?.map(toApiAgent),
			funder: rawData.funder?.map(toApiAgent),
			actor: rawData.actor?.map(toApiAgent),
			director: rawData.director?.map(toApiAgent),
			composer: rawData.composer?.map(toApiAgent),
			offers:
				rawData.offers.length > 0
					? rawData.offers
					: rawData.price === undefined
						? []
						: [
							{
								name: 'Bilhete',
								price: rawData.price,
								priceCurrency: 'EUR',
							},
						],

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
			const ingestionAction = response.headers.get('x-ingestion-action');
			const isDuplicate =
				response.status === 400 &&
				responseBody.includes(
					'An event with the same district, title, and start date already exists.',
				);

			if (isDuplicate) {
				logDuplicatedEvent(rawData.sourceUrl, 'API');
				return { action: 'skipped' as const };
			}

			if (!response.ok) {
				const message =
					`Failed to send ${rawData.sourceUrl} to API. ` +
					`Status: ${response.status} | Response: ${responseBody}`;

				if (response.status >= 400 && response.status < 500) {
					throw new UnrecoverableError(message);
				}

				throw new Error(message);
			}

			console.log(
				`API accepted job ${job.id} for ${rawData.sourceUrl} ` +
				`with status ${response.status}.`,
			);

			if (ingestionAction === 'merged') {
				console.log(
					`Merged job ${job.id}; updated fields: ` +
					`${response.headers.get('x-ingestion-updated-fields') ?? 'unknown'}.`,
				);
				return { action: 'merged' as const };
			}

			if (ingestionAction === 'skipped') {
				return { action: 'skipped' as const };
			}

			return { action: 'created' as const };
		}
		catch (error) {
			logError('Error sending data to API:', error);
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
	logError(`Job ${job?.id} failed with error:`, err);
});

ingestionWorker.on('error', err => {
	logError('Worker encountered an error:', err);
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
		logError('Failed to close ingestion worker:', error);
		process.exitCode = 1;
	}
}

process.once('SIGINT', () => {
	void shutdown('SIGINT');
});

process.once('SIGTERM', () => {
	void shutdown('SIGTERM');
});
