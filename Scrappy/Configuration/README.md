# Configuration

> Configuração versionada que descreve recursos externos usados pela API.

Os ficheiros desta pasta não contêm lógica de negócio. São carregados no arranque
pela API e permitem alterar dados de configuração sem alterar os serviços que os
consomem.

## Conteúdo atual

| Ficheiro | Responsabilidade |
| --- | --- |
| [municipalities.json](municipalities.json) | Catálogo de municípios suportados pelo fluxo WhatsApp: logótipo e agenda oficial de cada município. |

## Como o catálogo é carregado

```text
Api.cs
  └─ carrega Configuration/municipalities.json
       └─ MunicipalityCatalogOptions
            └─ MunicipalityCatalog
                 ├─ mensagens WhatsApp com imagem do município
                 └─ GET /municipio/{slug} → agenda oficial
```

O ficheiro é obrigatório no arranque (`optional: false`). Embora a configuração
esteja registada com `reloadOnChange`, o `MunicipalityCatalog` é um singleton e
mantém a configuração que recebeu no arranque. Trata alterações a este ficheiro
como alterações que exigem reiniciar a API.

## Formato de `municipalities.json`

```json
{
  "MunicipalityCatalog": {
    "Entries": {
      "faro": {
        "LogoPath": "/municipality-logo/faro.png",
        "WebsiteUrl": "https://www.cm-faro.pt/pt/agenda.aspx"
      }
    }
  }
}
```

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| Chave da entrada (`faro`) | Sim | Slug canónico em minúsculas, usado nos URLs e nos comandos WhatsApp. |
| `LogoPath` | Sim | Caminho público relativo, iniciado por `/`, sem `..`, e com extensão `.png`, `.jpg` ou `.jpeg`. O ficheiro deve existir em `Scrappy/wwwroot`. |
| `WebsiteUrl` | Sim | URL HTTPS absoluto da agenda oficial do município. |

## Ao adicionar ou alterar um município

1. Escolhe o slug canónico. Deve corresponder ao valor produzido por
   `LocalitySlug.From(...)` para evitar falhas nos comandos WhatsApp.
2. Coloca o logótipo em `Scrappy/wwwroot/municipality-logo/`.
3. Adiciona ou atualiza a entrada neste ficheiro com um `LogoPath` e um
   `WebsiteUrl` HTTPS válidos.
4. Reconstrói/reinicia a API. Reconstrói também o frontend, que lê este mesmo
   ficheiro para gerar os redirects públicos.
5. Confirma `GET /municipio/{slug}`, `GET /municipios/{slug}` e a imagem pública
   antes de publicar.

Este catálogo controla apenas recursos externos usados no fluxo WhatsApp e nos
redirecionamentos. Adicionar uma entrada aqui não adiciona, por si só, suporte de
recolha, geografia ou eventos para esse município.

Os tipos que representam esta configuração estão em
[Models/Configuration](../Models/Configuration/MunicipalityCatalogOptions.cs), e
a validação/resolução está em
[Services/MunicipalityCatalog.cs](../Services/MunicipalityCatalog.cs). O
[frontend](../../apps/web/next.config.ts) também consome este ficheiro durante o
build para criar os redirects de `/municipio/{slug}` e `/municipios/{slug}`.
