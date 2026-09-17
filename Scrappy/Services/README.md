# Services

Os serviços concentram as regras de negócio e o acesso aos dados. Controllers
coordenam HTTP; os serviços validam a operação, consultam o MongoDB, aplicam
normalização e devolvem `Result<T>` ou um modelo de domínio.

## Eventos

| Ficheiro | Responsabilidade |
| --- | --- |
| `EventServices.cs` | Serviço principal de CRUD. No create, resolve geografia, valida, normaliza datas/descrição, calcula qualidade, deduplica por localidade e persiste. No update recalcula campos derivados; no delete/get valida o ObjectId. |
| `EventQueryService.cs` | Executa pesquisa paginada em `DistrictEvents`, valida paginação, filtros de qualidade e ordenação e combina `EventFilterService` com `EventSortingService`. |
| `EventFilterService.cs` | Constrói filtros MongoDB para distrito, localidade, região, coordenadas, estado, modalidade, gratuitidade, tipo, datas, qualidade, publicação e texto. Eventos terminados e não publicados ficam ocultos das pesquisas. |
| `EventSortingService.cs` | Traduz `sortBy` para ordenações MongoDB: `date`, `quality`, `title`, `location` ou `type`, cada uma com `asc`/`desc`. |
| `EventDeduplicationService.cs` | Deteta eventos equivalentes de fontes diferentes e faz merge conservador, preservando fontes e preenchendo campos de melhor qualidade. |
| `EventQualityService.cs` | Calcula `QualityScore` de 0 a 100 com quatro critérios de 5 pontos: descrição suficiente, data, local e tipo válido. |
| `EventLifecycleService.cs` | Atualiza `IsFinished` e `RetentionUntil` e remove eventos terminados cujo período de retenção expirou. A regra usa o calendário de Portugal e retém 60 dias. |
| `EventLifecycleHostedService.cs` | Executa a atualização do ciclo de vida em background a cada hora; em caso de erro tenta novamente após um minuto. |
| `CreateEventInputNormalizer.cs` | Normaliza descrição e datas recebidas no create. Usa fallback para descrição curta, limita-a a 2000 caracteres e converte datas para UTC. |
| `CreateEventDateTimeConverter.cs` | Conversor JSON usado para datas de create: aceita `yyyy-MM-dd` ou ISO 8601 com offset/timezone explícito e serializa datas de calendário ou instantes UTC de forma consistente. |

## Geografia e catálogo

| Ficheiro | Responsabilidade |
| --- | --- |
| `GeoDataService.cs` | Tabela canónica de `LocalityName` para distrito, região NUTS2 e código DICO. É usada no create para preencher dados territoriais. |
| `Interfaces/IGeoDataService.cs` | Abstração de lookup geográfico, útil para injeção de dependências e testes. |
| `MunicipalityCatalog.cs` | Resolve recursos configurados para um slug municipal e valida caminho da logo e URL HTTPS oficial. |

## WhatsApp

| Ficheiro | Responsabilidade |
| --- | --- |
| `WhatsAppMessageProcessor.cs` | Orquestra mensagens normalizadas: ignora duplicados, resolve quick replies/ajuda/subscrição/cancelamento, consulta eventos e envia confirmações, templates ou fallback em texto. |
| `WhatsAppSubscriptionService.cs` | Cria, reativa, consulta e desativa subscrições por utilizador e localidade. O resultado distingue `Created`, `Reactivated` e `AlreadyActive`. |
| `WhatsAppEventSelectionService.cs` | Consulta apenas eventos publicados da localidade dentro da janela UTC, ordenados por data, e limita a seleção a `MaxEventsPerMessage`. |
| `WhatsAppReportWindowService.cs` | Converte o timezone configurado em janelas UTC: hoje–domingo para relatório imediato, segunda–domingo da semana seguinte ou intervalo explícito. |
| `WhatsAppMessageIdempotencyService.cs` | Regista IDs de mensagens recebidas com índice único. `TryBeginAsync` permite uma só execução; `ReleaseAsync` permite retry quando não houve alteração persistida. |
| `WhatsAppWeeklyReportTracker.cs` | Reserva um relatório por utilizador/localidade/semana com lease de 10 minutos, marca `Sent` ou `Failed` e conta tentativas. |

## Fluxo de ingestão

```text
EventService.AddEvent
  → GeoDataService.Lookup
  → Validator + CreateEventInputNormalizer
  → EventQualityService
  → EventDeduplicationService
  → MongoDB (created, merged ou skipped)
```

O create usa um lock por localidade para impedir que dois jobs concorrentes
observem simultaneamente “sem duplicado” e insiram o mesmo evento. O serviço
expõe `LastIngestionAction` e `LastUpdatedFields` para o controller comunicar o
resultado da ingestão.

## Lifetimes registados

Os lifetimes são definidos em `Extensions/ServiceCollectionExtensions.cs`:

- serviços de eventos: `Scoped`;
- `IGeoDataService`/`GeoDataService`: `Singleton`;
- serviços WhatsApp de negócio: maioritariamente `Scoped`;
- parsers, formatters, catálogo e janelas: `Singleton`;
- lifecycle e initializers de índices: `HostedService`.

Ao criar um serviço novo, escolher o lifetime de acordo com as dependências e
documentá-lo se não for óbvio. Serviços background devem criar um scope antes de
resolver serviços scoped.
