import { extractEventMetadata } from './eventMetadata';

const tests = [
    'Entrada gratuita. M/12. Lotação: 60 pessoas.',
    'Bilhete: 15€. M/6. Máximo de 30 participantes.',
    '36€ plateia | 34€ balcão. M/12.',
    'Restam 4 vagas. Para crianças dos 6 aos 12 anos.',
    'Acesso gratuito mediante inscrição.',
    'Preço: 12,50 €.',
    'Bilhete 7.5€.',
    'Lotação limitada a 25 participantes.',
    'Capacidade máxima: 120 lugares.',
    'Máximo de 15 participantes.',
    'Maiores de 18 anos.',
    '+16',
    'M18',
    'Evento para jovens dos 12 aos 16 anos.',
    'Restam 8 lugares disponíveis.',
    'Donativo sugerido: 5€.',
];

for (const test of tests) {
    console.log('\nDESCRIÇÃO:');
    console.log(test);

    console.log('METADATA:');
    console.log(
        extractEventMetadata(test)
    );
}