# Fluxo completo da plataforma Scrappy

Resumo técnico, em português, do percurso desde a descoberta dos sites até à apresentação dos eventos no Next.js.

## 1. Visão geral

O sistema está dividido em quatro responsabilidades:

1. scraper: visita fontes externas, descobre páginas de eventos e extrai JSON-LD.
2. Redis + BullMQ: transporta os eventos entre o scraper e o worker.
3. ingestion-worker + API .NET: valida, normaliza, deduplica e grava os eventos.
4. MongoDB + Next.js: guarda, consulta e apresenta os eventos.

Fluxo principal:

~~~text
sites externos
    -> scraper Cheerio ou Playwright
    -> JSON-LD / dados da página
    -> RawEvent validado
    -> Redis / BullMQ
    -> ingestion-worker
    -> POST /events na API .NET
    -> normalização geográfica e deduplicação
    -> MongoDB: DistrictEvents
    -> queries da API
    -> Next.js / backoffice / mapa
~~~

O scraper não grava diretamente no MongoDB. Também não chama a API diretamente para cada evento: coloca os eventos numa fila Redis e o worker trata da ingestão.

## 2. Infraestrutura e serviços

No docker/docker-compose.yml existem, em termos funcionais, estes serviços:

| Serviço | Função | Ligação principal |
| --- | --- | --- |
| scraper | Descoberta e extração dos eventos | lê sources.json, publica na fila |
| scheduler | Arranque periódico do scraper | dispara execuções agendadas |
| ingestion-worker | Consumo da fila e envio para a API | Redis -> POST /events |
| api | Regras de negócio e endpoints HTTP | MongoDB |
| mongodb | Persistência dos eventos | base scrappy_db |
| redis | Fila BullMQ e estado dos jobs | redis:6379 |
| next | Interface web | chama a API via NEXT_PUBLIC_API_URL |

Configuração observada:

~~~text
MongoDB: mongodb://mongodb:27017/scrappy_db
Redis:    redis:6379
API:      http://api:5000/events       dentro da rede Docker
~~~

## 3. Configuração das fontes

O ficheiro apps/scraper/config/sources.json define as fontes. Cada entrada contém, entre outros campos:

~~~json
{
  "id": "bol-faro",
  "url": "https://www.bol.pt/Comprar/pesquisa/0-0-8-0-0-0/faro",
  "sourceId": "bol-faro",
  "engine": "cheerio",
  "timezone": "Europe/Lisbon"
}
~~~

O ficheiro é validado com Zod antes de o crawler arrancar. Atualmente, as fontes ativas são três páginas do BOL:

- pesquisa BOL para Faro;
- página BOL de Alcobaça;
- pesquisa BOL para Lourinhã.

O código para Viral Agenda existe, incluindo suporte para Playwright, mas não há atualmente entradas viral-agenda-* ativas no sources.json. Portanto, neste estado, a execução configurada vai buscar eventos ao BOL.

Os campos engine e timezone são validados na configuração, mas o fluxo principal seleciona Cheerio para a descoberta normal. O timezone é aplicado durante a interpretação das datas.

## 4. Descoberta e scraping

### 4.1 Arranque do crawler

apps/scraper/main.ts cria um CheerioCrawler com:

- máximo de 5000 pedidos por execução;
- duas repetições após falha, ou seja, até três tentativas Cheerio;
- headers de browser;
- router por labels;
- handler para falhas.

As URLs configuradas são transformadas em requests iniciais. A execução pode ser disparada pelo serviço scraper ou pelo scheduler, dependendo do profile Docker usado.

### 4.2 Descoberta normal

O handler default recebe o HTML com Cheerio e procura links de detalhe.

Para BOL, reconhece URLs com o padrão aproximado:

~~~text
/Comprar/Bilhetes/<id>-...
~~~

Cada link encontrado é convertido numa nova request com label BOL_EVENT_DETAIL.

