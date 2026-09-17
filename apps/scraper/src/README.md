# Código interno do scraper

`src` contém as regras reutilizáveis entre fontes: acesso renderizado,
normalização, enriquecimento geográfico/metadados, deduplicação e tipos
intermédios. O fluxo é orquestrado por `../main.ts` e `../router.ts`.

## Áreas

| Pasta | Responsabilidade |
| --- | --- |
| [`crawlers/`](crawlers/README.md) | Browser Playwright, headers e extractores de páginas renderizadas. |
| [`deduplication/`](deduplication/README.md) | Helper para escolher eventos equivalentes numa lista. |
| [`enrichment/`](enrichment/README.md) | Município, tipo e metadados derivados. |
| [`geo/`](geo/README.md) | Pesquisa de municípios no GeoJSON. |
| [`normalization/`](normalization/README.md) | Conversão dos formatos BOL/Viral Agenda para `NormalizedEvent`. |
| [`types/`](types/README.md) | Tipos TypeScript do modelo intermédio e dos nós Schema.org. |

As funções de `src` não devem conhecer MongoDB, controllers C# ou detalhes de
BullMQ. A única saída do pipeline é o evento validado pelo contrato em
`../../shared/rawEvent.ts`, que o router entrega ao package de ingestão.

