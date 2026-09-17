# Resolução geográfica

`municipalities.ts` carrega `../../data/geo/municipalities.geojson` uma vez,
quando o módulo é inicializado, e expõe duas operações:

| Função | Comportamento |
| --- | --- |
| `findMunicipalityByCoordinates(latitude, longitude)` | Cria um ponto Turf e devolve o município cujo polígono contém esse ponto. |
| `findExactMunicipality(value)` | Compara o nome completo ignorando maiúsculas, espaços exteriores e diacríticos. |

`enrichment/location.ts` coordena estas operações e devolve também as
coordenadas originais quando foram usadas. A geometria é a fonte de verdade
para pontos; a comparação textual é deliberadamente exata para não transformar
uma localidade ou freguesia num município por aproximação.

