

import { Queue } from 'bullmq';
import { redisConnection } from '../shared/redis';
import { RawEvent } from '../shared/rawEvent';
import { ingestionJobId } from '../shared/jobId';



const ingestionQueue = new Queue('events-ingestion-queue', { connection: redisConnection });


export async function pushToIngestionQueue(eventData: RawEvent): Promise<void> {
  try {
      const jobId = ingestionJobId(eventData.sourceUrl);
      const existingJob = await ingestionQueue.getJob(jobId);

      if (existingJob) {
        const state = await existingJob.getState();

        if (state === 'failed') {
          // Failed jobs may contain an older, incomplete scrape. Remove that
          // record so a new crawl can enqueue the corrected payload.
          await existingJob.remove();
        } else {
          console.log(
            `Ingestion job ${jobId} already exists with state ${state}; ` +
            `skipping ${eventData.sourceUrl}.`,
          );
          return;
        }
      }

      const job = await ingestionQueue.add('process-event', eventData, {
        jobId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: {
          age: 24 * 60 * 60,
          count: 1000,
        },
      });

      console.log(
        `Ingestion job ${job.id} queued for ${eventData.sourceUrl}.`,
      );
  } catch (error) {
      console.error('Error adding job to the ingestion queue:', error);
      throw error;
  }
}
