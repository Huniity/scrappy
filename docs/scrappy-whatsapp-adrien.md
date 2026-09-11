# Scrappy WhatsApp Integration — Adrien Tasks

## Role
**Backend / Scrappy API owner**

Your responsibility is everything that happens **after Meta reaches Scrappy**.

Main area:
- ASP.NET Core
- Webhooks
- Message parsing
- Locality resolution
- MongoDB subscriptions
- WhatsApp service integration
- Backend tests

---

## Sprint 1 Goal

Reach this flow:

```text
WhatsApp
   ↓
Meta
   ↓
POST /webhooks/whatsapp
   ↓
Scrappy ASP.NET Core
   ↓
Parse incoming message
   ↓
Resolve locality
   ↓
Save subscription in MongoDB
   ↓
Send confirmation through WhatsApp
```

For development we use **one WhatsApp test number** and simulate localities using messages like:

```text
SCRAPPY FOLLOW alcobaca
SCRAPPY FOLLOW faro
SCRAPPY FOLLOW lourinha
```

Production will later replace this with:

```text
phone_number_id → locality
```

---

# Task A1 — Create branch

```bash
git checkout -b feature/whatsapp-integration
```

Do not mix unrelated Scrappy work into this branch.

### Done when
- [ ] Branch exists
- [ ] Current Scrappy API runs normally

---

# Task A2 — Add WhatsApp configuration model

Create:

```text
Scrappy/
└── Integrations/
    └── WhatsApp/
        └── WhatsAppOptions.cs
```

Suggested properties:

```csharp
public sealed class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";

    public string AccessToken { get; init; } = string.Empty;
    public string AppSecret { get; init; } = string.Empty;
    public string PhoneNumberId { get; init; } = string.Empty;
    public string WabaId { get; init; } = string.Empty;
    public string VerifyToken { get; init; } = string.Empty;
    public string GraphApiVersion { get; init; } = string.Empty;
}
```

Register it in `Scrappy/Extensions/ServiceCollectionExtensions.cs`.
The actual entrypoint is `Scrappy/Api.cs`, which delegates service registration to
`AddScrappyServices`.

### Done when
- [x] `WhatsAppOptions.cs` exists
- [x] Config section is registered
- [x] API starts without configuration errors

---

# Task A3 — Configure development secrets

Use .NET User Secrets.

```bash
dotnet user-secrets init --project Scrappy/Scrappy.csproj
```

Store:

```text
WhatsApp:AccessToken
WhatsApp:AppSecret
WhatsApp:PhoneNumberId
WhatsApp:WabaId
WhatsApp:GraphApiVersion
WhatsApp:VerifyToken
```

Gonçalo provides:
- Access Token
- App Secret
- Phone Number ID
- WABA ID
- Graph API version

You choose:
- Verify Token

### Important
Never commit Meta credentials or verification tokens.

### Done when
- [x] Secrets load locally
- [x] No credentials are committed to Git

---

# Task A4 — Create webhook verification endpoint

Create:

```text
Scrappy/
└── Controllers/
    └── Webhooks/
        └── WhatsAppWebhookController.cs
```

Implement:

```text
GET /webhooks/whatsapp
```

It must validate:

```text
hub.mode
hub.verify_token
hub.challenge
```

If the verify token matches, return the challenge.

ASP.NET query binding must use the exact Meta parameter names:

```csharp
[FromQuery(Name = "hub.mode")]
[FromQuery(Name = "hub.verify_token")]
[FromQuery(Name = "hub.challenge")]
```

Return the challenge value directly as a plain-text HTTP 200 response.

### Hand-off to Gonçalo

Give Gonçalo:

```text
Webhook URL
Verify Token
```

### Done when
- [x] GET endpoint works locally
- [x] Correct token returns challenge
- [x] Wrong token returns forbidden

---

# Task A5 — Expose API for webhook development

For local development and demonstrations, run Scrappy locally and expose it through
an ngrok HTTPS tunnel. Use the stable development domain assigned to the ngrok
account so Meta's callback URL does not change between sessions.

Example:

```bash
docker run --rm -it \
  --network host \
  -e NGROK_AUTHTOKEN \
  ngrok/ngrok:latest \
  http --url=https://<assigned-domain>.ngrok-free.app \
  http://127.0.0.1:<PORT>
```

Keep `NGROK_AUTHTOKEN` outside the repository. The tunnel is development-only;
staging and production must expose the deployed Scrappy API through their own stable
HTTPS domains.

Because the public HTTPS tunnel forwards to the local HTTP endpoint, configure
ASP.NET forwarded headers before `UseHttpsRedirection()`. This ensures that Scrappy
recognizes the original request as HTTPS and does not generate an incorrect redirect.

