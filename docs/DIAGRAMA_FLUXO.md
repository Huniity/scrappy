  ```mermaid

  flowchart TD
      A["Scheduler ou execução manual"] --> B["Criar crawl job"]
      B --> C["Normalizar URL da fonte"]
      C --> D["Gerar crawlJobId<br/>SHA-256"]
      D --> E["Redis + BullMQ<br/>crawl queue"]

      E --> F["Crawl worker"]
      F --> G["Ler sources.json"]

      G --> H{"Tipo de fonte"}

      H -->|BOL| I["Abrir página de listagem<br/>Crawlee + Cheerio"]
      H -->|Viral Agenda| J["Abrir listagem<br/>Playwright"]
      J --> K["Fazer scroll e descobrir<br/>URLs de eventos"]

      I --> L["Encontrar links de detalhe"]
      K --> L
      L --> M["Criar requests de detalhe"]

      M --> N["Descarregar página de evento<br/>Cheerio"]
      N --> O{"HTML e JSON-LD válidos?"}

      O -->|Sim| P["Extrair JSON-LD"]
      O -->|Não ou erro| Q["Fallback Playwright"]
      Q --> P

      P --> R["Extrair título, datas,<br/>descrição, local,
      imagem,<br/>ofertas e coordenadas"]
      R --> S["Pedido adicional de mapa<br/>quando necessário"]

      S --> T["Normalizar dados"]
      T --> T1["Normalizar textos e URLs"]
      T1 --> T2["Normalizar datas e timezone"]
      T2 --> T3["Classificar tipo de evento"]
      T3 --> T4["Inferir preço e metadados"]

      T4 --> U{"Resolver município"}

      U -->|Coordenadas disponíveis| V["Point-in-polygon<br/>GeoJSON
      municipal / CAOP"]
      U -->|Sem coordenadas| W["Comparação textual<br/>nome
      normalizado"]

      V --> X["Município canónico"]
      W --> X

      U -->|Município desconhecido| Y["Rejeitar evento<br/>ou enviar
      para revisão"]

      X --> Z["Determinar território"]
      Z --> Z1["Distrito"]
      Z1 --> Z2["NUTS II"]
      Z2 --> Z3["DICO / DTMN"]

      Z3 --> AA["Construir RawEvent"]
      AA --> AB{"Validação Zod"}

      AB -->|Inválido| AC["Descartar evento<br/>e registar erro"]
      AB -->|Válido| AD["Normalizar sourceUrl"]
      AD --> AE["Gerar ingestionJobId<br/>SHA-256"]

      AE --> AF["Redis + BullMQ<br/>events-ingestion-queue"]

      AF --> AG{"Job já existe?"}
      AG -->|Sim e ativo/concluído| AH["Reutilizar job<br/>não
      duplicar"]
      AG -->|Falhado| AI["Remover job antigo<br/>e criar novamente"]
      AG -->|Não| AJ["Criar job"]

      AJ --> AK["Até 3 tentativas"]
      AK --> AL["Backoff exponencial"]
      AL --> AM["Ingestion worker"]

      AH --> AM
      AI --> AM

      AM --> AN["Ler payload do job"]
      AN --> AO["Validar novamente<br/>com RawEvent/Zod"]
      AO --> AP["Converter localidade<br/>para enum da API"]
      AP --> AQ["Mapear RawEvent<br/>para CreateEventDto"]
      AQ --> AR["POST /events"]

      AR --> AS["EventsController"]
      AS --> AT["EventService"]

      AT --> AU["GeoDataService.Lookup"]
      AU --> AV["Substituir distrito,<br/>NUTS e DICO por valores
      canónicos"]

      AV --> AW["Limpar e normalizar descrição"]
      AW --> AX["Normalizar datas para UTC"]
      AX --> AY["Validar campos do evento"]
      AY --> AZ["Calcular QualityScore"]
      AZ --> BA["Calcular lifecycle:<br/>IsFinished,
      IsPublished,<br/>RetentionUntil"]
      BA --> BB["Mapear DTO para entidade"]

      BB --> BC["Procurar candidatos no MongoDB"]
      BC --> BD{"Evento duplicado?"}

      BD -->|Não| BE["InsertOne"]
      BD -->|Sim, dados novos| BF["Merge + ReplaceOne"]
      BD -->|Sim, sem alterações| BG["Skipped"]

      BE --> BH["MongoDB<br/>DistrictEvents"]
      BF --> BH
      BG --> BH

      AR --> BI{"Resposta da API"}
      BI -->|2xx| BJ["Job completed"]
      BI -->|Duplicado conhecido| BK["Job skipped"]
      BI -->|4xx| BL["UnrecoverableError"]
      BI -->|5xx, timeout ou rede| BM["Retry BullMQ"]

      BM --> AK

      BH --> BN["EventLifecycleHostedService"]
      BN --> BO["Recalcular eventos terminados"]
      BO --> BP["Atualizar retenção"]
      BP --> BQ["Apagar eventos expirados"]
      BQ --> BH

      BH --> BR["GET /events/search"]
      BR --> BS["Filtros, pesquisa,<br/>ordenação e paginação"]
      BS --> BH
      BS --> BT["Next.js / Backoffice"]
      BT --> BU["Tabela de eventos"]
      BT --> BV["Mapa"]
      BT --> BW["Edição via PATCH /events/{id}"]

      BH --> BX["GET /public/events"]
      BX --> BY["Forçar IsPublished = true"]
      BY --> BH
      BY --> BZ["Consumidores públicos"]

      BH --> CA["GET /events/{id}/schema-org"]
      CA --> CB["EventSchemaOrgMapper"]
      CB --> CC["application/ld+json"]

      CD["WhatsApp Meta"] --> CE["GET /webhooks/whatsapp"]
      CE --> CF["Validar VerifyToken"]
      CF --> CG["POST /webhooks/whatsapp"]
      CG --> CH["Validar assinatura HMAC"]
      CH --> CI["Interpretar mensagem"]
      CI --> CJ["Idempotência por MessageId"]
      CJ --> CK{"Comando"}

      CK -->|Subscrever| CL["Criar ou reativar subscrição"]
      CL --> CM["Guardar em MongoDB"]
      CM --> CN["Enviar confirmação pela Graph API"]

      CK -->|Stop| CO["Cancelar subscrição"]
      CO --> CM

      CK -->|Eventos| CP["Verificar subscrição"]
      CP --> CQ["Selecionar eventos no MongoDB"]
      CQ --> CR["Formatar mensagem"]
      CR --> CS["Enviar eventos pela Graph API"]

      ```