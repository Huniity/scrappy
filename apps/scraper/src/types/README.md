# Tipos internos

Esta pasta descreve, apenas em TypeScript, o modelo intermédio usado entre os
extractores e o router. Não substitui a validação runtime de
`apps/shared/rawEvent.ts`.

| Ficheiro | Conteúdo |
| --- | --- |
| `normalizedEvent.ts` | `NormalizedEvent`, estrutura comum com dados do evento, localização, datas, agentes, ofertas e agenda. |
| `agent.ts` | Agentes normalizados e nós Schema.org de organizador/promotor/etc. |
| `audience.ts` | Audiência normalizada e estrutura Schema.org de público-alvo. |
| `offer.ts` | Ofertas normalizadas e estrutura Schema.org de bilhete/preço. |
| `schedule.ts` | Agenda normalizada e campos de recorrência Schema.org. |
| `attendance.ts` | Valores internos e mapa de `Offline/Online/MixedEventAttendanceMode`. |
| `status.ts` | Valores internos e mapa de estados Schema.org, como `Scheduled` e `Cancelled`. |

`NormalizedEvent` é intencionalmente permissivo porque cada fonte fornece um
conjunto diferente de campos. O router escolhe os campos necessários,
normaliza o URL, resolve o município e passa o objeto resultante por
`rawEventSchema` antes do enqueue.

