# Shell do backoffice

`BackofficeShell.tsx` fornece a moldura visual usada pelas páginas: rail de
ícones, topbar, seletor de município, breadcrumb, navegação lateral e área de
conteúdo.

Também cria `MunicipalityContext` e exporta `useMunicipality`, que é consumido
por `EventsWorkspace` e pelos contadores estatísticos. O município inicial é
`Alcobaça`; a lista atual é `Alcobaça`, `Faro` e `Lourinhã`.

`BackofficeShell.module.css` define dimensões, cores, rail, topbar, dropdown e
layout responsivo do shell. Os botões da navegação são atualmente elementos
visuais sem routing para módulos adicionais.

