# Backoffice web

`apps/web` é o backoffice Next.js do Scrappy. Permite escolher um município,
consultar eventos da API, alternar entre mapa e lista, filtrar/ordenar os
resultados, abrir detalhes e editar um evento. A aplicação não guarda dados
localmente: o estado da interface vive em React e a fonte de dados é a API
ASP.NET Core.

```text
BackofficeShell
    │ município selecionado (Context)
    ▼
EventsWorkspace
    ├─ eventsApi.fetchEvents ──► GET /events/search (todas as páginas)
    ├─ filtros e ordenação locais
    ├─ EventsList ──► mapa Leaflet ou lista
    └─ EventsActionsPanel ──► detalhes / edição
                               │
                               └─ eventsApi.updateEvent ──► PATCH /events/{id}
```

Existe também a rota `/whatsapp`, que apresenta QR codes para abrir conversas
com mensagens `Subscrever <slug>` já preenchidas.

## Executar

Na raiz da workspace:

```sh
pnpm --filter web dev
```

O backoffice fica em <http://localhost:3000>. Para produção local:

```sh
NEXT_PUBLIC_API_URL=http://localhost:5000 \
pnpm --filter web build
pnpm --filter web start
```

`NEXT_PUBLIC_API_URL` é incorporado no bundle durante o build. Se não for
definido, o client principal usa `http://localhost:5000`.

## Rotas e layout

| Rota/ficheiro | Responsabilidade |
| --- | --- |
| `src/app/page.tsx` | Página inicial: shell do backoffice + workspace de eventos. |
| `src/app/whatsapp/page.tsx` | Página de QR codes para os municípios de demonstração. |
| `src/app/layout.tsx` | Layout raiz, metadata, idioma `pt`, fonte Poppins e CSS do Leaflet. |
| `src/app/globals.css` | Variáveis visuais, estilos globais e regras do mapa/workspace. |
| `public/` | Ícones SVG usados pelos cartões estatísticos e restantes assets estáticos. |

O `BackofficeShell` inicia em `Alcobaça` e disponibiliza `Alcobaça`, `Faro` e
`Lourinhã` no seletor atual. A mudança de município atualiza o contexto e
dispara uma nova pesquisa. A barra lateral e vários itens de navegação são
parte visual do protótipo; não representam rotas implementadas neste package.

## Dados e interação

1. `EventsWorkspace` lê o município do contexto e chama
   `fetchEvents({ municipality })`.
2. `services/eventsApi.ts` consulta `GET /events/search` em páginas de 100
   itens até atingir `totalCount`, converte a resposta da API para os tipos do
   frontend e suporta cancelamento com `AbortController`.
3. O workspace aplica no browser datas, gratuitidade, estado de publicação,
   pesquisa textual e ordenação por data, preço ou título.
4. `EventsList` mostra lista ou carrega `EventMap` dinamicamente sem SSR, porque
   Leaflet depende de APIs do browser.
5. Selecionar um evento abre o painel lateral. O separador de detalhes mostra
   localização, fonte, agenda, ofertas, agentes, audiência e imagem; editar
   abre `EventEditModal`.
6. Ao guardar, `updateEvent` envia o payload completo por `PATCH` e substitui
   o registo atualizado no estado local.

Se a request falhar, a interface mostra o erro no modo lista e um aviso
sobreposto no modo mapa. Uma request anterior é abortada quando o município
muda.

## API e configuração

O client principal respeita `NEXT_PUBLIC_API_URL`:

| Operação | Endpoint |
| --- | --- |
| Pesquisa | `GET {base}/events/search` com `Locality`, paginação, datas, publicação, preço e texto. |
| Edição | `PATCH {base}/events/{id}` com `EventUpdatePayload`. |

Os contadores em `src/components/statCards` e os helpers isolados
`components/button/publish.tsx`/`unpublish.tsx` ainda usam
`http://localhost:5000` diretamente. Ao publicar noutro ambiente, alinhar
essas chamadas com `NEXT_PUBLIC_API_URL` antes de depender delas. As ações
visuais de publicar/remover/apagar no painel são atualmente uma interface de
backoffice em evolução; a edição detalhada é a operação ligada ao client API.

Não existe autenticação no frontend. A API deve estar acessível a partir do
browser e, em produção, deve configurar CORS e autorização adequados.

## Limites atuais da página WhatsApp

`src/app/whatsapp/page.tsx` é uma página de demonstração: o número de telefone
e a lista de municípios estão definidos no código. Cada QR contém um URL
`wa.me` com `Subscrever alcobaca`, `Subscrever faro` ou
`Subscrever lourinha`. A lógica de subscrição e templates pertence à API/
WhatsApp, não ao frontend.

## Tecnologias

- Next.js App Router e React client components;
- TypeScript;
- Tailwind CSS/PostCSS e CSS Modules para o shell/workspace;
- Leaflet + React Leaflet para mapa, limites municipais e marcadores;
- `lucide-react` para ícones e `qrcode.react` para QR codes.

Consulte [src/README.md](src/README.md) para o mapa das pastas e componentes.
