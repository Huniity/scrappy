

import assert from 'node:assert/strict';
  import test from 'node:test';
  import {
    Queue,
    QueueEvents,
    Worker,
  } from 'bullmq';
  import { redisConnection } from './redis';

  test('adds and consumes a BullMQ job', async () => {
    const queueName = `scrappy-redis-test-${process.pid}`;
    console.log(`Running test with queue name: ${queueName}`);

    const queue = new Queue(queueName, {
      connection: redisConnection,
    });

    console.log(`Queue created with name: ${queueName}`);

    const queueEvents = new QueueEvents(queueName, {
      connection: redisConnection,
    });

    console.log(`QueueEvents created for queue: ${queueName}`);

    const worker = new Worker(
      queueName,
      async (job) => {
        return {
          doubled: job.data.value * 2,
        };
      },
      {
        connection: redisConnection,
      },
    );
    console.log(`Worker created for queue: ${queueName}`);

    try {
      await worker.waitUntilReady();
      await queueEvents.waitUntilReady();

      const job = await queue.add('double-number', {
        value: 21,
      });
      console.log(`Job added to queue: ${queueName} with ID: ${job.id}`);
      const result = await job.waitUntilFinished(
        queueEvents,
        5000,
      );
      console.log(`Job completed with result: ${JSON.stringify(result)}`);

      assert.deepEqual(result, {
        doubled: 42,
      });
    } finally {
      await worker.close();
      await queueEvents.close();
      await queue.obliterate({ force: true });
      await queue.close();
      console.log(`Cleaned up queue: ${queueName}`);
    }
  });