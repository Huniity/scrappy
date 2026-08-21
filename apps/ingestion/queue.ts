

import { Queue } from 'bullmq';
import { redisConnection } from '../shared/redis';
import { RawEvent } from '../shared/rawEvent';
import { ingestionJobId } from '../shared/jobId';



const ingestionQueue = new Queue('events-ingestion-queue', { connection: redisConnection });


export async function pushToIngestionQueue(eventData: RawEvent): Promise<void> {
  try {
      console.log('Adding jobs to the ingestion queue...');
      await ingestionQueue.add('process-event', eventData, {
        jobId: ingestionJobId(eventData.sourceUrl),
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });
  } catch (error) {
      console.error('Error adding job to the ingestion queue:', error);
  }
}
