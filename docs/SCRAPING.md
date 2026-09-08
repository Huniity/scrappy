# Pipeline de scraping

Este documento descreve como o Scrappy recolhe eventos, transforma os dados e
os entrega à API para persistência.

## Objetivo

O scraper recolhe eventos publicados em fontes públicas portuguesas, converte
os formatos diferentes de cada site para um modelo comum e coloca os eventos
numa fila de ingestão. A gravação na base de dados é feita de forma assíncrona
por um worker separado.

## Tecnologias utilizadas

| Componente | Tecnologia | Responsabilidade |
|---|---|---|
| Execução | Node.js + TypeScript | Executar o crawler e as transformações |
| Crawler HTTP | Crawlee + Cheerio | Recolher páginas HTML e JSON-LD estáticos |
| Browser | Playwright + Chromium | Páginas dinâmicas e fallback quando o HTML não chega |
| Validação | Zod | Validar o `RawEvent` antes da fila |
| Fila | BullMQ + Redis | Transportar eventos entre scraper e worker |
| Worker | Node.js + `fetch` | Enviar eventos para `POST /events` |
| API | .NET 10 | Validar, mapear e aplicar regras de negócio |
| Persistência | MongoDB | Guardar os eventos normalizados |

## Fluxo completo

```text
sources.json
    │
    ▼
main.ts
    │  separa fontes Viral Agenda e BOL
    ├──► Playwright: descobre URLs de eventos Viral Agenda
    │
    ▼
CheerioCrawler (Crawlee)
    │  descarrega páginas e executa o router
    ▼
router.ts
    │
    ├── JSON-LD / HTML / seletores específicos da fonte
    ├── pedido AJAX de coordenadas, quando necessário
    ├── fallback Playwright para páginas dinâmicas ou incompletas
    ├── normalização de datas, tipos e campos
    ├── enriquecimento de localização e metadados
    └── validação RawEvent
    │
    ▼
Redis + BullMQ (`events-ingestion-queue`)
    │
    ▼
apps/ingestion/worker.ts
    │  valida o job, converte para o contrato da API e faz POST
    ▼
Scrappy API (`POST /events`)
    │  validação, deduplicação, território, mapeamento
    ▼
MongoDB (`DistrictEvents`)
```

## 1. Configuração das fontes

As fontes são declaradas em [`apps/scraper/config/sources.json`](../apps/scraper/config/sources.json).
Cada entrada define:

- `sourceId`: identificador da fonte e da região;
- `sourceUrl`: página inicial a recolher;
- `engine`: atualmente `cheerio`, `playwright` ou `auto`;
- `timezone`: timezone usada para interpretar datas sem offset.

Atualmente existem fontes da Viral Agenda e da BOL para Faro, Alcobaça e
Lourinhã. Adicionar uma URL ao ficheiro não é suficiente para uma fonte nova:
o router também precisa de saber encontrar e transformar o formato dessa
fonte.

## 2. Descoberta de URLs

O entrypoint ativo é [`apps/scraper/main.ts`](../apps/scraper/main.ts).

Para a Viral Agenda, o scraper usa Playwright para abrir as páginas de
listagem e carregar as páginas adicionais até encontrar o marcador de eventos
passados. Dessa descoberta resulta uma lista de URLs de detalhe.

As fontes regulares, como as páginas BOL, entram diretamente como pedidos
iniciais do `CheerioCrawler`.

## 3. Recolha e escolha do engine

O router está em [`apps/scraper/router.ts`](../apps/scraper/router.ts).

### Cheerio/Crawlee

É o caminho normal porque é mais leve e suficiente para HTML servido pelo
servidor. O crawler:

1. faz o pedido HTTP;
2. aplica o User-Agent e `Accept-Language` configurados;
3. entrega o HTML ao handler correspondente;
4. extrai JSON-LD, texto e campos específicos da fonte;
5. tenta novamente até ao limite configurado quando existe uma falha.

O User-Agent está centralizado em
[`apps/scraper/src/crawlers/httpHeaders.ts`](../apps/scraper/src/crawlers/httpHeaders.ts)
e pode ser substituído pela variável `SCRAPER_USER_AGENT`.

### Playwright/Chromium

É usado em dois casos principais:

- descoberta dinâmica de URLs da Viral Agenda;
- fallback quando o HTML não tem JSON-LD válido, quando faltam dados ou quando
  um pedido de detalhe falha.

O browser corre headless e usa `pt-PT`. Os pedidos Playwright também recebem o
mesmo User-Agent e headers base.

### Dados geográficos da Viral Agenda

Alguns eventos precisam de um pedido adicional `POST` para o endpoint `/map`.
Esse pedido inclui `x-requested-with`, `referer`, `Accept` e o User-Agent para
obter latitude e longitude associadas ao evento.

## 4. Normalização e enriquecimento

Depois da extração, o evento passa por várias etapas antes de entrar na fila:

- **datas:** datas sem offset são interpretadas com o timezone da fonte;
- **tipo:** o tipo Schema.org ou o texto da fonte é convertido para o enum da
  aplicação;
- **localização:** município, localidade e coordenadas são comparados com os
  GeoJSON de municípios portugueses;
- **metadados:** preço, entrada gratuita, classificação etária, capacidade,
  duração e hora de abertura podem ser inferidos a partir da descrição;
- **limpeza:** campos opcionais são normalizados e valores inválidos são
  rejeitados;
- **contrato:** o resultado é validado por `rawEventSchema` antes do enqueue.

O princípio é não inventar dados: se uma data, localidade ou coordenada não
puder ser confirmada, o campo fica ausente ou o evento é rejeitado para
fallback/revisão.

## 5. Fila e deduplicação

[`apps/ingestion/queue.ts`](../apps/ingestion/queue.ts) publica jobs na fila
`events-ingestion-queue` do Redis.

- O ID do job deriva do URL normalizado da fonte.
- Eventos repetidos não são adicionados novamente enquanto o job existente
  ainda está válido.
- Cada job tem até três tentativas com backoff exponencial.
- O scraper agrupa a espera em lotes de 100 jobs e aguarda o resultado da
  ingestão antes de terminar.

## 6. Worker e API

O worker em [`apps/ingestion/worker.ts`](../apps/ingestion/worker.ts):

1. lê o `RawEvent` da fila;
2. converte nomes e valores para o contrato da API;
3. envia `POST /events` para `API_URL`;
4. classifica o resultado como criado, atualizado, duplicado ou falhado.

A API .NET valida o DTO, resolve território, aplica regras de negócio, faz o
map para a entidade e persiste no MongoDB. A deduplicação final também é feita
na API, por isso uma nova recolha pode atualizar um evento existente sem criar
duplicados.

## 7. Execução e agendamento

### Execução manual de uma recolha

O serviço one-shot `scraper` pode ser executado manualmente:

```sh
docker compose -f docker/docker-compose.yml \
  --profile scheduled run --rm scraper
```

### Scheduler permanente

O serviço `scheduler` mantém um processo leve dentro do Compose. Por padrão,
aguarda até às `06:00` de `Europe/Lisbon` e executa uma recolha por dia:

```sh
docker compose -f docker/docker-compose.yml \
  --profile scheduler up -d --build scheduler
```

Para testar sem esperar pelo horário diário, o scheduler pode correr de cinco
em cinco minutos e iniciar imediatamente:

```sh
SCRAPER_SCHEDULE_MODE=interval \
SCRAPER_INTERVAL_SECONDS=300 \
SCRAPER_RUN_ON_START=true \
docker compose -f docker/docker-compose.yml \
  --profile scheduler up -d --build --force-recreate scheduler
```

Os logs podem ser acompanhados com:

```sh
make scheduler-logs
```

## 8. Bloqueios e comportamento responsável

Um User-Agent realista melhora a identificação do cliente, mas não desbloqueia
um IP já bloqueado. A frequência de recolha é igualmente importante: uma
execução de cinco em cinco minutos pode gerar centenas de pedidos por ciclo.

Quando uma fonte bloqueia o acesso:

1. parar o modo de teste frequente;
2. manter a fonte em pausa até o bloqueio expirar;
3. usar a frequência diária configurada;
4. respeitar `robots.txt`, termos de utilização e limites publicados pela
   fonte;
5. procurar uma API, feed ou autorização da fonte quando disponível.

O projeto não deve tentar contornar um bloqueio através de rotação de IP,
fingerprints falsificados ou aumento agressivo de retries.
