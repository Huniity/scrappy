# Integração WhatsApp

Esta pasta implementa a fronteira com a Meta WhatsApp Business API. Há dois
sentidos de comunicação:

```text
Meta → POST /webhooks/whatsapp → parser → WhatsAppMessageProcessor
API  → WhatsAppClient → Graph API /{version}/{phone-number-id}/messages
```

## Ficheiros

| Ficheiro | Responsabilidade |
| --- | --- |
| `WhatsAppClient.cs` | Cliente HTTP tipado para enviar texto, template de ajuda e template semanal com imagem, variáveis e botões. Valida a URL pública HTTPS, token, versão Graph e parâmetros obrigatórios. |
| `WhatsAppEventMessageFormatter.cs` | Formata eventos para mensagens livres em português, converte UTC para o timezone configurado e divide o texto respeitando o limite de caracteres. |
| `WhatsAppEventSelection.cs` | Records imutáveis que representam uma seleção de eventos e cada item apresentado no relatório. |
| `WhatsAppEventsTemplateParameters.cs` | Parâmetros exigidos pelo template aprovado de eventos: município, slug, contagem, janela e logo. |
| `WhatsAppFollowCommand.cs` | Comandos estruturados para `Subscrever`, `Stop` e quick replies de relatórios; `WhatsAppCommandResolver` valida localidade e janela. |
| `WhatsAppHelpCommand.cs` | Reconhece os textos `Help` e `Ajuda`. |
| `WhatsAppIncomingMessage.cs` | Modelo normalizado de uma mensagem recebida, independentemente do JSON original da Meta. |
| `WhatsAppIndexInitializer.cs` | Hosted service que cria o índice único `(WhatsAppUserId, LocalitySlug)` das subscrições. |
| `WhatsAppLocalitySlug.cs` | Converte nomes de localidades em slugs canónicos: minúsculas, sem diacríticos e com hífen. |
| `WhatsAppMessageParser.cs` | Lê o envelope do webhook e suporta mensagens `text`, `button` e `interactive.button_reply`. Payloads inválidos são ignorados. |
| `WhatsAppOptions.cs` | Opções da secção `WhatsApp`: credenciais, templates, limites, timezone e `PublicBaseUrl`. `NoEventsTemplateName` está disponível na configuração, mas o fluxo atual usa uma mensagem de texto quando não há eventos. |
| `WhatsAppSignatureValidator.cs` | Valida `X-Hub-Signature-256` com HMAC-SHA256 e comparação em tempo constante. |
| `WhatsAppWeeklyReportIndexInitializer.cs` | Hosted service que cria o índice único `(WhatsAppUserId, LocalitySlug, WeekStartUtc)` para evitar relatórios semanais duplicados. |

## Comandos e payloads

O resolver aceita texto livre com o formato:

```text
Subscrever <localidade>
Stop <localidade>
```

Os nomes são normalizados pelo mesmo algoritmo usado para construir os slugs.
Uma quick reply de relatório usa o payload interno:

```text
event_report:<locality-slug>:<yyyy-MM-dd>:<yyyy-MM-dd>
```

A janela tem no máximo sete dias e termina num domingo. O botão de URL do
template recebe o slug como variável; o URL final deve ser configurado no
template aprovado da Meta e apontar para o redirecionamento municipal da API.

## Configuração e segurança

As opções são ligadas da secção `WhatsApp` no arranque. Os campos sensíveis são
`AccessToken` e `AppSecret`; não os escrever em logs nem em ficheiros versionados.
`PublicBaseUrl` tem de ser uma URL HTTPS acessível pela Meta, porque a imagem do
header do template é carregada remotamente.

Para alterar um template, confirmar em conjunto:

1. o nome e idioma (`TemplateLanguageCode`) aprovados na Meta;
2. a ordem e o tipo dos componentes (header, body e botões);
3. o payload produzido por `WhatsAppClient`;
4. o parser/command resolver que consome as respostas dos botões.

Os dois initializers são executados no arranque e garantem unicidade no
MongoDB. Esta garantia é necessária para que reentregas do webhook não criem
subscrições nem relatórios repetidos.
