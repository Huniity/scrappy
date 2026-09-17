# Mappers

Os mappers isolam a transformação entre os contratos públicos (`DTOs`), os
modelos persistidos (`Models/Entities`) e o formato estruturado Schema.org.
Controllers e serviços não devem construir manualmente respostas complexas nem
duplicar a lógica de normalização de subobjetos.

| Ficheiro | Direção | Responsabilidade |
| --- | --- | --- |
| `EventRequestMapper.cs` | Request DTO → entidade/modelos | Cria um `DistrictEvent` a partir de `CreateEventDto`, aplica valores normalizados e atualiza entidades com `UpdateEventDto`. Também converte localização, agentes, ofertas, horários e audiências. |
| `EventResponseMapper.cs` | Entidade → Response DTO | Produz respostas completas, envelopes `DistrictEventResponseDto`, resumos e resultados paginados. Enumerações são convertidas para nomes legíveis. |
| `EventSchemaOrgMapper.cs` | Entidade → Schema.org DTO | Gera o objeto JSON-LD de um evento, incluindo localização, agenda, ofertas, agentes, audiência, estado e `additionalProperty`. |

## Regras importantes

- A validação acontece antes do mapper, principalmente em `EventService`.
- `EventRequestMapper` assume que valores obrigatórios, como localidade,
  distrito, região e tipo, já foram validados; por isso pode lançar
  `ArgumentException` quando um requisito estrutural falta.
- O mapper de respostas não deve expor diretamente entidades MongoDB.
- `ToSchemaOrgDto` recebe `baseUrl` para construir um `@id` estável no formato
  `{baseUrl}/events/{id}`.
- Ao adicionar um campo a um DTO, verificar se precisa de ser tratado nos três
  mappers e se também precisa de validação.

## Fluxo típico

```text
CreateEventDto
  └─ EventService valida/normaliza
       └─ EventRequestMapper.ToEntity
            └─ DistrictEvent guardado no MongoDB
                 └─ EventResponseMapper / EventSchemaOrgMapper
```
