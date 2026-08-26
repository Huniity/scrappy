import { Queue } from 'bullmq';
import { redisConnection } from '../shared/redis';


  const queue = new Queue(
    'events-ingestion-queue',
    { connection: redisConnection },
  );

  async function clearCompletedJobs() {
    try {
      const jobs =
        await queue.getJobs(['completed'], 0, -1);

      console.log(`Encontrados: ${jobs.length}`);

      for (const job of jobs) {
        await job.remove();
        console.log(`Removido: ${job.id}`);
      }

      console.log('Jobs completed removidos.');
    } finally {
      await queue.close();
    }
  }

  clearCompletedJobs().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });