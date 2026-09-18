# Adicionar uma nova fonte de eventos

Este guia destina-se a quem vai integrar no Scrappy um novo site ou uma nova
plataforma de publicação de eventos.

Uma fonte é considerada integrada quando o scraper consegue descobrir páginas
de detalhe, extrair os dados necessários, convertê-los para o contrato comum,
validá-los e entregá-los ao worker de ingestão sem alterações específicas no
MongoDB ou na API.

## Antes de começar

Confirma primeiro qual dos dois casos se aplica.

### Caso A: é apenas outro URL de uma fonte já suportada

Se a página usa o mesmo formato e os mesmos padrões de URL de BOL ou Viral
Agenda, normalmente basta acrescentar um job a
[`config/sources.json`](../config/sources.json):

```json
{
  "sourceUrl": "https://exemplo.pt/eventos",
  "sourceId": "exemplo-faro",
  "engine": "auto",
  "timezone": "Europe/Lisbon"
}
```

Valida o job com o schema existente e executa um crawl de teste. Não cries um
novo extractor só porque o município ou a página inicial é diferente.

### Caso B: é um site ou uma plataforma nova

É necessário criar um adaptador. Como ordem de grandeza:

| Tipo de fonte | Estimativa típica |
| --- | ---: |
| HTML/JSON-LD estático e listagem simples | 1–2 dias |
| JavaScript, paginação complexa ou dados auxiliares | 3–5 dias |
| Anti-bot, autenticação, formatos instáveis ou API privada | 1–2 semanas |

O tempo depende sobretudo da qualidade dos dados de localização e das datas,
não apenas do tempo necessário para ler o título do evento.

## Modelo de execução

O fluxo atual é:

```text
sources.json
    │
    ▼
CheerioCrawler ── descoberta de links ──► páginas de detalhe
    │                                      │
    │                                      ├─ HTML / JSON-LD
    │                                      └─ Playwright, se necessário
    ▼
extractor da fonte
    ▼
NormalizedEvent
    ▼
datas + localização + metadados + tipo
    ▼
rawEventSchema
    ▼
Redis/BullMQ ──► apps/ingestion ──► API
```

O adaptador da fonte deve ler e normalizar dados. Não deve publicar diretamente
na fila, chamar a API, escrever no MongoDB ou implementar deduplicação.

Os módulos comuns responsáveis pela parte final do pipeline são:

- [`src/normalization/dates.ts`](../src/normalization/dates.ts), para datas e
  fusos horários;
- [`src/enrichment/location.ts`](../src/enrichment/location.ts), para resolver
  o município português;
- [`src/enrichment/eventMetadata.ts`](../src/enrichment/eventMetadata.ts), para
  preço, gratuitidade, idade e lotação;
- [`src/enrichment/eventType.ts`](../src/enrichment/eventType.ts), para o tipo
  de evento;
- [`../shared/rawEvent.ts`](../../shared/rawEvent.ts), para a validação final.

## Estrutura recomendada

Para uma fonte chamada `exemplo`, cria:

```text
apps/scraper/
├── sources/exemplo/
│   ├── README.md
│   ├── extract.ts
│   ├── extract.test.ts
│   └── types.ts
├── src/normalization/exemplo.ts       # se houver regras próprias
├── src/crawlers/exemplo.ts            # se houver descoberta/browser próprio
├── config/sources.json
└── router.ts
```

Nem todos os ficheiros são obrigatórios:

- `types.ts` é recomendado para o formato JSON-LD, HTML ou API da fonte;
- `extract.ts` deve conter funções puras de extração e conversão;
- `src/normalization/exemplo.ts` só é necessário quando a fonte tem regras
  próprias para datas, sessões, preços ou campos semelhantes;
- `src/crawlers/exemplo.ts` só é necessário para infinite scroll, chamadas
  auxiliares ou navegação Playwright;
- `README.md` deve explicar os pressupostos e limitações da fonte.

Consulta BOL e Viral Agenda como referências:

- [`sources/bol/`](./bol/);
- [`sources/viralAgenda/`](./viralAgenda/).

