# Models

Os modelos representam dados internos da API. Ao contrário dos `DTOs`, não são
contratos HTTP: são estruturas usadas pelos serviços, pelos mappers e pelo
driver MongoDB.

| Subpasta/ficheiro | O que contém |
| --- | --- |
| `Events.cs` | Entidade principal `Event`, com dados, estado, fontes, localização, agenda, ofertas e qualidade. |
| `MongDBSettings.cs` | Modelo auxiliar para parâmetros de MongoDB (`ConnectionUri`, `DatabaseName`, `CollectionName`); a composição atual obtém a ligação através de `ConnectionStrings:MongoDb`. |
| `Configuration` | Classes que recebem configuração tipada, como o catálogo municipal. |
| `Entities` | Documentos MongoDB e submodelos embutidos nos documentos de eventos. |

## Eventos e persistência

Um evento persistido é um `DistrictEvent`: contém um identificador do documento,
o distrito e um `Event` aninhado. O `Event` guarda o identificador do evento,
datas, fontes, classificação, estado de publicação, `QualityScore`, localização
e relações como agentes, audiência, ofertas e horário.

As propriedades têm atributos BSON para definir nomes, representação de
enumerações e tipos de data. Alterar um nome BSON ou o tipo de uma propriedade
pode tornar documentos existentes incompatíveis; antes de o fazer, verificar
dados em MongoDB e os mappers.

## Relação com outras camadas

```text
DTOs de request ──(Mappers)──> Models/Entities ──(MongoDB)
Models/Entities ──(Mappers)──> DTOs de response ou Schema.org
```

`Models` não deve conter regras de transporte HTTP. Regras de validação ficam em
`Validators`, regras de negócio em `Services` e apresentação em `DTOs`/mappers.
