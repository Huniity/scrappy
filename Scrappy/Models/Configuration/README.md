# Models/Configuration

Esta subpasta contém classes de opções ligadas à configuração da aplicação.
Elas definem o formato esperado, mas não carregam diretamente os ficheiros nem
fazem chamadas HTTP.

| Ficheiro | Responsabilidade |
| --- | --- |
| `MunicipalityCatalogOptions.cs` | Modela a secção `MunicipalityCatalog`, com um dicionário de slugs e, para cada município, `LogoPath` e `WebsiteUrl`. |

## Catálogo municipal

`MunicipalityCatalogOptions.SectionName` é `MunicipalityCatalog`. O binding é
feito em `ServiceCollectionExtensions.AddMunicipalityCatalog` e consumido por
`Services/MunicipalityCatalog`.

Cada entrada deve usar o slug canónico em minúsculas. `LogoPath` é um caminho
local público para PNG/JPEG; `WebsiteUrl` é uma URL HTTPS absoluta. A validação
destes requisitos ocorre no serviço quando a entrada é utilizada, permitindo
que erros de configuração sejam identificados com o slug afetado.
