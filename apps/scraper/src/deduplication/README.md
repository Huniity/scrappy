# Deduplicação intermédia

`events.ts` disponibiliza `deduplicateEvents` para remover repetições de uma
lista de `NormalizedEvent`.

## Chave e escolha

A chave é composta por:

```text
title normalizado | dia de startDate (YYYY-MM-DD) | locality normalizada
```

Quando existem dois registos com a mesma chave, é preferido o que tem hora no
`startDate`/`endDate`. Os campos em falta (descrição, imagem, tipo, recinto,
endereço, coordenadas, preço, idade e lotação) são preenchidos a partir do
outro registo.

O router atual não chama este helper diretamente. A deduplicação de jobs é
feita pela fila através do URL e a deduplicação de conteúdo persistido é feita
pela API (`EventDeduplicationService`). Este módulo é uma ferramenta de
normalização que pode ser reutilizada se uma fonte devolver listas duplicadas.

