

import { Job, Queue, QueueEvents } from 'bullmq';
import { redisConnection } from '../shared/redis';
import { RawEvent } from '../shared/rawEvent';
import { ingestionJobId } from '../shared/jobId';
import { logDuplicatedEvent, logError } from '../shared/eventLog';



const ingestionQueue = new Queue('events-ingestion-queue', { connection: redisConnection });
const ingestionQueueEvents = new QueueEvents('events-ingestion-queue', {
  connection: redisConnection,
});

const INGESTION_BATCH_SIZE = 100;
let pendingBatch: Job<RawEvent>[] = [];
let enqueueChain: Promise<void> = Promise.resolve();

type IngestionAction = 'created' | 'merged' | 'skipped';

type JobSettlement =
  | { status: 'completed'; action?: IngestionAction }
  | { status: 'failed'; reason: string };

const settlements = new Map<string, JobSettlement>();
const settlementWaiters = new Map<
  string,
  (settlement: JobSettlement) => void
>();

function recordSettlement(jobId: string, settlement: JobSettlement): void {
  const waiter = settlementWaiters.get(jobId);

  if (waiter) {
    settlementWaiters.delete(jobId);
    waiter(settlement);
    return;
  }

  settlements.set(jobId, settlement);
}

ingestionQueueEvents.on('completed', ({ jobId, returnvalue }) => {
  const action =
    typeof returnvalue === 'object' &&
    returnvalue !== null &&
    'action' in returnvalue
      ? (returnvalue.action as IngestionAction)
      : undefined;

  recordSettlement(jobId, { status: 'completed', action });
});

ingestionQueueEvents.on('failed', ({ jobId, failedReason }) => {
  recordSettlement(jobId, { status: 'failed', reason: failedReason });
});

ingestionQueueEvents.on('error', (error) => {
  logError('Ingestion queue events encountered an error:', error);
});

async function waitForJob(job: Job<RawEvent>): Promise<JobSettlement> {
  const jobId = job.id;

  if (!jobId) {
    return { status: 'failed', reason: 'Job has no ID.' };
  }

  const recorded = settlements.get(jobId);
  if (recorded) {
    settlements.delete(jobId);
    return recorded;
  }

  const state = await job.getState();
  const recordedAfterStateCheck = settlements.get(jobId);
  if (recordedAfterStateCheck) {
    settlements.delete(jobId);
    return recordedAfterStateCheck;
  }

  if (state === 'completed') {
    const result = job.returnvalue as { action?: IngestionAction } | null;
    return { status: 'completed', action: result?.action };
  }

  if (state === 'failed') {
    return {
      status: 'failed',
      reason: job.failedReason ?? 'Unknown ingestion error.',
    };
  }

  return new Promise<JobSettlement>((resolve) => {
    settlementWaiters.set(jobId, resolve);

    // Close the small race between the state check and waiter registration.
    const settlement = settlements.get(jobId);
    if (settlement) {
      settlements.delete(jobId);
      settlementWaiters.delete(jobId);
      resolve(settlement);
    }
  });
}

async function waitForBatch(jobs: Job<RawEvent>[]): Promise<void> {
  const uniqueJobs = [...new Map(
    jobs
      .filter((job): job is Job<RawEvent> & { id: string } => Boolean(job.id))
      .map((job) => [job.id, job]),
  ).values()];

  if (uniqueJobs.length === 0) {
    return;
  }

  console.log(`Waiting for ingestion batch of ${uniqueJobs.length} event(s) to reach the API...`);
  const results = await Promise.all(uniqueJobs.map(waitForJob));
  const counts = {
    created: 0,
    merged: 0,
    skipped: 0,
    succeeded: 0,
    failed: 0,
  };

  for (const result of results) {
    if (result.status === 'failed') {
      counts.failed += 1;
    } else if (result.action) {
      counts[result.action] += 1;
    } else {
      counts.succeeded += 1;
    }
  }

  console.log(
    'Ingestion batch finished: ' +
    `${counts.created} created, ` +
    `${counts.merged} merged, ` +
    `${counts.skipped} skipped, ` +
    `${counts.succeeded} succeeded (uncategorized), ` +
    `${counts.failed} failed.`,
  );
}

async function enqueue(eventData: RawEvent): Promise<void> {
  const job = await addToIngestionQueue(eventData);

  if (!job) {
    return;
  }

  pendingBatch.push(job);

  if (pendingBatch.length >= INGESTION_BATCH_SIZE) {
    const batch = pendingBatch;
    pendingBatch = [];
    await waitForBatch(batch);
  }
}


export async function pushToIngestionQueue(eventData: RawEvent): Promise<void> {
  const operation = enqueueChain.then(() => enqueue(eventData));
  enqueueChain = operation.catch(() => undefined);
  return operation;
}

async function addToIngestionQueue(eventData: RawEvent): Promise<Job<RawEvent> | undefined> {
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
          // Include jobs recovered from an earlier scraper/container run in
          // the current barrier, so this run does not report completion while
          // they are still waiting to be written.
          return existingJob;
        }
      }

      return await ingestionQueue.add('process-event', eventData, {
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

export async function flushIngestionBatch(): Promise<void> {
  const operation = enqueueChain.then(async () => {
    const batch = pendingBatch;
    pendingBatch = [];
    await waitForBatch(batch);
  });
  enqueueChain = operation.catch(() => undefined);
  return operation;
}

export async function closeIngestionQueue(): Promise<void> {
  await flushIngestionBatch();
  await Promise.all([
    ingestionQueue.close(),
    ingestionQueueEvents.close(),
  ]);
}
