# Logos municipais

Esta pasta guarda as imagens usadas no header dos templates WhatsApp de eventos.
Os nomes dos ficheiros são associados aos slugs no catálogo
`Configuration/municipalities.json` (por exemplo, `faro.png` para `faro`).

As imagens precisam de estar acessíveis através de `PublicBaseUrl` em HTTPS;
caso contrário, a Meta não consegue carregar a imagem do template. Evitar
alterar nomes sem atualizar a entrada `LogoPath` correspondente.
