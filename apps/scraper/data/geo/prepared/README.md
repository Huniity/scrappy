# GeoJSON preparado

Os ficheiros desta pasta são versões regionais do conjunto de municípios:

- `municipalities-continente.geojson` — Portugal continental;
- `municipalities-acores-central-oriental.geojson` — grupos Central e Oriental
  dos Açores;
- `municipalities-acores-ocidental.geojson` — grupo Ocidental dos Açores;
- `municipalities-madeira.geojson` — Madeira.

Servem para reduzir o âmbito de ferramentas que precisem de processar apenas
uma região. A implementação atual continua a carregar
`../municipalities.geojson`; estes recortes não alteram o comportamento do
scraper até serem explicitamente ligados ao código.

