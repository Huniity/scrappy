# API Scrappy

Esta pasta contém a API REST em .NET 10. A aplicação recebe eventos recolhidos
por fontes externas, valida e normaliza os dados, calcula a qualidade,
deduplica registos e persiste tudo em MongoDB. Também disponibiliza pesquisa
pública, redirecionamento para sites municipais e a integração com WhatsApp.

## Como a aplicação arranca

`Api.cs` cria o `WebApplication`, carrega
`Configuration/municipalities.json`, regista as dependências através de
`Extensions/ServiceCollectionExtensions.cs` e configura o pipeline através de
`Extensions/WebApplicationExtensions.cs`.

O fluxo normal de um evento é:

```text
Controller → Service → Validator/Normalizer → Mapper → MongoDB
                                      └──────→ Result<T>
```

As mensagens WhatsApp seguem um fluxo próprio:

```text
Webhook → assinatura/parser → MessageProcessor → subscrições/eventos → Meta API
```

## Fluxos detalhados

### 1. Arranque da API

O arranque acontece uma vez, em `Api.cs`:

```text
1. WebApplication.CreateBuilder(args)
      │
2. Carrega Configuration/municipalities.json
      │
3. AddScrappyServices(configuration)
      ├─ MongoClient/IMongoDatabase
      ├─ controllers + JSON/OpenAPI + CORS/routing
      ├─ catálogo municipal
      ├─ serviços de eventos
      └─ serviços e hosted services WhatsApp
      │
4. builder.Build()
      │
5. UseScrappyPipeline()
      ├─ OpenAPI/Swagger (apenas Development)
      ├─ forwarded headers e HTTPS
      ├─ ficheiros estáticos (wwwroot)
      ├─ CORS e autorização
      └─ MapControllers()
      │
6. app.Run()
```

Durante o arranque, os hosted services criam os índices únicos das subscrições
e dos relatórios semanais WhatsApp. O `EventLifecycleHostedService` começa o
ciclo de atualização em background depois de a aplicação estar a correr.

### 2. Ingestão de um evento (`POST /events`)

O worker de ingestão envia um `CreateEventDto`. O controller não grava o DTO
diretamente; entrega-o ao `EventService`:

```text
POST /events
  │
  ▼
EventsController.Create
  │ valida o resultado e prepara headers HTTP
  ▼
EventService.AddEvent
  │
  ├─ 1. confirma localidade e faz GeoDataService.Lookup
  │      └─ preenche distrito, região NUTS2 e DICO
  ├─ 2. valida título, descrição, datas, local, URLs,
  │      enumerações, agentes, audiência, agenda e ofertas
  ├─ 3. normaliza descrição e datas para o formato persistido
  ├─ 4. calcula QualityScore (0–100)
  ├─ 5. calcula IsFinished/RetentionUntil
  ├─ 6. EventRequestMapper.ToEntity
  ├─ 7. procura candidatos da mesma localidade num intervalo de ±1 dia
  ├─ 8. EventDeduplicationService compara título, data e local
  │      ├─ sem correspondência → insere documento
  │      ├─ correspondência com novos dados → faz merge e substitui
  │      └─ correspondência sem alterações → ignora o duplicado
  └─ 9. devolve Result<DistrictEvent>
  │
  ▼
EventResponseMapper.ToDistrictEventResponseDto
  │
  └─ created → 201; merged/skipped → 200
```

O serviço mantém a ação em `X-Ingestion-Action` (`created`, `merged` ou
`skipped`) e, quando aplicável, os campos alterados em
`X-Ingestion-Updated-Fields`. Existe um lock por localidade para impedir que
jobs concorrentes criem o mesmo evento antes de a deduplicação terminar.

### 3. Leitura, atualização e remoção

