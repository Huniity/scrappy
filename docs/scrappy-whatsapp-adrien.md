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
- [x] Valid Meta signature is accepted
- [x] Invalid or missing signature is rejected
- [ ] Sender, destination, message ID and type are visible in development logs
- [x] Endpoint returns 200

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
- [x] Meta payload can be transformed into `IncomingWhatsAppMessage`
- [x] Multiple messages in one webhook are transformed independently
- [x] Controller no longer needs to know deep JSON structure

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
- [x] Text messages parse correctly
- [x] Status webhooks do not crash parser
- [x] Missing fields are handled safely

---

# Task A9 — Implement locality command resolver

For Sprint 1, locality comes from the message:

```text
SCRAPPY FOLLOW alcobaca
SCRAPPY FOLLOW faro
SCRAPPY FOLLOW lourinha
```

Create a resolver that supports every value in the existing `LocalityName` enum.

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

The command result should preserve both the stable slug used by the subscription
and the corresponding enum value used by Scrappy:

```csharp
public sealed record FollowLocalityCommand(
    string LocalitySlug,
    LocalityName Locality
);
```

Build the lookup once from `Enum.GetValues<LocalityName>()`. Generate each canonical
slug from the enum's existing `Display(Name)` value by:

- converting to lowercase
- removing diacritics
- replacing spaces and punctuation with a single `-`
- trimming leading and trailing separators

Examples:

```text
Alcobaça → alcobaca
Lourinhã → lourinha
Póvoa de Varzim → povoa-de-varzim
Calheta (Açores) → calheta-acores
Calheta (Madeira) → calheta-madeira
```

Do not maintain a second hard-coded list of municipalities. Fail during lookup
creation if two enum values generate the same slug, so an ambiguous locality is
never selected silently. This slug convention must also be returned to or shared
with the website when it creates the pre-filled WhatsApp message.

### Important

Keep this isolated because production will later use:

```text
PhoneNumberId → Locality
```

### Done when
- [x] `FOLLOW alcobaca` resolves Alcobaça
- [x] `FOLLOW faro` resolves Faro
- [x] Multi-word and accented localities resolve through their canonical slug
- [x] All `LocalityName` values have a unique generated slug
- [x] invalid locality returns controlled error

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
- [x] Subscription collection exists
- [x] Unique compound index exists
- [x] Duplicate subscriptions are prevented
- [x] Same user can follow multiple localities

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
- [x] Subscribe works
- [x] Unsubscribe works
- [x] Multiple localities work independently

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

# Sprint 2 Goal — Deliver real locality events

Sprint 2 extends the subscription created in Sprint 1 with two delivery moments:

```text
New or reactivated FOLLOW
        ↓
Query real upcoming events for that locality
        ↓
Send the current event selection immediately
```

```text
Weekly scheduled run
        ↓
Load active subscriptions
        ↓
Query real upcoming events by locality
        ↓
Send the approved weekly WhatsApp template
```

In this plan, a user's **area** means the subscribed `LocalityName`. Radius or
GPS-based subscriptions require a separate data model and are not part of this
sprint.

The first version uses deterministic chronological selection. AI recommendations
and personalized ranking can be added later without blocking real event delivery.

---

# Task A16 — Create locality event selection service

Create a service that reuses the existing `EventQueryService` and the locality
resolved by the subscription flow.

Rules:
- query `DistrictEvents` through the existing event query layer
- filter by the subscribed `LocalityName`
- include only published events
- include only upcoming events
- order by start date ascending
- limit the number of events per WhatsApp message using configuration
- return a deterministic result so retries produce the same selection

The result should contain only the fields required to format the WhatsApp message,
such as event ID, title, start date, place and public event URL.

### Done when
- [ ] Published upcoming events are returned for the requested locality
- [ ] Past, unpublished and other-locality events are excluded
- [ ] Results are ordered and limited consistently
- [ ] No-events result is handled explicitly

