import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';


const myQueue = new Queue('foo', { connection: redisConnection });

async function addJobs() {
  await myQueue.add('myJobName', { foo: 'bar' });
  await myQueue.add('myJobName', { qux: 'baz' });
}

await addJobs();