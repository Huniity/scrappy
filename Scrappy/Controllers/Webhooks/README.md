# Controllers/Webhooks

> Pontos de entrada HTTP para chamadas automáticas de sistemas externos.

Esta pasta contém controladores que recebem notificações *server-to-server*, e
não endpoints usados diretamente pela interface da Scrappy. Atualmente recebe o
webhook da WhatsApp Business Platform. O controlador limita-se a autenticar a
origem, normalizar a mensagem e encaminhá-la para os serviços apropriados; não
contém regras de subscrição, seleção de eventos nem envio de mensagens.

## Conteúdo atual

| Ficheiro | Responsabilidade |
| --- | --- |
| [WhatsAppWebhookController.cs](WhatsAppWebhookController.cs) | Verifica a subscrição do webhook pela Meta e recebe, autentica e encaminha mensagens WhatsApp recebidas. |

## `WhatsAppWebhookController`

A rota base é `webhooks/whatsapp`. Há dois endpoints na mesma rota, pois a Meta
usa pedidos diferentes para configurar e para entregar o webhook:

| Método | Rota | Finalidade | Resposta de sucesso |
| --- | --- | --- | --- |
| `GET` | `/webhooks/whatsapp` | Confirmar à Meta que a aplicação controla o URL configurado. | `200 text/plain` com o valor de `hub.challenge`. |
| `POST` | `/webhooks/whatsapp` | Receber notificações assinadas, extrair mensagens suportadas e processá-las. | `200 OK` depois de todas as mensagens normalizadas serem encaminhadas. |

### `GET`: verificação inicial do webhook

Quando se configura ou volta a validar o callback na Meta, esta chama o endpoint
com os parâmetros de query `hub.mode`, `hub.verify_token` e `hub.challenge`.
Os nomes com pontos são intencionais: os atributos `FromQuery` fazem o *binding*
para os nomes exatos enviados pela Meta.

O pedido é aceite apenas se:

- `hub.mode` for `subscribe` (sem distinguir maiúsculas de minúsculas);
- `hub.verify_token` corresponder exatamente a `WhatsApp:VerifyToken`;
- o token configurado não estiver vazio; e
- `hub.challenge` estiver presente e não for vazio.

Se o token ou o modo não forem válidos, a API devolve `403 Forbidden`. Se faltar
o desafio, devolve `400 Bad Request`. Nunca se deve devolver o token: apenas o
desafio de um pedido validado é enviado de volta em texto simples.

### `POST`: receção e autenticação

O corpo é lido como bytes, antes de ser interpretado como JSON. Isto é essencial:
a assinatura da Meta é calculada sobre os bytes originais, não sobre um JSON
desserializado ou reformatado.

```text
Meta
  │ POST /webhooks/whatsapp
  ▼
corpo bruto + X-Hub-Signature-256
  │
  ├─ corpo vazio                         → 400
  ├─ assinatura ausente ou inválida      → 401
  ▼
WhatsAppMessageParser
  │ normaliza zero, uma ou várias mensagens
  ▼
WhatsAppMessageProcessor (uma vez por mensagem)
  ▼
200 OK
```

`WhatsAppWebhookSignatureValidator` valida o cabeçalho
`X-Hub-Signature-256`. O formato esperado é `sha256=<hash-em-hexadecimal>`; o
hash é um HMAC-SHA-256 do corpo bruto com `WhatsApp:AppSecret`. A comparação é
feita em tempo constante para não expor informação através do tempo de resposta.
A validação acontece antes do parsing ou de qualquer efeito de negócio.

Depois de validado, o payload é entregue a `WhatsAppMessageParser`. Um JSON
malformado, um evento de estado, ou uma estrutura que não seja uma notificação de
mensagens WhatsApp válida resulta numa lista vazia, e a API responde `200 OK`.
Isto permite ignorar com segurança notificações que não representam mensagens de
utilizador, sem provocar tentativas repetidas da Meta.

O controlador regista o tamanho do payload e a quantidade de mensagens extraídas.
Em `Development`, regista também os identificadores da mensagem, do utilizador e
do número que a recebeu para diagnóstico. O corpo completo e o respetivo texto
não são registados pelo controlador.

## Parsing e formato interno

O controlador não conhece a estrutura profunda do JSON da Meta. Essa adaptação
está em [WhatsAppMessageParser](../../Integrations/WhatsApp/WhatsAppMessageParser.cs),
que só considera mensagens dentro de um evento `whatsapp_business_account` com
o campo `messages`.

