# Cartões estatísticos

Esta pasta implementa os quatro números apresentados por `EventsStats`:

| Ficheiro | Métrica |
| --- | --- |
| `countEvent.tsx` | Total de eventos do município. |
| `hasCoords.tsx` | Eventos com coordenadas e percentagem do total. |
| `addedEvent.tsx` | Eventos publicados e percentagem do total. |
| `freeEvent.tsx` | Eventos gratuitos e percentagem do total. |
| `percentageCounter.tsx` | Formata percentagens com uma casa decimal e vírgula decimal. |

Cada contador é um client component, lê o município pelo contexto e consulta
`/events/search` para obter `totalCount`. Usa `AbortController` quando o
município muda. As chamadas estão atualmente fixas em `http://localhost:5000`,
ao contrário de `services/eventsApi.ts`; alinhar isto com
`NEXT_PUBLIC_API_URL` ao configurar outro ambiente.

