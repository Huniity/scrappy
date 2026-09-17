# Fallback Playwright para BOL

Os extractores desta pasta leem a página BOL depois de ela ser renderizada pelo
Playwright. São usados quando o HTML obtido inicialmente não permite construir
um evento válido.

| Ficheiro | Responsabilidade |
| --- | --- |
| `extractors.ts` | Funções para rejeitar cookies e extrair título, tipo, recinto, idade, sessões, descrição, endereço, imagem e outros campos do DOM renderizado. |
| `types.ts` | Tipos auxiliares específicos da leitura da página BOL renderizada. |

Este módulo não faz retries, não abre o browser e não publica na fila. Essas
decisões pertencem a `router.ts`; o resultado é entregue ao extractor comum de
`sources/bol` e depois ao pipeline de validação/enriquecimento.

