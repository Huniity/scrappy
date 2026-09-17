# Feature de eventos

Esta pasta implementa a experiência completa de gestão de eventos: carregamento
da API, filtros, mapa/lista, seleção, painel de detalhes, edição e métricas.

## Ficheiros

| Ficheiro/pasta | Responsabilidade |
| --- | --- |
| `EventsWorkspace.tsx` | Estado da view, município, requests, filtros, ordenação, seleção e coordenação dos restantes componentes. |
| `EventsList.tsx` | Alterna entre lista textual e `EventMap`; trata loading, erro e lista vazia. |
| `EventsFilters.tsx` | Composição dos filtros de estado, ordenação, pesquisa e filtros avançados. |
| `EventsActionsPanel.tsx` | Painel lateral de detalhes, seleção, imagem ampliada e entrada na edição. |
| `EventEditModal.tsx` | Formulário completo de edição de evento, localização, agenda, agentes, audiência e ofertas. |
| `EventsStats.tsx` | Composição dos cartões estatísticos. |
| `events.types.ts` | Tipos de resposta, filtros, seleção e payload de edição. |
| `events.config.ts` | Opções de ordenação e truncamento do título da lista. |
| `events.module.css` | Dimensões e regras específicas do workspace/painéis. |
| [`filters/`](filters/README.md) | Componentes individuais dos filtros. |

## Estado e filtros

`EventsWorkspace` mantém os eventos carregados, datas, preço, publicação,
pesquisa, ordenação, modo mapa/lista e seleção. A pesquisa à API é feita por
município; os filtros são aplicados localmente para permitir resposta imediata.
A pesquisa textual ignora diacríticos e procura em título, tipo, distrito,
local e localidade. Datas e formatação usam `Europe/Lisbon`.

Selecionar um marcador ou linha abre o painel de ações; abrir detalhes muda o
separador para detalhes. Eventos publicados já terminados produzem um aviso e
podem ser selecionados para revisão.

## Edição

`EventEditModal` transforma o `EventItem` recebido num formulário editável,
converte inputs locais de data para ISO e constrói `EventUpdatePayload`. O
workspace envia-o por `updateEvent`, substitui o evento devolvido e fecha o
modal se a operação tiver sucesso. Erros são propagados para o componente que
abriu o modal.