## Passo 1: analisar a fonte

Antes de escrever código, guarda ou inspeciona pelo menos:

1. uma página de listagem;
2. duas ou três páginas de detalhe;
3. um evento gratuito;
4. um evento pago, se existir;
5. um evento com mais do que uma sessão, se existir;
6. um evento sem coordenadas ou com endereço incompleto;
7. uma página dinâmica, caso o site use JavaScript.

Regista:

- padrão dos URLs de detalhe;
- seletor ou endpoint usado para descobrir eventos;
- presença de `script[type="application/ld+json"]`;
- formato de `@graph`, `@type` e propriedades objeto/lista;
- formato das datas e o fuso horário da fonte;
- onde aparecem município, localidade, morada e coordenadas;
- regras de preço, gratuitidade, idade e capacidade;
- necessidade de cookies, headers, Playwright ou chamadas auxiliares;
- limites de paginação, eventos passados e páginas que não são eventos.

Não incluas no repositório respostas completas com cookies, tokens, dados
pessoais ou credenciais.

## Passo 2: definir o contrato do extractor

O extractor deve devolver um
[`NormalizedEvent`](../src/types/normalizedEvent.ts) ou `null` quando a página
não representa um evento utilizável.

Exemplo mínimo:

```ts
export function extractExemploNormalizedEvent(
    $: CheerioAPI,
    fallbackUrl: string,
): NormalizedEvent | null {
    const data = extractExemploData($, fallbackUrl);

    if (!data) {
        return null;
    }

    return {
        title: data.title,
        description: data.description,
        sourceUrl: data.url ?? fallbackUrl,
        startDate: data.startDate,
        endDate: data.endDate,
        venueName: data.locationName,
        locality: data.locality,
        municipality: data.municipality,
        streetAddress: data.streetAddress,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        imageUrl: data.imageUrl,
        offers: data.offers,
        keywords: data.keywords,
    };
}
```

O extractor deve:

- usar o URL da página como fallback quando o evento não fornece `url`;
- aceitar JSON-LD como objeto, array ou `@graph`, quando a fonte o fizer;
- aceitar propriedades que podem ser objeto ou array;
- limpar texto e ignorar valores vazios;
- converter números com vírgula decimal para `number`;
- não inventar dados ausentes;
- devolver URLs absolutas e válidas;
- manter a mesma saída para HTML obtido por Cheerio e por Playwright;
- preservar o máximo de informação possível sem exceder os limites do schema.

Campos essenciais no resultado final:

| Campo | Regra |
| --- | --- |
| `title` | Pelo menos 3 caracteres |
| `description` | Pelo menos 10 caracteres no `RawEvent` |
| `sourceUrl` | URL HTTP(S) válida |
| `startDate` | Data ISO 8601 com offset ou `Z` |
| `venueName` | Local do evento não vazio |
| `municipality` ou `locality` | Necessário para resolver o município |

`endDate` não pode ser anterior a `startDate`. Latitude e longitude têm de ser
fornecidas juntas e, quando presentes, têm de estar dentro dos limites válidos.

## Passo 3: normalizar datas e campos específicos

As datas entregues ao pipeline devem ter offset explícito, por exemplo:

```text
2026-10-15T21:00:00+01:00
```

Não uses uma data local sem fuso, como `2026-10-15 21:00`, porque o schema
final rejeita-a ou pode interpretá-la de forma errada.

Se a fonte só fornecer datas locais, usa a timezone do job, normalmente
`Europe/Lisbon`, e cria uma regra específica em
`src/normalization/exemplo.ts`. Testa também a mudança entre horário de verão
e horário de inverno.

Reutiliza as funções comuns sempre que possível. Só cria parsing específico
quando o formato da fonte o exigir, por exemplo:

- meses escritos em português;
- sessões repetidas;
- hora de abertura separada da hora de início;
- duração em texto;
- preço ou classificação etária embutidos na descrição.

O `classifyEventType` já fornece uma classificação genérica. Se a fonte usar
categorias próprias, mapeia-as para um dos valores aceites em
[`apps/shared/eventTypes.ts`](../../shared/eventTypes.ts):

