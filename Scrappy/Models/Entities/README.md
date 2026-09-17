# Models/Entities

Aqui vivem os documentos persistidos no MongoDB e os submodelos que compõem um
evento. Os nomes das classes representam o domínio interno; a API expõe DTOs
equivalentes através dos mappers.

| Ficheiro | Modelo | Responsabilidade |
| --- | --- | --- |
| `DistrictEvents.cs` | `DistrictEvent` | Documento raiz da coleção `DistrictEvents`, relacionando distrito e `Event`. |
| `AgentModel.cs` | `AgentModel` | Pessoa, organização ou outro agente ligado ao evento (organizador, promotor, artista, etc.). |
| `AudienceModel.cs` | `AudienceModel` | Nome e tipo de público-alvo. |
| `EventLocation.cs` | `EventLocation` | Local do evento, morada, localidade, distrito, região, DICO e coordenadas. |
| `LocationModel.cs` | `LocationModel` | Modelo geográfico simples, sem URL ou `SameAs`; não participa nos fluxos principais atuais, mas faz parte do vocabulário de domínio. |
| `OfferModel.cs` | `OfferModel` | Preço, moeda, disponibilidade, URL e data de validade de uma oferta. |
| `ScheduleModel.cs` | `ScheduleModel` | Datas, horas, timezone e dias de repetição. |
| `WhatsAppProcessedMessage.cs` | `WhatsAppProcessedMessage` | ID de uma mensagem WhatsApp já processada, usado para idempotência. Coleção: `WhatsAppProcessedMessages`. |
| `WhatsAppSubscription.cs` | `WhatsAppSubscription` | Relação entre utilizador WhatsApp e slug de localidade, com estado ativo e timestamps. Coleção: `WhatsAppSubscriptions`. |
| `WhatsAppWeeklyReport.cs` | `WhatsAppWeeklyReport` | Estado de envio de um relatório por utilizador, localidade e semana; suporta leases e tentativas. Coleção: `WhatsAppWeeklyReport`. |

## Convenções de persistência

- IDs MongoDB são representados como strings quando a classe usa
  `BsonRepresentation(BsonType.ObjectId)`.
- Enumerações persistidas usam representação textual, o que torna os documentos
  legíveis e evita depender do valor numérico.
- Datas de auditoria e campos terminados em `Utc` devem ser tratados como UTC.
- Listas e submodelos podem estar vazios; validar obrigatoriedade no fluxo de
  criação/atualização, não no construtor do documento.

Os índices de unicidade usados pelo WhatsApp são criados pelos hosted services
em `Integrations/WhatsApp`, não por estas classes.
