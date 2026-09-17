# Exceptions

Esta pasta contém exceções de domínio usadas para representar falhas
específicas da API. As exceções não substituem validações previsíveis: quando
uma entrada pode ser rejeitada antes de executar uma operação, deve ser usada
uma regra em `Validators` e um `Result<T>`.

| Ficheiro | Tipo | Quando usar |
| --- | --- | --- |
| `DuplicatedEntity.cs` | `DuplicateEntityException` | Uma entidade viola uma regra de unicidade ou já existe com os mesmos dados únicos. |
| `Validation.cs` | `ValidationException` | Um valor ou formato não cumpre uma regra de domínio que precisa de ser propagada como exceção. |

## Tratamento

O `GlobalExceptionMiddleware` captura exceções não tratadas, regista o erro e
devolve uma resposta JSON genérica. Por isso, as exceções não devem incluir
segredos ou dados sensíveis na mensagem. Para erros esperados de uma operação,
é preferível devolver `Result<T>.Failure(...)` no serviço e deixar o controller
traduzir esse resultado para HTTP.

Ao criar uma nova exceção:

1. usar um nome que descreva a regra violada;
2. disponibilizar construtores com mensagem e `innerException` quando fizer
   sentido;
3. documentar no serviço que a pode lançar;
4. confirmar como será convertida em resposta HTTP.
