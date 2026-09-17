# Crawlers especializados

Esta pasta reúne o que precisa de um browser real ou de headers específicos
para além do request Cheerio inicial.

| Ficheiro/pasta | Responsabilidade |
| --- | --- |
| `httpHeaders.ts` | Headers e user-agent reutilizados nas requests e páginas Playwright. |
| `viralAgenda.ts` | Descobre URLs com infinite scroll, abre detalhes renderizados e consulta o endpoint de coordenadas `/map`. |
| [`bol/`](bol/README.md) | Extratores de fallback para DOM BOL renderizado e regras auxiliares. |

O router tenta Cheerio primeiro. Playwright é usado na descoberta de listagens
Viral Agenda e, para detalhes BOL/Viral Agenda que falhem ou não tenham JSON-LD
suficiente, até três vezes. As páginas são fechadas em `finally`; o browser
partilhado é encerrado pelo `main.ts`.

