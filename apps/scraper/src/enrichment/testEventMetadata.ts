import { extractEventMetadata } from './eventMetadata';

const tests = [
    // 'Entrada gratuita. M/12. Lotação: 60 pessoas.',
    // 'Bilhete: 15€. M/6. Máximo de 30 participantes.',
    // '36€ plateia | 34€ balcão. M/12.',
    // 'Restam 4 vagas. Para crianças dos 6 aos 12 anos.',
    // 'Acesso gratuito mediante inscrição.',
    // 'Preço: 12,50 €.',
    // 'Bilhete 7.5€.',
    // 'Lotação limitada a 25 participantes.',
    // 'Capacidade máxima: 120 lugares.',
    // 'Máximo de 15 participantes.',
    // 'Maiores de 18 anos.',
    // '+16',
    // 'M18',
    // 'Evento para jovens dos 12 aos 16 anos.',
    // 'Restam 8 lugares disponíveis.',
    // 'Donativo sugerido: 5€.',
    //'O Observatório Astronómico de Lisboa é o Observatório Nacional português e foi a instituição de referência para o estabelecimento da hora legal e publicação de dados astronómicos (almanaques e astronovas).O Real Observatório Astronómico de Lisboa, situado na Tapada da Ajuda, foi mandado construir por D. Pedro V. Atualmente denominado de Observatório Astronómico de Lisboa, foi o Observatório Nacional português, instituição de referência. A sua importância científica e histórica, em conjunto com a sua coleção, biblioteca e arquivo, não tem par no país.Preço: gratuitoLotação máxima: 30 participantes Taxa de estacionamento do parque do ISA: 0,50€Mais informações.Fonte: https://www.ulisboa.pt/evento/visita-ao-observatorio-astronomico-de-lisboa-12'
    'Esta oficina consiste numa atividade de pintura com aguarelas, cola branca e sal. Os participantes serão convidados a dar asas à imaginação, enquanto aprendem um pouco mais sobre as espécies de fauna e flora das salinas.Público-Alvo: AdaptávelHorário:14h30 – 15h30Preço:Gratuito, com inscrição obrigatória: ambiente@cm-aveiro.pt Informação adicional:ambiente@cm-aveiro.pt Mín. 6 pessoas; Máx. 15 pessoasFonte: https://www.cm-aveiro.pt/visitantes/agenda-aveiro/evento/salinas-no-pincel'


];

for (const test of tests) {
    console.log('\nDESCRIÇÃO:');
    console.log(test);

    console.log('METADATA:');
    console.log(
        extractEventMetadata(test)
    );
}