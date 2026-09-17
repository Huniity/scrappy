# Dados estáticos

`data` guarda ficheiros de suporte usados pelo scraper, atualmente os limites
geográficos dos municípios portugueses em `geo/`.

Estes ficheiros não são eventos nem dados de execução. São lidos pelo módulo de
geolocalização para confirmar em que município caem coordenadas encontradas nas
fontes. Alterações ao GeoJSON devem ser revistas com cuidado porque podem
alterar a classificação territorial de muitos eventos.

Veja [geo/README.md](geo/README.md) para o formato e a utilização dos ficheiros.

