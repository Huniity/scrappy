# Models/Entities/Enums

As enumerações definem vocabulários controlados do domínio. São usadas nas
entidades MongoDB, nos DTOs e nos filtros da API.

| Ficheiro | Enumeração | Uso |
| --- | --- | --- |
| `EnumAgent.cs` | `AgentType` | Tipo de agente: pessoa, organização, governo, empresa, grupo musical, grupo de performance ou outro. |
| `EnumAttendance.cs` | `EventAttendanceMode` | Modalidade: `InPerson`, `Online` ou `Hybrid`. |
| `EnumAudience.cs` | `AudienceType` | Categorias de público, como geral, crianças/família, jovens, adultos, seniores e profissionais. |
| `EnumDico.cs` | `DicoEnum` | Códigos DICO dos municípios portugueses, com `Description` para o nome legível. |
| `EnumDistrict.cs` | `DistrictName` | Distritos e regiões autónomas representados pelo domínio. |
| `EnumEventStatus.cs` | `EventStatus` | Estado do evento: programado, cancelado, adiado, reprogramado, concluído ou movido para online. |
| `EnumLocality.cs` | `LocalityName` | Lista canónica de localidades/municípios suportados. |
| `EnumNuts.cs` | `Nuts2Region` | Regiões NUTS2 de Portugal. |
| `EnumType.cs` | `EventType` | Classificação editorial do evento, como concerto, feira, festival, teatro, desporto ou outro. |

## Nomes e serialização

`DisplayAttribute` fornece o nome apresentado ao utilizador através de
`EnumExtensions.GetDisplayName()`. O JSON da API usa nomes das enumerações por
causa do `JsonStringEnumConverter`; o OpenAPI é transformado para listar esses
valores como strings.

`LocalityName` é também a fonte do slug canónico usado pelo WhatsApp. Ao
adicionar ou renomear uma localidade, verificar `GeoDataService`,
`LocalitySlug`, o catálogo municipal e todos os consumidores de filtros.

Não alterar nomes existentes de forma casual: os nomes podem estar guardados em
MongoDB, em payloads HTTP e nos templates/quick replies do WhatsApp.