```text
GET /events/{id}       ─┐
PATCH /events/{id}     ├─ valida ObjectId → EventService → MongoDB → mapper → DTO
DELETE /events/{id}    ┘
GET /events            ─── EventService.GetAllEvents → EventSummaryDto[]
GET /events/{id}/schema-org
                         └─ EventService → EventSchemaOrgMapper → JSON-LD
```

No `PATCH`, os campos ausentes ficam inalterados. Campos presentes substituem
listas inteiras (enviar `[]` para limpar uma lista), e o serviço volta a
validar datas, localização, relações e ofertas e recalcula o `QualityScore` e o
ciclo de vida. O `GET` Schema.org usa o host do request para criar o `@id` do
evento e responde com `application/ld+json`.

### 4. Pesquisa interna e agenda pública

As duas rotas partilham `EventQueryService`:

```text
GET /events/search ou GET /public/events
  │
  ├─ valida página, pageSize, searchTerm, intervalo e sortBy
  ├─ EventFilterService.BuildFilter
  │    └─ distrito/localidade/região, datas, estado, tipo,
  │       publicação, coordenadas, gratuitidade, qualidade e texto
  ├─ EventSortingService.GetSortParams
  ├─ CountDocuments + Skip/Limit no MongoDB
  └─ EventResponseMapper.ToResponsePagedResult
```

`PublicEventsController` força `isPublished=true`, mesmo que o cliente envie
outro valor. Além dos filtros pedidos, a pesquisa oculta eventos terminados e
não publicados; eventos terminados publicados continuam disponíveis para poder
serem geridos e despublicados.

### 5. Ciclo de vida dos eventos

```text
EventLifecycleHostedService (a cada 1 hora)
  │
  └─ EventLifecycleService.RefreshAsync
       ├─ lê eventos
       ├─ considera terminado quando a data final (ou inicial, se não houver
       │  final) já passou no calendário de Portugal
       ├─ define IsFinished e RetentionUntil (+60 dias)
       ├─ atualiza alterações em bulk
       └─ elimina eventos terminados cuja retenção expirou
```

Se uma execução falhar, o hosted service regista o erro e tenta novamente em
um minuto. Uma execução bem-sucedida espera uma hora até ao próximo ciclo.

### 6. Redirecionamento municipal

```text
GET /municipio/{slug} ou /municipios/{slug}
  │
  ├─ MunicipalityCatalog normaliza o slug
  ├─ procura a entrada em MunicipalityCatalog.Entries
  ├─ valida LogoPath e WebsiteUrl HTTPS
  ├─ entrada válida → HTTP 302 para WebsiteUrl
  └─ slug desconhecido → HTTP 404
```

O catálogo em `Configuration/municipalities.json` é a fonte de verdade para a
agenda oficial. A logo é usada pelo template WhatsApp, mas o redirecionamento
usa exclusivamente `WebsiteUrl`.

### 7. Mensagens WhatsApp recebidas

```text
Meta GET /webhooks/whatsapp
  └─ valida hub.mode + VerifyToken → devolve hub.challenge

Meta POST /webhooks/whatsapp
  ├─ lê o corpo bruto
  ├─ valida X-Hub-Signature-256 com HMAC-SHA256/AppSecret
  ├─ WhatsAppMessageParser extrai mensagens text/button/button_reply
  ├─ para cada mensagem: WhatsAppMessageProcessor.ProcessAsync
  │    ├─ WhatsAppMessageIdempotencyService evita reprocessamento
  │    ├─ quick reply event_report
  │    │    ├─ confirma subscrição
  │    │    ├─ cria janela local/UTC
  │    │    ├─ seleciona eventos publicados
  │    │    └─ envia detalhes em texto
  │    ├─ Help/Ajuda → envia template de ajuda
  │    ├─ Subscrever <localidade>
  │    │    ├─ cria ou reativa a subscrição
  │    │    ├─ envia confirmação
  │    │    ├─ envia template semanal se houver eventos
  │    │    └─ envia fallback em texto se o template falhar
  │    ├─ Stop <localidade> → desativa a subscrição e confirma
  │    └─ comando desconhecido → envia instruções de utilização
  └─ HTTP 200
```