Para Viral Agenda, o router reconhece URLs no formato:

~~~text
/pt/events/<slug>
~~~

Esses links recebem a label EVENT_DETAIL, depois de passar por uma blacklist de links que não representam eventos.

### 4.3 Playwright e páginas dinâmicas

Quando a fonte precisa de JavaScript, o código apps/scraper/src/crawlers/viralAgenda.ts usa Playwright para:

- abrir a página;
- fazer scroll incremental;
- aguardar o carregamento de novos eventos;
- recolher os links de detalhe;
- parar ao encontrar li.viral-event-past.

Mesmo no fluxo normal, o crawler começa com Cheerio. Se o HTML estiver vazio, inválido ou não tiver JSON-LD utilizável, existe fallback para Playwright. O failedRequestHandler permite três tentativas Playwright adicionais depois das tentativas Cheerio.

## 5. Extração dos eventos em JSON-LD

### 5.1 Onde procura

Nos handlers de detalhe, o scraper procura todos os elementos:

~~~html
<script type="application/ld+json">...</script>
~~~

Cada conteúdo é lido e passado por JSON.parse. O extrator suporta:

- um objeto JSON;
- um array de objetos;
- objetos com @graph;
- múltiplos scripts JSON-LD na mesma página.

### 5.2 BOL

apps/scraper/sources/bol/extract.ts escolhe o primeiro objeto cujo @type é Event e que tenha name e startDate.

Extrai principalmente:

- título: name;
- URL: url;
- imagem: image;
- início e fim: startDate e endDate;
- duração: duration;
- descrição: description;
- local: location.name;
- morada: location.address;
- coordenadas: location.geo;
- bilhetes: offers.

Se o JSON-LD não trouxer coordenadas, tenta extraí-las do URL do iframe do mapa. Se a descrição for insuficiente, procura também meta tags e seletores HTML como itemprop=description, .event-description, .description e .descricao.

### 5.3 Viral Agenda

apps/scraper/sources/viralAgenda/extract.ts usa a mesma base JSON-LD, mas aceita tipos de evento mais amplos, incluindo tipos terminados em Event e Festival.

Além dos campos base, tenta extrair agentes, audiência, horários, ofertas, estado, palavras-chave e informação de acessibilidade ou presença.

As coordenadas podem vir do JSON-LD, de URLs do Google Maps ou de um pedido adicional a:

~~~text
POST <eventPath>/map
~~~

com ajax=1.

### 5.4 Falhas de extração

Se não existir um JSON-LD válido, se faltar título ou data, ou se a página não cumprir as regras da fonte, o request é considerado falhado ou é encaminhado para o fallback Playwright. Depois de esgotadas as tentativas, o evento não é enviado para ingestão.

## 6. Normalização no scraper

Antes de publicar, os dados são convertidos para o contrato RawEvent partilhado entre scraper e worker.

### Texto

Os textos são aparados, o HTML é removido e os espaços repetidos são compactados. A descrição do Viral Agenda é limitada a 2000 caracteres.

O schema exige, entre outras regras:

- título entre 3 e 250 caracteres;
- descrição entre 10 e 2000 caracteres;
- URL HTTP ou HTTPS válida;
- data de início válida;
- localidade ou município identificável.

### URLs e deduplicação técnica

apps/shared/jobId.ts cria uma forma normalizada da URL:

- transforma protocolo e host em minúsculas;
- remove o fragmento #...;
- remove portas padrão;
- remove a barra final;
- remove tracking como utm_*, fbclid, gclid, mc_cid e mc_eid;
- ordena os parâmetros restantes.

Depois calcula SHA-256 dessa URL normalizada e usa o resultado no ID do job:

~~~text
ingestion-<sha256(normalizedUrl)>
~~~

Isto evita que a mesma URL seja colocada várias vezes na fila por diferenças cosméticas.

### Datas

