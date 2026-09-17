# Configuração do scraper

Esta pasta contém a configuração declarativa das fontes e os filtros usados
pela descoberta de links. O código de `main.ts` lê `sources.json` e valida-o
com `../source.ts` antes de iniciar o crawler.

## Ficheiros

| Ficheiro | Responsabilidade |
| --- | --- |
| `sources.json` | Jobs ativos. Cada entrada define `sourceUrl`, `sourceId`, `engine` e `timezone`. |
| `SOURCES.md` | Lista de referências de Viral Agenda atualmente pausadas; serve como memória de configuração e não é carregada pelo processo. |
| `blacklist.json` | Padrões que impedem seguir PDFs, imagens, páginas de conta e outras páginas que não são eventos. |

## Jobs de fonte

`sourceUrl` é a página inicial. `sourceId` identifica logicamente o job; IDs
com prefixo `viral-agenda` ativam a descoberta especial com Playwright. O campo
`engine` aceita `auto`, `cheerio` e `playwright`, mas o entrypoint atual cria
sempre `CheerioCrawler` e reserva Playwright para descoberta/fallback. O
`timezone` é validado e documenta o fuso esperado pela fonte; os normalizadores
atuais usam `Europe/Lisbon` como padrão quando o fuso não é propagado.

Para acrescentar uma fonte, adicionar uma entrada válida a `sources.json`,
confirmar o padrão de links no router e criar testes para o extractor. Não
colocar tokens, cookies ou respostas completas de sites nesta pasta.

