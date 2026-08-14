import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

const queue = new Queue('events-ingestion-queue', { connection: redisConnection });

async function injectTest() {
  await queue.add('test-event', {
    title: 'American Cars',
    sourceUrl: 'https://cm-faro.pt/teste',
    locality: 'Faro',
    startDate: '2026-08-20T21:00:00Z',
    description: 'Este é um evento de teste injetado na fila para fins de teste.'
  });
  console.log('Injeção concluída!');
  process.exit(0);
}

injectTest();