As datas com offset preservam esse offset. Datas sem offset são interpretadas em Europe/Lisbon.

No BOL, datas sem offset recebem o offset correto de Lisboa, incluindo horário de verão. Uma data final sem hora é transformada no final desse dia, 23:59:59.

Eventos já passados são filtrados usando a data civil de Lisboa, não apenas uma comparação cega de horas UTC.

### Localização

O scraper tenta obter a localidade por coordenadas e por texto.

A prioridade é:

1. ponto dentro do polígono de apps/scraper/data/geo/municipalities.geojson;
2. correspondência exata do município ou localidade, ignorando maiúsculas, minúsculas e diacríticos;
3. rejeição se não for possível identificar uma localidade portuguesa válida.

No worker existem ainda alguns nomes especiais tratados por toApiLocalityName, como Lagoa, Calheta e Castanheira de Pera.

### Tipo e metadados

eventType.ts converte tipos Schema.org e texto para o enum da aplicação:

- MusicEvent -> Concerto;
- ExhibitionEvent -> Exposição;
- termos como festival, workshop, concerto, crianças, conferência e teatro -> tipo correspondente;
- caso contrário -> Outro.

eventMetadata.ts tenta inferir a partir de descrição e ofertas:

- preço;
- evento gratuito;
- idade mínima;
- capacidade;
- hora de abertura de portas;
- duração.

No fim, o objeto inteiro passa pelo schema RawEvent. Se falhar alguma validação, não é publicado.

## 7. Redis e fila BullMQ

A fila é criada em apps/ingestion/queue.ts com o nome:

~~~text
events-ingestion-queue
~~~

O backend da fila é Redis. O scraper agrupa os eventos em lotes de 100 e publica cada RawEvent como job.

Cada job tem:

- ID determinístico baseado na URL normalizada;
- tentativas máximas: 3;
- backoff exponencial iniciado em 1000 ms;
- remoção dos jobs concluídos;
- retenção de falhados durante 24 horas, com limite de 1000 jobs.

O enqueueChain serializa a publicação para reduzir colisões. Se já existir um job ativo ou concluído com o mesmo ID, reutiliza-o. Se existir um job falhado, remove-o e permite uma nova criação.

Depois de publicar um lote, o scraper espera pelos estados completed ou failed antes de continuar. No fim fecha a ligação da fila.

Existe código separado de deduplicação em apps/scraper/src/deduplication/events.ts, mas o router atual não o chama. A deduplicação efetiva de conteúdo ocorre na API, depois do consumo da fila.

## 8. Ingestion worker

apps/ingestion/worker.ts consome a fila e executa este percurso:

1. recebe o payload do job;
2. valida novamente o RawEvent;
3. converte nomes de localidade para o formato esperado pela API;
4. transforma RawEvent em CreateEventDto;
5. envia POST http://api:5000/events;
6. devolve o resultado ao BullMQ.

Conversões importantes:

- image -> imageUrl;
- agent.sameAs em array -> primeira URL;
- se não houver offers mas existir preço, cria uma oferta Bilhete em EUR;
- mantém listas de palavras-chave, agentes, audiência, horários e ofertas quando existirem.

O worker tem limite de 5 eventos por segundo e timeout HTTP de 30 segundos.

Tratamento de erros:

- erros 4xx são normalmente irrecuperáveis, exceto a resposta conhecida de duplicado;
- erros 5xx, rede e timeout podem ser repetidos pelo BullMQ;
- o resultado usa o header X-Ingestion-Action, com valores como created, merged ou skipped.

## 9. API .NET e validação

A API é configurada em Scrappy/Api.cs e Extensions/ServiceCollectionExtensions.cs. O serviço de eventos usa a coleção MongoDB DistrictEvents.

O endpoint de ingestão é:

~~~http
POST /events
~~~

O serviço executa, de forma resumida:

