# DTOs comuns

> Tipos de transporte pequenos, reutilizados por mais do que um fluxo de
> eventos.

Estes DTOs não representam um evento completo. Servem para envolver resultados,
paginar coleções ou devolver uma enumeração com um código estável e um nome
legível. Para o mapa completo, vê [DTOs](../README.md).

## Conteúdo

| Ficheiro | Tipo declarado | Responsabilidade | Uso atual |
| --- | --- | --- | --- |
| [ApiResultDto.cs](ApiResultDto.cs) | `ApiResultDto<T>` | Envelope genérico de sucesso ou falha. | Criado pelo `GlobalExceptionMiddleware` para exceções não tratadas. |
| [PagedResultDto.cs](PagedResultDto.cs) | `PagedResult<T>` | Página de uma coleção, com metadados de paginação. | Produzido por `EventQueryService` e convertido pelos mapeadores de resposta. |
| [CodeNameDto.cs](CodeNameDto.cs) | `CodeNameDto` | Par código legível/nome de apresentação. | Campo `region` de `EventLocationResponseDto`. |

## `ApiResultDto<T>`

`ApiResultDto<T>` uniformiza uma operação que pode transportar dados ou uma
falha. As fábricas estáticas devem ser preferidas a instanciar o tipo
manualmente.

| Propriedade C# | JSON atual do middleware | Tipo | Preenchida em | Significado |
| --- | --- | --- | --- | --- |
| `IsSuccess` | `IsSuccess` | `bool` | Todos os casos. | Indica se a operação terminou com sucesso. |
| `Data` | `Data` | `T?` | `Success(data)`. | Dados devolvidos no sucesso. |
| `ErrorMessage` | `ErrorMessage` | `string?` | `Failure(string)`. | Mensagem de uma falha simples. |
| `ValidationErrors` | `ValidationErrors` | `List<string>` | `Failure(List<string>)`; inicia vazia. | Lista de erros de validação. |

```csharp
var success = ApiResultDto<EventResponseDto>.Success(evento);
var failure = ApiResultDto<string>.Failure("Ocorreu um erro interno no servidor.");
```

Importante: este não é ainda o envelope de todas as rotas. Os controladores de
eventos devolvem normalmente objetos com a propriedade `error`; o middleware
global usa `ApiResultDto<string>` apenas quando existe uma exceção não tratada.
Como esse middleware chama `JsonSerializer.Serialize` sem as opções MVC, a sua
saída atual usa `IsSuccess`, `Data`, `ErrorMessage` e `ValidationErrors` em
PascalCase. Não introduzas dependência deste formato num cliente sem confirmar a
rota em causa.

Código relacionado:

- [GlobalExceptionsMiddleware](../../Middlewares/GlobalExceptionsMiddleware.cs)

## `PagedResult<T>`

Apesar do nome do ficheiro, o tipo público chama-se `PagedResult<T>`. É o
envelope que as pesquisas devolvem, depois de o resultado interno de MongoDB
ser mapeado para `DistrictEventResponseDto`.

| Propriedade JSON | Tipo | Origem / cálculo |
| --- | --- | --- |
| `items` | `IEnumerable<T>` | Elementos da página atual. |
| `totalCount` | `long` | Número de itens que satisfazem o filtro, antes da paginação. |
| `page` | `int` | Página atual, começada em `1`. |
| `pageSize` | `int` | Máximo de itens por página. |
| `totalPages` | `int` | `ceil(totalCount / pageSize)`. |
| `hasNextPage` | `bool` | Verdadeiro quando `page < totalPages`. |
| `hasPreviousPage` | `bool` | Verdadeiro quando `page > 1`. |

É usado como `PagedResult<DistrictEventResponseDto>` nas rotas
`GET /events/search` e `GET /public/events`. A validação de
`EventQueryParameters` assegura que `page` é pelo menos `1` e que `pageSize`
fica entre `1` e `100`, evitando divisão por zero nos metadados calculados.

Código relacionado:

- [EventQueryParameters](../Requests/EventQueryDto.cs)
- [EventQueryService](../../Services/EventQueryService.cs)
- [EventResponseMapper](../../Mappers/EventResponseMapper.cs)

## `CodeNameDto`

`CodeNameDto` é um `record` imutável com dois valores:

| Propriedade JSON | Tipo | Exemplo | Origem |
| --- | --- | --- | --- |
| `code` | `string` | `"PT15"` | Nome técnico da enumeração. |
| `name` | `string` | `"Algarve"` | `DisplayAttribute` da enumeração, quando existe; caso contrário o próprio nome da enumeração. |

Atualmente é usado em `location.region` nas respostas REST. O método
`EnumExtensions.ToCodeName()` é quem transforma a enumeração de região neste
contrato. Reutiliza este DTO para outros valores controlados apenas quando o
cliente realmente precisa das duas representações; uma simples string é mais
adequada quando não há um código distinto a expor.

Código relacionado:

- [EventLocationResponseDto](../Responses/EventLocationResponseDto.cs)
- [EnumExtensions](../../Extensions/EnumExtensions.cs)