Webhook:

```text
https://<assigned-domain>.ngrok-free.app/webhooks/whatsapp
```

### Done when
- [x] Stable ngrok development domain is configured
- [x] Public HTTPS URL reaches Scrappy
- [ ] Gonçalo can use it in Meta

---

# Checkpoint A — Webhook verification

Work together with Gonçalo.

Meta must successfully verify:

```text
GET /webhooks/whatsapp
```

Do not continue until this works.

- [ ] Meta webhook verification successful

---

# Task A6 — Receive webhook POST events

Add:

```text
POST /webhooks/whatsapp
```

Initially:
- accept payload
- validate `X-Hub-Signature-256` using `WhatsApp:AppSecret`
- log only the fields needed for development diagnostics
- return HTTP 200

Do not log full webhook payloads in production because they contain phone numbers
and message content.

Do not implement business logic yet.

### Test
Send a WhatsApp message to the test number.

You should see:
- sender ID / phone number
- destination `phone_number_id`
- message type
- message text

### Done when
- [ ] Incoming message reaches Scrappy
- [ ] Valid Meta signature is accepted
- [ ] Invalid or missing signature is rejected
- [ ] Sender, destination, message ID and type are visible in development logs
- [ ] Endpoint returns 200

---

# Task A7 — Create normalized incoming message model

Create something similar to:

```csharp
public sealed record IncomingWhatsAppMessage(
    string MessageId,
    string UserId,
    string PhoneNumberId,
    string Text
);
```

The rest of Scrappy should not depend directly on Meta's webhook JSON format.
One Meta webhook can contain zero, one or multiple messages, so parsing should return
a collection of normalized messages.

### Done when
- [ ] Meta payload can be transformed into `IncomingWhatsAppMessage`
- [ ] Multiple messages in one webhook are transformed independently
- [ ] Controller no longer needs to know deep JSON structure

---

# Task A8 — Create WhatsApp message parser

Create:

```text
Scrappy/
└── Integrations/
    └── WhatsApp/
        └── WhatsAppMessageParser.cs
```

Responsibilities:
- find inbound text messages
- extract sender
- extract destination Phone Number ID
- extract Meta message ID for idempotency
- extract text body
- ignore unsupported webhook events safely

### Done when
- [ ] Text messages parse correctly
- [ ] Status webhooks do not crash parser
- [ ] Missing fields are handled safely

---

# Task A9 — Implement development locality resolver

For DEV, locality comes from the message:

```text
SCRAPPY FOLLOW alcobaca
SCRAPPY FOLLOW faro
SCRAPPY FOLLOW lourinha
```

Create a simple resolver.

Suggested result:

```csharp
public sealed record FollowLocalityCommand(
    string LocalitySlug
);
```

Rules:
- locality slug must exist
- command should be case-insensitive
- invalid locality should not create a subscription

Reuse the existing `LocalityName` enum through an explicit pilot mapping:

```text
alcobaca → LocalityName.Alcobaça
faro → LocalityName.Faro
lourinha → LocalityName.Lourinhã
```

Do not derive slugs automatically from enum names because accents, spaces and
punctuation require a stable shared convention with the website.

### Important

Keep this isolated because production will later use:

```text
PhoneNumberId → Locality
```

### Done when
- [ ] `FOLLOW alcobaca` resolves Alcobaça
- [ ] `FOLLOW faro` resolves Faro
- [ ] invalid locality returns controlled error

---

# Task A10 — Create MongoDB subscription model

Create:

```text
Scrappy/
└── Models/
    └── Entities/
        └── WhatsAppSubscription.cs
```

Suggested shape:

```csharp
public sealed class WhatsAppSubscription
{
    public string Id { get; set; } = string.Empty;
    public string WhatsAppUserId { get; set; } = string.Empty;
    public string LocalitySlug { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

Create a unique compound MongoDB index for:

```text
WhatsAppUserId + LocalitySlug
```

The database index, rather than an application-side existence check, is the final
protection against concurrent duplicate webhook deliveries.

One user must be able to follow many localities.

### Example

```text
3519XXXX → alcobaca
3519XXXX → faro
3519XXXX → lourinha
```

### Done when
- [ ] Subscription collection exists
- [ ] Unique compound index exists
- [ ] Duplicate subscriptions are prevented
- [ ] Same user can follow multiple localities

---

# Task A11 — Create subscription service

Create:

```text
Scrappy/
└── Services/
    └── WhatsAppSubscriptionService.cs