1. exige uma localidade;
2. consulta GeoDataService.Lookup(locality);
3. usa os dados geográficos encontrados para distrito, região e DICO;
4. normaliza descrição, preenchendo Evento: <título> se a descrição direta for inválida;
5. limita a descrição a 2000 caracteres;
6. normaliza datas para UTC;
7. valida título, datas, URL, tipo, local, agentes, audiência, horários e ofertas;
8. calcula qualidade e estado do evento;
9. mapeia o DTO para o documento MongoDB;
10. executa deduplicação fuzzy;
11. faz InsertOne ou ReplaceOne.

### Datas na API

Uma data inicial sem hora representa a meia-noite. Uma data final sem hora representa o final do dia. Internamente, as datas são armazenadas como BSON DateTime em UTC.

### Score de qualidade

O score tem quatro componentes de 25 pontos:

- descrição com pelo menos 50 caracteres;
- data de início válida;
- local preenchido;
- tipo válido.

O máximo é 100. O serviço também calcula flags como IsFinished, IsPublished e RetentionUntil.

## 10. Deduplicação no MongoDB

A deduplicação principal está em EventServices.cs e EventDeduplicationService.cs.

### Pesquisa de candidatos

Primeiro procura na coleção eventos da mesma localidade, com data de início num intervalo de aproximadamente um dia:

~~~text
mesma localidade AND startDate entre evento.startDate - 1 dia e evento.startDate + 1 dia
~~~

### Critérios de correspondência

Um candidato é considerado o mesmo evento quando combina:

- mesma localidade;
- mesma data civil em Lisboa;
- títulos com Jaccard de tokens igual ou superior a 0.8;
- mesmo local normalizado ou coordenadas a menos de 150 metros.

A normalização do título passa para minúsculas, remove diacríticos e pontuação e ignora o token com.

Há uma regra adicional para horários diferentes: se as fontes forem hosts diferentes, a diferença for até 90 minutos, o local for o mesmo e as coordenadas forem próximas, os eventos podem ser considerados duplicados.

### Merge

Quando encontra duplicado, não cria outro documento. Faz merge dos dados:

- mantém a melhor fonte ou canonicalização de data, dando prioridade ao BOL em determinados conflitos;
- escolhe a descrição mais longa;
- preenche imagem, duração, hora de portas, preço, idade, capacidade e presença quando faltam;
- junta palavras-chave, agentes, ofertas e URLs de origem;
- completa morada, localidade e coordenadas;
- recalcula a qualidade;
- grava com ReplaceOne.

Se o merge não alterar nada, a ação é skipped. Se não houver candidato, faz InsertOne e a ação é created. Se houver alteração, a ação é merged.

Existe também Validator.IsDuplicateOnUpdate, que faz uma verificação exata durante updates através de uma varredura completa. No create normal, a estratégia usada é a deduplicação fuzzy acima.

Não existe atualmente um índice MongoDB único para garantir unicidade por URL ou por identidade de evento. A proteção depende da lógica da aplicação e do ID único do documento.

## 11. Modelo guardado no MongoDB

A coleção é DistrictEvents. O documento tem uma estrutura exterior de distrito e um objeto interior de evento, aproximadamente:

~~~text
DistrictEvent
  Id
  District
  Event
    Id
    Title
    Description
    StartDate
    EndDate
    Location
    SourceUrl
    SourceUrls
    Type
    QualityScore
    Status
    IsFinished
    RetentionUntil
    IsPublished
    Offers
    Schedule
    Keywords
    Agents
    Audience
~~~

O Mongo guarda o documento normalizado. Não guarda o HTML original nem o JSON-LD bruto.

Datas são BSON DateTime, enums são persistidos como strings e valores monetários usam Decimal128.

## 12. Ciclo de vida e limpeza

Um hosted service executa aproximadamente de hora a hora:

