# Extensions

As classes desta pasta agrupam métodos de extensão usados na composição da
aplicação. Elas evitam repetir configuração no `Api.cs` e concentram convenções
transversais, como serialização, rotas, CORS e apresentação de enumerações.

| Ficheiro | O que faz |
| --- | --- |
| `DateTimeExtensions.cs` | Converte `DateTime` para texto ISO 8601 e `TimeSpan` para duração ISO 8601 através de `XmlConvert`. |
| `EnumExtensions.cs` | Obtém o nome de apresentação de uma enumeração (`DisplayAttribute`) e cria `CodeNameDto` com código e nome legível. |
| `ServiceCollectionExtensions.cs` | Regista MongoDB, controllers, OpenAPI, CORS, routing, catálogo municipal, serviços de negócio e WhatsApp no contentor de DI. |
| `WebApplicationExtensions.cs` | Configura Swagger/OpenAPI em desenvolvimento, forwarded headers, HTTPS, ficheiros estáticos, CORS, autorização e mapeamento dos controllers. |

## Registo de dependências

`AddScrappyServices(...)` é o ponto central de composição. A ordem atual é:

1. CORS;
2. MongoDB (`IMongoClient` singleton e `IMongoDatabase` scoped);
3. opções e serviços da integração WhatsApp;
4. catálogo de municípios;
5. MVC e enumerações como strings JSON;
6. OpenAPI, incluindo schemas de enumerações;
7. URLs/query strings em minúsculas;
8. serviços da aplicação e hosted services.

O connection string `MongoDb` tem de incluir o nome da base de dados. Uma
alteração de lifetime deve ser avaliada com cuidado: os serviços scoped podem
usar recursos da request, enquanto hosted services criam scopes próprios.

## Pipeline HTTP

`UseScrappyPipeline(...)` deve continuar a ser chamado depois de
`builder.Build()`. Em desenvolvimento publica `/openapi/v1.json` e `/swagger`;
em qualquer ambiente serve assets estáticos, aceita headers de proxy, aplica
CORS e mapeia os controllers.
