# Common

> Primitivos reutilizáveis da API que não pertencem a uma funcionalidade
> específica.

Esta pasta deve conter tipos pequenos e estáveis que podem ser usados por várias
camadas da aplicação. Não deve conter lógica de acesso a dados, regras de negócio
específicas de eventos, nem contratos HTTP.

## Conteúdo atual

| Ficheiro | Responsabilidade |
| --- | --- |
| [Result.cs](Result.cs) | Representa o resultado de uma operação que pode ter sucesso ou falhar sem lançar uma exceção. |

## `Result<T>`

`Result<T>` torna explícito que uma operação pode devolver um valor ou uma razão
para não o devolver:

```csharp
Result<DistrictEvent> result = await eventService.GetEventById(id);

if (!result.IsSuccess)
{
    return NotFound(result.Error);
}

return Ok(result.Value);
```

Cria-se sempre através das fábricas:

```csharp
Result<Event>.Success(evento);
Result<Event>.Failure("Evento não encontrado.");
```

### Contrato

| Propriedade | Quando usar |
| --- | --- |
| `IsSuccess` | Verificar primeiro, antes de aceder a `Value`. |
| `Value` | Resultado da operação quando `IsSuccess` é `true`. |
| `Error` | Explicação da falha quando `IsSuccess` é `false`. |

É usado por `EventService` e `EventQueryService`; os controladores de eventos
convertem essas falhas esperadas em respostas HTTP adequadas. Erros inesperados
de infraestrutura continuam a ser tratados como exceções pela aplicação.

Código relacionado:

- [EventService](../Services/EventServices.cs)
- [EventQueryService](../Services/EventQueryService.cs)
- [EventsController](../Controllers/EventsController.cs)
- [EventsQueryController](../Controllers/EventsQueryController.cs)

## Quando adicionar algo aqui

Adiciona um tipo a `Common` apenas quando ele:

- é independente de uma área concreta, como eventos ou WhatsApp;
- é usado, ou tem potencial real para ser usado, por mais de uma camada;
- não depende de ASP.NET, MongoDB ou de um DTO HTTP.

Para a visão geral das camadas da API, consulta a
[arquitetura do projeto](../../docs/ARCHITECTURE.md).
