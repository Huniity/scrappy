# Adaptadores de fontes

Cada subpasta adapta uma plataforma externa para o modelo interno
`src/types/normalizedEvent.ts`. Um adaptador lê HTML/JSON-LD e devolve dados
normalizados; não cria jobs BullMQ nem chama diretamente a API.

## Fontes

| Pasta | Conteúdo |
| --- | --- |
| [`bol/`](bol/README.md) | Extractor e tipos para páginas BOL. |
| [`viralAgenda/`](viralAgenda/README.md) | Extractor, tipos e chamada do endpoint de mapa da Viral Agenda. |

Os testes ficam junto dos extractores. Depois de alterar o formato de uma
fonte, testar a extração isolada e uma execução do router até à validação
`RawEvent`.