São suportadas mensagens:

| Tipo recebido da Meta | Texto normalizado | `ButtonPayload` |
| --- | --- | --- |
| `text` | `text.body` | `null` |
| `button` | `button.text` | `button.payload` |
| `interactive` com `button_reply` | `interactive.button_reply.title` | `interactive.button_reply.id` |

Cada mensagem válida torna-se um
[`IncomingWhatsAppMessage`](../../Integrations/WhatsApp/WhatsAppIncomingMessage.cs):

| Campo | Origem | Utilização posterior |
| --- | --- | --- |
| `MessageId` | `messages[].id` | Chave de idempotência. |
| `UserId` | `messages[].from` | Identifica o utilizador/subscritor WhatsApp. |
| `PhoneNumberId` | `metadata.phone_number_id` | Define o número empresarial que deve enviar a resposta. |
| `Text` | Corpo ou título da mensagem | Resolve comandos escritos pelo utilizador. |
| `ButtonPayload` | Payload/ID do botão, quando existe | Resolve respostas rápidas de relatórios. |

Campos em falta, tipos não suportados e eventos que não sejam mensagens são
ignorados pelo parser. Para suportar um novo tipo de mensagem, altera o parser e
mantém este contrato normalizado, em vez de fazer o controlador depender do JSON
da Meta.

## Idempotência e processamento

O processamento é delegado a
[`WhatsAppMessageProcessor`](../../Services/WhatsAppMessageProcessor.cs), que
protege cada `MessageId` contra entregas repetidas da Meta:

```text
IncomingWhatsAppMessage.MessageId
  │
  ├─ inserção em MongoDB: WhatsAppProcessedMessages
  │     └─ já existe → ignora a entrega duplicada
  ▼
resolver comando / atualizar subscrição / enviar resposta
```

O ID é inserido antes de executar o comando. Como é a chave primária da coleção,
uma segunda entrega do mesmo ID não volta a subscrever, cancelar ou enviar a
resposta. Se uma operação falhar antes de alterar o estado da subscrição, o
processador remove o ID para permitir uma nova tentativa da Meta. Depois de um
comando de subscrição alterar estado persistente, mantém o ID mesmo que uma
entrega posterior falhe; assim, uma repetição não transforma uma confirmação de
"voltaste a subscrever" numa mensagem incorreta de "já estás a seguir".

O `CancellationToken` do pedido é propagado ao processamento. Se uma exceção não
for tratada pelo processador, ela sobe para o pipeline ASP.NET Core; nesse caso o
pedido não recebe o `200 OK` final e a Meta pode voltar a entregá-lo. A
idempotência é, por isso, parte essencial da segurança funcional deste endpoint.

## Configuração e segurança operacional

O webhook depende da secção `WhatsApp` configurada em fontes de segredos fora do
repositório. Para estes dois endpoints, os valores sensíveis são:

| Chave | Uso |
| --- | --- |
| `WhatsApp:VerifyToken` | Compara o pedido de verificação `GET` da Meta. |
| `WhatsApp:AppSecret` | Calcula e valida o HMAC do pedido `POST`. |

Regras a preservar ao alterar este fluxo:

- Não versionar tokens, segredos ou payloads reais de utilizadores.
- Manter o callback num URL público com HTTPS e configurar esse URL na Meta.
- Validar sempre a assinatura sobre o corpo bruto, antes de o analisar ou
  processar.
- Não remover a proteção por `MessageId`; as entregas de webhook podem ser
  repetidas.
- Evitar adicionar logs de texto integral, números de telefone ou cabeçalhos de
  autenticação, especialmente fora de desenvolvimento.

O registo das dependências WhatsApp está em
[ServiceCollectionExtensions](../../Extensions/ServiceCollectionExtensions.cs).
Para uma visão do envio de respostas e dos comandos aceites após este controlador,
consulta a pasta [Services](../../Services/).

## Alterar em segurança

Ao modificar este controlador, confirma pelo menos:

1. Um `GET` com token correto devolve exatamente o `hub.challenge`; token errado
   devolve `403`.
2. Um `POST` com corpo vazio devolve `400`; uma assinatura inválida ou ausente
   devolve `401`.
3. Um payload assinado com uma ou mais mensagens processa cada `MessageId` uma
   única vez.
4. Um webhook de estado ou JSON malformado, ainda que assinado, não desencadeia
   comandos nem respostas ao utilizador.

Para a visão geral de todos os endpoints HTTP, consulta o README da pasta
pai [Controllers](../README.md).
