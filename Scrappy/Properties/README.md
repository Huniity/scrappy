# Properties

`launchSettings.json` define perfis de execução local do projeto ASP.NET Core.
Não contém configuração de produção nem segredos.

| Perfil | URL | Ambiente | Uso |
| --- | --- | --- | --- |
| `http` | `http://0.0.0.0:5275` | `Development` | Desenvolvimento local sem TLS. |
| `https` | `https://0.0.0.0:7120` e `http://0.0.0.0:5275` | `Development` | Desenvolvimento local com endpoint HTTPS e fallback HTTP. |

Em produção, as URLs e variáveis devem ser definidas pelo ambiente de execução
(por exemplo, Docker Compose), não editando este ficheiro.
