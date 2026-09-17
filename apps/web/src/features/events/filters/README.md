# Filtros de eventos

Esta pasta contém os controlos usados por `../EventsFilters.tsx`:

| Ficheiro | Responsabilidade |
| --- | --- |
| `EventPublishedFilter.tsx` | Escolhe todos, publicados ou a publicar. |
| `EventSortFilter.tsx` | Abre a lista de ordenação por data, preço ou título e fecha após escolher. |
| `EventSearchFilter.tsx` | Input de pesquisa textual. |
| `EventAdvancedFilters.tsx` | Datas inicial/final e preço (`todos`, `gratuitos`, `pagos`). |
| `EventsFilters.tsx` | Coordena abertura/fecho dos menus, clique exterior e tecla Escape. |

Os componentes são controlados: recebem o valor atual e callbacks do workspace.
Não fazem requests nem conhecem a API.

