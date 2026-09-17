# Integrations

Esta camada contém adaptadores para serviços externos. O código aqui conhece o
protocolo do fornecedor (payloads, headers, autenticação e limites), enquanto
as regras de negócio ficam em `Services`.

Atualmente existe uma integração:

- [`WhatsApp`](WhatsApp/README.md): webhook de entrada e cliente de saída para
  a Meta WhatsApp Business Graph API.

Ao integrar um novo fornecedor, criar uma subpasta própria e manter o seu
formato externo fora dos controllers e das entidades MongoDB. O serviço de
negócio deve chamar um adaptador desta camada através de uma interface ou de uma
classe claramente delimitada.
