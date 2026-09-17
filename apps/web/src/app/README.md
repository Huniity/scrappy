# Rotas App Router

Esta pasta segue a convenção App Router do Next.js.

| Ficheiro/pasta | Responsabilidade |
| --- | --- |
| `layout.tsx` | Layout raiz, metadata, idioma, fonte Poppins e CSS global/Leaflet. |
| `page.tsx` | Rota `/`: compõe `BackofficeShell` e `EventsWorkspace`. |
| `whatsapp/page.tsx` | Rota `/whatsapp`: gera cartões e QR codes de subscrição. |
| `globals.css` | Variáveis de tema e estilos globais. |

As rotas delegam a lógica para `components` e `features`. O layout não deve
fazer chamadas de eventos; a pesquisa é iniciada pelo workspace no browser.

