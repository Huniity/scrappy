# wwwroot

`wwwroot` contém ficheiros estáticos servidos diretamente pela API através do
middleware `UseStaticFiles()`.

| Subpasta | Conteúdo |
| --- | --- |
| `municipality-logo` | Logos municipais referenciadas por `MunicipalityCatalog.LogoPath` e carregadas pela Meta quando a API envia o template WhatsApp com imagem. |

Os caminhos configurados devem começar por `/` e apontar para ficheiros PNG,
JPG ou JPEG sem `..`. Quando uma logo é trocada, confirmar que o novo ficheiro
é publicado no mesmo caminho ou atualizar o catálogo e testar a URL pública
HTTPS.
