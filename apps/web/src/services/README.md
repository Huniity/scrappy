# Services HTTP

`eventsApi.ts` é o client da API de eventos para o frontend.

## `fetchEvents`

Recebe `EventSearchFilters`, constrói parâmetros com nomes esperados pela API
(`Locality`, `Page`, `PageSize`, `SortBy`, datas, publicação, preço e pesquisa),
consulta páginas de 100 itens e junta os resultados até `totalCount`. O
resultado é convertido de `ApiDistrictEvent`/`ApiEvent` para `EventRecord`,
normalizando regiões que podem vir como string ou `{ code, name }` e preenchendo
valores opcionais com defaults adequados à interface.

## `updateEvent`

Envia `PATCH /events/{id}` com `EventUpdatePayload`, interpreta mensagens de
erro da API e exige que a resposta contenha um evento. Reutiliza `mapEvent` para
devolver o mesmo formato usado pela lista e pelo painel.

O base URL vem de `NEXT_PUBLIC_API_URL`, removendo a barra final, com fallback
para `http://localhost:5000`. Este é o ponto recomendado para centralizar
alterações de endpoint, timeout ou autenticação do frontend.