```text
Concerto, Feira, Mercado, FestaPopular, Teatro, Festival, Exposição,
Cinema, Desporto, Gastronomia, Workshop, Conferência, Infantil, Business,
Moda, Educativo, Património, Social, Cultural, Hackaton ou Outro
```

## Passo 4: implementar a descoberta de eventos

O `router.ts` atual tem lógica específica para BOL e Viral Agenda. Uma fonte
nova precisa de uma destas estratégias.

### Listagem com links estáticos

Quando a página de entrada contém links normais para detalhes:

1. acrescenta o URL a `config/sources.json`;
2. cria um padrão de URL de detalhe;
3. adiciona no `router.ts` a seleção dos links da nova fonte;
4. cria um label próprio, por exemplo `EXEMPLO_EVENT_DETAIL`;
5. regista um handler para esse label.

Não sigas todos os links da página. Limita a descoberta a URLs de detalhe e
usa [`config/blacklist.json`](../config/blacklist.json) quando aplicável.

### Listagem com API, infinite scroll ou filtros

Cria `src/crawlers/exemplo.ts` para a descoberta. O crawler deve devolver
apenas URLs de detalhe normalizados e evitar duplicados. Define claramente:

- quando parar a paginação;
- como detetar eventos passados;
- como lidar com erros e rate limits;
- se é necessário enviar headers ou referer;
- se a chamada é GET ou POST e se precisa de dados auxiliares.

### Página de detalhe renderizada

O caminho normal é Cheerio primeiro e Playwright como fallback:

1. tentar extrair o HTML inicial;
2. se faltar JSON-LD ou campos essenciais, usar Playwright;
3. passar o HTML renderizado pelo mesmo extractor;
4. fechar a página sempre num bloco `finally`;
5. limitar tentativas e timeouts.

Não cries dois extractors com regras diferentes para HTML estático e HTML
renderizado. A diferença deve estar apenas na forma como o HTML é obtido.

## Passo 5: integrar o router

No [`router.ts`](../router.ts), a integração deve cobrir quatro pontos:

1. **Reconhecimento:** função como `isExemploEventDetailUrl(url)` que valida
   host e caminho, sem aceitar páginas de pesquisa ou conta.
2. **Descoberta:** seleção dos links ou chamada ao crawler específico.
3. **Extração:** handler que chama `extractExemploNormalizedEvent`.
4. **Fallback:** Playwright quando a fonte é dinâmica ou a extração não tem
   os campos essenciais.

Depois de obter o `NormalizedEvent`, aplica a sequência existente:

```text
ignorar evento passado
    → resolver localização
    → extrair metadados
    → classificar tipo
    → normalizar sourceUrl
    → validar com rawEventSchema
    → pushToIngestionQueue
```

Atualmente o router repete parte desta sequência nos caminhos BOL e Viral
Agenda. Ao adicionar uma terceira fonte, é preferível extrair essa sequência
para um helper comum, ou pelo menos garantir que o novo caminho tem o mesmo
comportamento. Não publiques o evento antes de `rawEventSchema.safeParse` ter
sido bem-sucedido.

## Passo 6: configurar o job

Adiciona uma ou mais entradas a
[`config/sources.json`](../config/sources.json):

```json
[
  {
    "sourceUrl": "https://exemplo.pt/eventos/faro",
    "sourceId": "exemplo-faro",
    "engine": "auto",
    "timezone": "Europe/Lisbon"
  }
]
```

Regras importantes:

- `sourceUrl` tem de ser um URL válido;
- `sourceId` deve identificar a fonte e o job de forma clara;
- `timezone` deve refletir o fuso usado nas datas da página;
- `engine` aceita `auto`, `cheerio` ou `playwright`, mas o entrypoint atual
  usa Cheerio e reserva Playwright para descoberta/fallback;
- não coloques tokens, cookies ou credenciais na configuração.

Se a fonte precisar de descoberta especial no `main.ts`, integra-a
explicitamente. O prefixo `viral-agenda` é hoje um comportamento especial da
Viral Agenda e não é aplicado automaticamente a novas fontes.