1. lê os eventos;
2. recalcula IsFinished usando a data de fim ou, na falta dela, a data de início em Lisboa;
3. define RetentionUntil para cerca de 60 dias depois do fim;
4. atualiza em lote os documentos alterados com BulkWrite;
5. remove com DeleteMany os eventos terminados cuja retenção expirou.

Se o ciclo falhar, há nova tentativa aproximadamente um minuto depois.

## 13. Queries da API

### Lista simples

~~~http
GET /events
~~~

Devolve resumos dos eventos. Não aplica, nesta rota, paginação e filtros de lifecycle tão completos como a pesquisa.

### Pesquisa paginada

~~~http
GET /events/search?Locality=Alcobaça&Page=1&PageSize=20&SortBy=date_asc
~~~

A pesquisa valida:

- página a partir de 1;
- PageSize entre 1 e 100, por defeito 20;
- termo de pesquisa até 100 caracteres;
- qualidade entre 0 e 100;
- campos e sentidos de ordenação permitidos.

Filtros suportados incluem distrito, localidade, região, estado, audiência, gratuito, tipo, intervalo de datas, qualidade, publicado e existência ou coordenadas.

O texto de pesquisa usa regex sobre título, descrição e local. A regra global inclui:

~~~text
(IsFinished = false) OR (IsPublished = true)
~~~

Depois a query Mongo faz duas operações:

~~~text
CountDocumentsAsync(filter)
Find(filter).Sort(sort).Skip((page - 1) * pageSize).Limit(pageSize)
~~~

Ordenações disponíveis incluem data, qualidade, título, local e tipo, em ordem ascendente ou descendente.

### Evento individual e alterações

~~~http
GET   /events/{id}
PATCH /events/{id}
DELETE /events/{id}
~~~

O ID destas rotas é o ID exterior de DistrictEvent. O PATCH substitui os campos enviados, incluindo listas quando são fornecidas.

### Schema.org

~~~http
GET /events/{id}/schema-org
~~~

Responde com application/ld+json, construindo o @id a partir do host do pedido e do ID exterior do evento.

Estado atual importante: esta rota não verifica de forma explícita IsPublished, pelo que pode expor Schema.org de eventos não publicados.

### Eventos públicos

~~~http
GET /public/events
~~~

Esta rota força IsPublished = true antes de executar a pesquisa.

### Municípios

Existem endpoints para informação de município, incluindo formas como:

~~~http
GET /municipio/{slug}
GET /municipios/{slug}
~~~

## 14. Next.js e consumo da API

A página inicial apps/web/src/app/page.tsx abre o BackofficeShell, que contém o EventsWorkspace.

O workspace trabalha atualmente com as opções:

- Alcobaça;
- Faro;
- Lourinhã.

apps/web/src/services/eventsApi.ts chama a API configurada em NEXT_PUBLIC_API_URL, com fallback local:

~~~text
http://localhost:5000
~~~

A função fetchEvents chama /events/search com:

~~~text
Locality=<município>
Page=<n>
PageSize=100
SortBy=date_asc
~~~

Também pode enviar IsPublished, StartDate, EndDate, SearchTerm e IsAccessibleForFree.

Como a interface quer todos os resultados, faz várias páginas até totalCount ser atingido. Depois aplica localmente no browser filtros de data, gratuito, publicado, pesquisa e ordenação.

### Estatísticas

Os cartões de estatísticas fazem pesquisas separadas para:

- total de eventos;
- eventos com coordenadas;
- eventos gratuitos;
- eventos publicados.

Há uma pequena inconsistência atual no cartão de eventos gratuitos: a URL contém um espaço antes de &IsAccessibleForFree=true, ao contrário das outras queries.

### Mapa

O mapa Leaflet mostra apenas eventos com pares latitude/longitude válidos. Eventos no mesmo ponto são agrupados usando coordenadas arredondadas a seis casas decimais.

### Edição

O modal de edição envia PATCH para o evento e, normalmente, manda o payload completo. Listas como ofertas, agentes e palavras-chave são substituídas como conjunto.

