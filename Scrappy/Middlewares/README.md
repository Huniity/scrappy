# Middlewares

Middleware é comportamento transversal executado à volta de cada request. A
pasta contém atualmente um único middleware.

| Ficheiro | Responsabilidade |
| --- | --- |
| `GlobalExceptionsMiddleware.cs` | Quando registado no pipeline, captura exceções não tratadas, regista-as com `ILogger` e devolve `ApiResultDto<string>.Failure(...)` com HTTP 500 e `application/json`. |

## Contrato de erro

O middleware não expõe a mensagem interna da exceção ao cliente. A resposta é
intencionalmente genérica (`Ocorreu um erro interno no servidor.`), enquanto os
detalhes ficam nos logs. Erros de validação e recursos inexistentes devem ser
tratados nos controllers/serviços para poderem devolver o status adequado.

Nota: a classe existe, mas a composição atual ainda não chama
`UseMiddleware<GlobalExceptionsMiddleware>()`. Assim, os controllers continuam
a tratar localmente as suas exceções; ativar o middleware é uma alteração
explícita ao pipeline.

Se for adicionado outro middleware, documentar a posição necessária no
pipeline em `Extensions/WebApplicationExtensions.cs`, porque a ordem afeta
headers, CORS, static files, autorização e tratamento de erros.
