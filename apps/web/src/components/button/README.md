# Helpers de publicação

`publish.tsx` e `unpublish.tsx` exportam funções assíncronas que fazem
`PATCH /events/{id}` com `{ isPublished: true|false }`.

Estes helpers validam `response.ok` e devolvem o JSON ou lançam um erro. Neste
momento usam `http://localhost:5000` diretamente e não são o caminho usado pela
edição principal, que passa por `services/eventsApi.ts`. Se forem reutilizados
em produção, devem partilhar a configuração `NEXT_PUBLIC_API_URL` e atualizar
o estado do workspace após a resposta.