Depois de uma alteração persistida (por exemplo, uma subscrição criada), o ID
da mensagem fica consumido mesmo que a entrega da resposta falhe; isto impede
que um retry da Meta execute a mesma alteração novamente. Falhas anteriores à
alteração podem libertar o ID para permitir retry.

### 8. Envio de relatórios WhatsApp

`WhatsAppEventSelectionService` pesquisa eventos por localidade e janela,
`WhatsAppEventMessageFormatter` prepara o texto e `WhatsAppClient` constrói o
payload da Graph API:

```text
janela local (Europe/Lisbon)
  → datas UTC para MongoDB
  → seleção publicada ordenada por data
  → template aprovado com logo, município, contagem e botões
       ├─ quick reply event_report:<slug>:<início>:<fim>
       └─ URL dinâmica com o slug para /municipios/{slug}
```

`PublicBaseUrl` é usado para tornar a logo acessível à Meta. Tem de ser HTTPS;
em desenvolvimento, um túnel público como ngrok é necessário para que a Meta
consiga carregar recursos locais.

### 9. Erros e respostas

```text
Regra de entrada inválida → Validator/Service → Result.Failure → HTTP 400
ObjectId inexistente       → Service/controller → HTTP 404
ValidationException        → EventsController  → HTTP 422
Exceção inesperada         → log + HTTP 500 genérico
```

Os controllers de eventos tratam as exceções de cada operação. Existe também
`GlobalExceptionsMiddleware`, documentado em `Middlewares`, mas atualmente ele
não é adicionado ao pipeline em `Api.cs`/`UseScrappyPipeline`; se for ativado,
deve ser colocado antes dos restantes middlewares para uniformizar erros não
tratados.

## Mapa das pastas

| Pasta | Responsabilidade | Documentação |
| --- | --- | --- |
| `Common` | Tipos transversais, como `Result<T>` | [README](Common/README.md) |
| `Configuration` | Ficheiros JSON de configuração distribuídos com a API | [README](Configuration/README.md) |
| `Controllers` | Endpoints HTTP REST e redirecionamentos | [README](Controllers/README.md) |
| `DTOs` | Contratos de entrada e saída da API | [README](DTOs/README.md) |
| `Exceptions` | Exceções de domínio conhecidas | [README](Exceptions/README.md) |
| `Extensions` | Registo de serviços e configuração do pipeline | [README](Extensions/README.md) |
| `Integrations` | Comunicação com sistemas externos, atualmente WhatsApp | [README](Integrations/README.md) |
| `Mappers` | Conversão entre DTOs, entidades e Schema.org | [README](Mappers/README.md) |
| `Middlewares` | Comportamento transversal do pipeline HTTP | [README](Middlewares/README.md) |
| `Models` | Modelos persistidos, configuração e enumerações | [README](Models/README.md) |
| `Services` | Regras de negócio, pesquisa, ciclo de vida e integrações | [README](Services/README.md) |
| `Validators` | Regras de validação de eventos e queries | [README](Validators/README.md) |

## Onde começar uma alteração

- Um novo endpoint começa no `Controllers` e normalmente chama um serviço.
- Uma nova regra de dados deve ficar em `Validators` ou num serviço específico,
  não no controller.
- Uma alteração no formato HTTP deve começar nos `DTOs` e ser refletida nos
  mappers correspondentes.
- Uma alteração no documento MongoDB deve ser feita nos `Models/Entities` e
  revista no mapper e nos serviços que o consultam.
- Uma alteração no WhatsApp deve considerar tanto
  `Integrations/WhatsApp` (protocolo Meta) como `Services` (regras de negócio).

Para configuração local, consultar o README da raiz do repositório e
`Configuration/README.md`. Não colocar tokens, segredos ou connection strings
reais em ficheiros versionados.