```

Initial methods:

```text
SubscribeAsync(userId, locality)
UnsubscribeAsync(userId, locality)
IsSubscribedAsync(userId, locality)
GetUserSubscriptionsAsync(userId)
```

Rules:
- subscribe twice = no duplicate
- unsubscribe Alcobaça must not unsubscribe Faro
- inactive subscription can be reactivated
- subscribe/reactivate uses an atomic MongoDB upsert
- asynchronous methods accept a `CancellationToken`

### Done when
- [ ] Subscribe works
- [ ] Unsubscribe works
- [ ] Multiple localities work independently

---

# Task A12 — Create WhatsAppClient

Create:

```text
Scrappy/
└── Integrations/
    └── WhatsApp/
        └── WhatsAppClient.cs
```

Responsibility:

```text
Scrappy
   ↓
Meta Graph API
   ↓
WhatsApp user
```

Initial method:

```csharp
Task SendTextAsync(
    string phoneNumberId,
    string recipient,
    string message,
    CancellationToken cancellationToken = default
);
```

Keep HTTP/Meta-specific code inside this class.
Register it through `IHttpClientFactory`. Passing `phoneNumberId` keeps replies tied
to the destination number from the incoming webhook and supports the future
`PhoneNumberId → Locality` production mapping.

### Done when
- [ ] Scrappy can send a text message
- [ ] API errors are logged/returned clearly
- [ ] Access token is not hard-coded

---

# Task A13 — Connect the subscription flow

Implement:

```text
Incoming WhatsApp message
        ↓
Parser
        ↓
Command resolver
        ↓
SubscriptionService
        ↓
MongoDB
        ↓
WhatsAppClient
```

Example input:

```text
SCRAPPY FOLLOW alcobaca
```

Expected reply:

```text
✅ Agora estás a seguir os eventos de Alcobaça.
```

### Done when
- [ ] Message creates MongoDB subscription
- [ ] User receives confirmation
- [ ] Duplicate follow remains idempotent
- [ ] Re-delivery of the same Meta `MessageId` does not send a second confirmation
- [ ] Webhook acknowledgement is returned promptly to avoid unnecessary Meta retries

---

# Task A14 — Add unsubscribe flow

Support:

```text
SCRAPPY STOP alcobaca
```

Expected result:

```text
Alcobaça → inactive
Faro → unchanged
```

### Done when
- [ ] Only requested locality is unsubscribed
- [ ] User receives confirmation

---

# Task A15 — Backend tests

Minimum tests:

## Parser
- [ ] Parses valid text webhook
- [ ] Parses multiple messages from one webhook
- [ ] Ignores status webhook
- [ ] Handles malformed payload

## Webhook
- [ ] Accepts a valid `X-Hub-Signature-256`
- [ ] Rejects a missing or invalid signature
- [ ] Returns the verification challenge as plain text

## Resolver
- [ ] Valid FOLLOW command
- [ ] Valid STOP command
- [ ] Unknown locality rejected

## Subscription service
- [ ] New subscription
- [ ] Duplicate subscription
- [ ] Multiple localities
- [ ] Unsubscribe one locality
- [ ] Reactivate subscription
- [ ] Concurrent duplicate subscribe preserves one database document

## Idempotency
- [ ] Re-delivery of the same Meta `MessageId` does not repeat side effects

---

# Shared Integration Checkpoint

Together with Gonçalo test:

```text
Alcobaça website
      ↓
WhatsApp
      ↓
SCRAPPY FOLLOW alcobaca
      ↓
Meta
      ↓
Scrappy
      ↓
MongoDB
      ↓
confirmation message
```

Then:

```text
Faro website
      ↓
SCRAPPY FOLLOW faro
```

Database must contain both.

- [ ] Alcobaça flow works
- [ ] Faro flow works
- [ ] Same user has both subscriptions
- [ ] STOP one locality leaves the other active

---

# Not in Sprint 1

Do NOT build yet:

- Weekly scheduler
- BullMQ weekly jobs
- AI recommendations
- Event ranking for digest
- WhatsApp production templates
- One real phone number per locality
- Production PhoneNumberId → locality resolver

Those are Sprint 2+.

---

# Adrien Deliverables

At the end of Sprint 1 you should have:

- [ ] WhatsApp webhook controller
- [ ] Webhook verification
- [ ] Webhook POST receiver
- [ ] WhatsApp message parser
- [ ] Normalized incoming message model
- [ ] Development locality resolver
- [ ] MongoDB subscription model
- [ ] Subscription service
- [ ] WhatsApp sending client
- [ ] FOLLOW flow
- [ ] STOP flow
- [ ] Backend tests
- [ ] Successful end-to-end test with Gonçalo