---

# Task A17 — Send current events after subscription

After a new subscription or reactivation succeeds, query the current real events
for that locality and send them in the WhatsApp conversation. This is triggered by
the user's `FOLLOW` message and can use the normal reply flow.

Suggested reply shape:

```text
✅ Agora estás a seguir os eventos de Alcobaça.

Próximos eventos:
1. Nome do evento — 14 Jun, 21:00 — Local
2. Nome do evento — 16 Jun, 18:30 — Local

Ver todos: <public locality/events URL>
```

If there are no upcoming published events, confirm the subscription and explain
that the user will receive the next weekly update when events are available.

Rules:
- a re-delivery of the same Meta `MessageId` must not send the list twice
- an already active duplicate `FOLLOW` must remain idempotent
- event-query or Meta API failure must not undo a subscription already saved
- do not expose unpublished event data

### Done when
- [ ] New subscription receives real events for the correct locality
- [ ] Reactivated subscription receives the current event selection
- [ ] Empty locality result produces a controlled message
- [ ] Duplicate webhook delivery does not repeat the event message

---

# Task A18 — Add approved weekly template sending

Coordinate with Gonçalo's template work and extend `WhatsAppClient` with a template
message method. The final Meta template must define the language and variables used
for the locality, event summary and public link.

Weekly messages are proactive and may be sent outside the active customer service
window, so the production flow must use a template approved by Meta. Keep template
name, language and variable mapping in configuration rather than hard-coding them
inside the scheduler.

### Done when
- [ ] Weekly template is approved in Meta
- [ ] `WhatsAppClient` can send the approved template
- [ ] Template name, language and variables are mapped explicitly
- [ ] Meta API errors are recorded without exposing tokens or phone numbers in logs

---

# Task A19 — Schedule the weekly locality digest

Run one weekly dispatch using a production-capable scheduler or worker. Do not rely
on an uncoordinated in-memory timer inside every API replica.

Flow:
1. load active subscriptions
2. group them by locality so events are queried once per locality
3. generate the current event selection
4. send the approved template to each subscribed user
5. record the dispatch result

Rules:
- use the `Europe/Lisbon` timezone for the agreed delivery day and time
- check that the subscription is still active immediately before sending
- retry transient Meta failures with bounded backoff
- prevent duplicate delivery with a unique key such as
  `WhatsAppUserId + LocalitySlug + WeekStart`
- one failed recipient must not stop the remaining weekly dispatch

### Done when
- [ ] Weekly run finds all active subscriptions
- [ ] Each user receives events only for subscribed localities
- [ ] The same locality is queried once per run
- [ ] A retry or repeated scheduler run does not duplicate a weekly message
- [ ] STOPped subscriptions receive no later weekly message

---

# Task A20 — Sprint 2 backend tests

Minimum tests:

## Event selection
- [ ] Filters by locality, publication status and future date
- [ ] Orders and limits results consistently
- [ ] Handles a locality with no upcoming events

## Immediate subscription delivery
- [ ] Sends the correct locality's events after a new subscription
- [ ] Does not repeat delivery for the same Meta `MessageId`
- [ ] Preserves the subscription if event delivery fails

## Weekly dispatch
- [ ] Sends only to active subscriptions
- [ ] Supports one user subscribed to multiple localities
- [ ] Prevents duplicate delivery for the same week
- [ ] Continues after an individual send failure
- [ ] Uses the configured approved template

---

# Sprint 2 Deliverables

At the end of Sprint 2 you should have:

- [ ] Real upcoming event selection by locality
- [ ] Immediate event message after subscription or reactivation
- [ ] Approved weekly WhatsApp template
- [ ] Template sending support in `WhatsAppClient`
- [ ] Production-capable weekly scheduled dispatch
- [ ] Weekly delivery idempotency and retry handling
- [ ] Sprint 2 backend tests

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
