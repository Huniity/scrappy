# Página WhatsApp

`page.tsx` implementa a rota `/whatsapp` do backoffice. Para cada município da
lista local cria uma mensagem `Subscrever <slug>` e um QR code/ligação
`https://wa.me/<número>?text=...`.

É uma página client-side porque usa `QRCodeSVG`. O número de teste e as
localidades estão hardcoded para demonstração; alterar estes valores exige
também confirmar que os slugs são aceites pelo parser de comandos da API.

