# Dados geográficos

Esta pasta contém a geometria dos municípios usada por
`../../src/geo/municipalities.ts`.

## Ficheiros

| Ficheiro/pasta | Uso |
| --- | --- |
| `municipalities.geojson` | FeatureCollection principal. Cada feature representa um `Polygon` ou `MultiPolygon` e tem `properties.municipio`. É o ficheiro carregado pelo scraper em runtime. |
| `prepared/` | Recortes regionais preparados para ferramentas ou consultas futuras. Não são carregados pelo módulo atual. |

As coordenadas GeoJSON seguem a ordem `[longitude, latitude]`. O código usa
Turf para testar se um ponto `[longitude, latitude]` pertence a cada polígono.
Também usa o mesmo conjunto para procurar o nome exato do município, ignorando
maiúsculas e diacríticos.

O ficheiro principal é grande e está versionado como dado de referência. Não o
editar manualmente para corrigir um evento individual: corrija a fonte ou a
regra de resolução e valide os testes de localização.

