

import { Queue } from 'bullmq';
import { redisConnection } from '../shared/redis';
import { RawEvent } from '../shared/rawEvent';
import { ingestionJobId } from '../shared/jobId';
import { logDuplicatedEvent, logError } from '../shared/eventLog';



const ingestionQueue = new Queue('events-ingestion-queue', { connection: redisConnection });


export async function pushToIngestionQueue(eventData: RawEvent): Promise<void> {
  try {
      const jobId = ingestionJobId(eventData.sourceUrl);
      const existingJob = await ingestionQueue.getJob(jobId);

      if (existingJob) {
        const state = await existingJob.getState();
        logDuplicatedEvent(eventData.sourceUrl, state);
        if (state === 'failed') {
          // Failed jobs may contain an older, incomplete scrape. Remove that
          // record so a new crawl can enqueue the corrected payload.
          await existingJob.remove();
        } else {
          return;
        }
      }

      await ingestionQueue.add('process-event', eventData, {
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

  } catch (error) {
      logError('Error adding job to the ingestion queue:', error);
      throw error;
  }
}
