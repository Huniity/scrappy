# Enriquecimento

Os módulos desta pasta acrescentam valores derivados antes da validação final
de `RawEvent`.

| Ficheiro | Responsabilidade |
| --- | --- |
| `location.ts` | Resolve o município por coordenadas no GeoJSON e, como fallback, por nome exato da página/localidade. |
| `eventMetadata.ts` | Extrai preço, gratuitidade, idade e lotação; também expõe helpers para hora de abertura e duração usados pelos normalizadores. |
| `eventType.ts` | Converte tipos Schema.org e palavras-chave para os valores textuais aceites pela API. |
| `*.test.ts` | Testes de metadados e de resolução geográfica. |

`resolveLocation` dá prioridade às coordenadas: isto permite corrigir nomes de
localidade ambíguos quando o ponto cai claramente num município. Sem ponto nem
nome exato, devolve `null` e o router não publica o evento.

`extractEventMetadata` evita inferir um preço quando há vários preços ou texto
que pode representar estacionamento/taxas/doações. Ofertas estruturadas têm
precedência para determinar se o evento é gratuito. A classificação de tipo
usa regras explícitas e termina em `Outro` quando não há correspondência.