## Passo 7: escrever os testes

Cria `apps/scraper/sources/exemplo/extract.test.ts` com HTML mínimo, estável e
representativo. O teste não deve depender da disponibilidade do site externo.

Inclui pelo menos:

- extração normal de título, descrição, URL e data;
- seleção correta do nó de evento quando existe `@graph`;
- URL fallback quando falta `url`;
- localização com município e morada;
- localização apenas com coordenadas, quando suportado;
- ofertas e preço gratuito/pago;
- propriedades fornecidas como objeto e como lista;
- datas sem offset, se a fonte as usar;
- evento sem data ou com data inválida;
- página que não é um evento;
- HTML renderizado equivalente ao HTML obtido inicialmente.

Executa o teste específico a partir da raiz:

```sh
node --import tsx --test apps/scraper/sources/exemplo/extract.test.ts
```

Depois executa a verificação global de TypeScript:

```sh
pnpm typecheck
```

Para uma validação de integração, inicia Redis, API e worker e executa:

```sh
pnpm scraper
```

Confirma nos logs que o evento foi encontrado, colocado na fila, processado
pelo worker e aceite pela API. Usa um pequeno job de teste sempre que possível;
não executes uma listagem inteira sem controlar paginação e limites da fonte.

## Critérios de aceitação

Considera a fonte pronta apenas quando:

- a configuração passa `crawlJobsSchema`;
- a descoberta só enfileira URLs de detalhe válidos;
- o extractor funciona sem rede nos testes;
- datas têm offset explícito e não criam eventos com fim anterior ao início;
- título, descrição e local passam `rawEventSchema`;
- o município é resolvido exatamente, por nome ou por coordenadas válidas;
- eventos passados são ignorados;
- a versão Playwright, quando necessária, reutiliza o mesmo extractor;
- o evento chega ao worker e à API;
- não são criados duplicados óbvios para a mesma página/sessão;
- não existem credenciais, cookies ou dumps de produção no commit;
- a documentação da própria fonte explica seletores, endpoints e limitações.

## Checklist para o pull request

- [ ] A fonte foi analisada com páginas reais representativas.
- [ ] Foi confirmado se bastava adicionar um job existente.
- [ ] `types.ts` e `extract.ts` foram adicionados, se aplicável.
- [ ] A normalização específica de datas/campos está coberta por testes.
- [ ] O padrão de URL e o handler foram integrados no router.
- [ ] O fallback Playwright foi adicionado ou foi demonstrado que não é necessário.
- [ ] `config/sources.json` contém apenas URLs e configuração não secreta.
- [ ] O extractor valida localização e dados obrigatórios.
- [ ] O teste do extractor passa.
- [ ] `pnpm typecheck` passa.
- [ ] Foi feita uma execução de integração com o worker e a API.
- [ ] O README da fonte documenta limitações conhecidas.

## Problemas frequentes

### O evento aparece no log, mas não é persistido

Verifica primeiro os erros de `rawEventSchema`. As causas mais comuns são
descrição curta, data sem offset, URL inválido, local vazio ou município não
resolvido.

### O scraper encontra a listagem, mas não encontra eventos

Confirma o padrão de URLs, se os links são relativos, se a listagem é carregada
por JavaScript e se o handler usa o label correto.

### A versão Cheerio funciona no teste, mas não no site

Inspeciona o HTML recebido antes do JavaScript. Se os dados só aparecem depois
do carregamento, implementa um fallback Playwright e envia o HTML renderizado
para o mesmo extractor.

### O município está errado ou ausente

Não uses uma substring aproximada como solução final. Fornece o nome exato da
localidade/município ou coordenadas válidas e deixa `resolveLocation` fazer a
resolução baseada no catálogo geográfico.

### São criados vários eventos iguais

Normaliza o `sourceUrl`, elimina URLs duplicados durante a descoberta e confirma
que sessões diferentes não estão a ser confundidas com o mesmo evento. A
deduplicação final também depende da API, mas o scraper deve evitar duplicados
óbvios.