Os botões Publicar, Remover Publicação e Apagar no painel atual não têm handlers ligados. Existem helpers de publish/unpublish separados, mas usam localhost fixo e não estão totalmente integrados no fluxo do workspace.

Não há autenticação visível no frontend nem na API descrita.

## 15. WhatsApp

Existe um fluxo secundário de WhatsApp na API:

- webhook GET/POST em /webhooks/whatsapp;
- validação HMAC;
- idempotência por ID da mensagem;
- subscrições por utilizador e localidade;
- relatórios semanais.

Existem índices únicos para utilizador + localidade e utilizador + localidade + semana.

Inconsistência atual: WhatsAppEventSelectionService comenta que deve selecionar eventos publicados, mas constrói um filtro IsPublished = false. Assim, no código atual, pode selecionar eventos não publicados.

## 16. Resumo do percurso de um evento

~~~text
1. scheduler ou execução manual arranca o scraper
2. scraper lê sources.json
3. Cheerio descarrega a página de listagem
4. router encontra links de detalhe
5. cada detalhe é descarregado
6. extrator lê script[type="application/ld+json"]
7. fallback HTML ou Playwright tenta recuperar dados quando necessário
8. título, datas, descrição, local, coordenadas e metadados são normalizados
9. município português é resolvido por GeoJSON ou texto
10. RawEvent é validado
11. URL normalizada gera ID determinístico de job
12. RawEvent é colocado no Redis/BullMQ
13. ingestion-worker consome e chama POST /events
14. API valida e normaliza novamente
15. API procura duplicados na coleção DistrictEvents
16. documento é inserido ou merged
17. Next.js chama GET /events/search
18. API conta, filtra, ordena e pagina no MongoDB
19. Next.js agrega páginas e aplica filtros de interface
20. eventos aparecem na tabela, cartões e mapa
~~~

## 17. Pontos importantes do estado atual

- A configuração ativa tem apenas BOL; o suporte Viral Agenda está implementado, mas não selecionado por sources.json.
- O scraper não persiste o HTML ou JSON-LD bruto.
- O Redis serve de fila e controlo de retries, não de base definitiva de eventos.
- A deduplicação de conteúdo é feita na API; o helper de deduplicação do scraper não está ligado ao router.
- Não existe índice único MongoDB para identidade do evento.
- A API guarda eventos normalizados na coleção DistrictEvents.
- A pesquisa faz CountDocumentsAsync e depois Find com filtros, sort, skip e limit.
- O Next.js pagina até obter todos os resultados e depois filtra parte dos dados no cliente.
- O endpoint público filtra publicados, mas o endpoint Schema.org não faz essa verificação explicitamente.
- Os botões de publicar, remover publicação e apagar ainda não estão ligados no painel.
- O seletor de eventos do WhatsApp usa atualmente IsPublished = false, apesar do comentário indicar o contrário.

## 18. Ficheiros principais

~~~text
apps/scraper/main.ts
apps/scraper/router.ts
apps/scraper/config/sources.json
apps/scraper/sources/bol/extract.ts
apps/scraper/sources/viralAgenda/extract.ts
apps/scraper/src/crawlers/viralAgenda.ts
apps/scraper/data/geo/municipalities.geojson
apps/shared/jobId.ts
apps/shared/rawEvent.ts
apps/ingestion/queue.ts
apps/ingestion/worker.ts
Scrappy/Api.cs
Scrappy/Extensions/ServiceCollectionExtensions.cs
Scrappy/Services/EventServices.cs
Scrappy/Services/EventDeduplicationService.cs
Scrappy/Services/EventQueryService.cs
Scrappy/Services/EventFilterService.cs
Scrappy/Controllers/EventsController.cs
Scrappy/Controllers/PublicEventsController.cs
apps/web/src/services/eventsApi.ts
apps/web/src/app/page.tsx
~~~
