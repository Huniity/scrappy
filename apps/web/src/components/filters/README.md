# Componentes de filtros

`resetFilters.tsx` exporta `ResetFiltersButton`, um botão simples que chama
`onReset`. A feature de eventos tem filtros próprios em
`features/events/`; este componente existe para reutilização em outras views e
não contém estado nem chamadas à API.

