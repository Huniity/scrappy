# Mapa de eventos

`eventMap.tsx` é o componente Leaflet usado quando o workspace está no modo
Mapa. Recebe `EventRecord[]` e callbacks de seleção/detalhes.

Responsabilidades principais:

- carregar limites municipais de `municipalityBoundaries.json`;
- mostrar apenas eventos com latitude e longitude válidas;
- agrupar eventos que partilham coordenadas;
- abrir popups com título, distrito, local e data;
- permitir selecionar um evento ou abrir o painel de detalhes;
- aplicar zoom/expansão e animação de marcadores sobrepostos.

`eventTypeIcons.ts` normaliza o texto do tipo (`Exposição`, espaços, hífens e
acentos) e gera a marcação SVG Lucide correspondente, usando o ícone de ajuda
para tipos desconhecidos.

O mapa é importado com `next/dynamic` e `ssr: false` em `EventsList`, porque
Leaflet precisa de `window`/DOM. Os limites locais são um asset estático e não
são obtidos da API em runtime.

