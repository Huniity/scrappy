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
Integrations/
└── WhatsApp/
    └── WhatsAppOptions.cs
```

Suggested properties:

```csharp
public sealed class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";

    public string AccessToken { get; init; } = string.Empty;
    public string PhoneNumberId { get; init; } = string.Empty;
    public string WabaId { get; init; } = string.Empty;
    public string VerifyToken { get; init; } = string.Empty;
    public string GraphApiVersion { get; init; } = string.Empty;
}
```

Register it in `Program.cs`.

### Done when
- [ ] `WhatsAppOptions.cs` exists
- [ ] Config section is registered
- [ ] API starts without configuration errors

---

# Task A3 — Configure development secrets

Use .NET User Secrets.

```bash
dotnet user-secrets init
```

Store:

```text
WhatsApp:AccessToken
WhatsApp:PhoneNumberId
WhatsApp:WabaId
WhatsApp:GraphApiVersion
WhatsApp:VerifyToken
```

Gonçalo provides:
- Access Token
- Phone Number ID
- WABA ID
- Graph API version

You choose:
- Verify Token

### Important
Never commit Meta access tokens.

### Done when
- [ ] Secrets load locally
- [ ] No credentials are committed to Git

---

# Task A4 — Create webhook verification endpoint

Create:

```text
Controllers/
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

### Hand-off to Gonçalo

Give Gonçalo:

```text
Webhook URL
Verify Token
```

### Done when
- [ ] GET endpoint works locally
- [ ] Correct token returns challenge
- [ ] Wrong token returns forbidden

---

# Task A5 — Expose API for webhook development

Run Scrappy locally and expose it through a development HTTPS tunnel.

Example:

```bash
cloudflared tunnel --url http://localhost:<PORT>
```

Webhook:

```text
https://<tunnel>/webhooks/whatsapp
```

### Done when
- [ ] Public HTTPS URL reaches Scrappy
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
- log payload
- return HTTP 200

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
- [ ] Payload is visible in logs
- [ ] Endpoint returns 200

---

# Task A7 — Create normalized incoming message model

Create something similar to:

```csharp
public sealed record IncomingWhatsAppMessage(
    string UserId,
    string PhoneNumberId,
    string Text
);
```

The rest of Scrappy should not depend directly on Meta's webhook JSON format.

### Done when
- [ ] Meta payload can be transformed into `IncomingWhatsAppMessage`
- [ ] Controller no longer needs to know deep JSON structure

---

# Task A8 — Create WhatsApp message parser

Create:

```text
Integrations/
└── WhatsApp/
    └── WhatsAppMessageParser.cs
```

Responsibilities:
- find inbound text messages
- extract sender
- extract destination Phone Number ID
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
Models/
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
}
```

Unique logical key:

```text
WhatsAppUserId + LocalitySlug
```

One user must be able to follow many localities.

### Example

```text
3519XXXX → alcobaca
3519XXXX → faro
3519XXXX → lourinha
```

### Done when
- [ ] Subscription collection exists
- [ ] Duplicate subscriptions are prevented
- [ ] Same user can follow multiple localities

---

# Task A11 — Create subscription service

Create:

```text
Services/
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

### Done when
- [ ] Subscribe works
- [ ] Unsubscribe works
- [ ] Multiple localities work independently

---

# Task A12 — Create WhatsAppClient

Create:

```text
Integrations/
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
    string recipient,
    string message,
    CancellationToken cancellationToken = default
);
```

Keep HTTP/Meta-specific code inside this class.

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
- [ ] Ignores status webhook
- [ ] Handles malformed payload

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
