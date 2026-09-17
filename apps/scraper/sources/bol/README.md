# Fonte BOL

Esta pasta contém a leitura de eventos publicados em páginas BOL.

## Ficheiros

| Ficheiro | Responsabilidade |
| --- | --- |
| `extract.ts` | Lê scripts JSON-LD, `@graph`, evento, localização, geo, ofertas, imagem, sessões e campos de texto; devolve `NormalizedEvent` através do normalizador BOL. |
| `types.ts` | Tipos dos nós JSON-LD BOL, localização, ofertas e pares de coordenadas. |
| `extractBol.test.ts` | Testes do extractor e das regras de normalização BOL. |

O extractor tenta encontrar coordenadas em `location.geo` e em iframes/mapas
quando a fonte as fornece. Datas sem offset e sessões com meses em português
são tratadas em `src/normalization/bol.ts`.

Quando o HTML obtido por Cheerio não contém dados suficientes, o router usa os
extractores renderizados de [`src/crawlers/bol/`](../../src/crawlers/bol/README.md)
como fallback Playwright. A publicação na fila só acontece depois de a
localização, enriquecimento e `rawEventSchema` serem validados.

Teste rápido:

```sh
pnpm test2
```

