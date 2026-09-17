# Fonte Viral Agenda

Esta pasta interpreta o JSON-LD e os dados auxiliares das páginas de eventos
da Viral Agenda.

## Ficheiros

| Ficheiro | Responsabilidade |
| --- | --- |
| `extract.ts` | Lê o evento JSON-LD, localização, agentes, audiência, ofertas, agenda, estado e modo de participação; também constrói e interpreta o pedido `POST <evento>/map`. |
| `types.ts` | Tipos JSON-LD da fonte, resposta de mapa e estruturas `one-or-many`. |
| `extract.test.ts` | Testes de parsing, datas, coordenadas e normalização. |

As propriedades que Schema.org permite fornecer como objeto ou lista são
convertidas para arrays estáveis. A extração do mapa complementa o endereço
textual com latitude/longitude antes de `resolveLocation` verificar o município.

A descoberta de URLs de listagens com infinite scroll e a navegação renderizada
ficam em [`src/crawlers/viralAgenda.ts`](../../src/crawlers/README.md), não
neste extractor.

Teste rápido:

```sh
pnpm test1
```

