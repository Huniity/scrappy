# Código fonte do frontend

`src` contém o App Router, componentes visuais, a feature de eventos e o
client HTTP da API. A organização separa a infraestrutura de layout da lógica
específica do domínio de eventos.

| Pasta | Responsabilidade |
| --- | --- |
| [`app/`](app/README.md) | Rotas Next.js, layout raiz e estilos globais. |
| [`components/`](components/README.md) | Shell, mapa, cartões e pequenos componentes reutilizáveis. |
| [`features/`](features/README.md) | Workspaces de domínio; atualmente a feature de eventos. |
| [`services/`](services/README.md) | Comunicação com a API e adaptação dos payloads. |

`lucide-icons.d.ts` contém declarações TypeScript auxiliares para imports de
ícones. Os componentes que usam estado, efeitos, Leaflet ou QR code são
marcados como `use client`; o layout e as páginas só mantêm lógica server-safe
quando possível.

## Direção dos dados

```text
API JSON
   │ services/eventsApi.ts
   ▼
EventRecord / EventItem
   │ EventsWorkspace
   ├─ filtros e ordenação
   ├─ EventsList → map/list
   └─ EventsActionsPanel → EventEditModal → PATCH
```

Os tipos em `features/events/events.types.ts` representam a resposta já
adaptada para a interface. Não alterar apenas um tipo local quando o contrato
da API mudar: rever `eventsApi.ts`, DTOs C# e o payload de edição em conjunto.

