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
- `SubscribeAsync` reports `Created`, `Reactivated` or `AlreadyActive`
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
- [x] Scrappy can send a text message
- [x] API errors are logged/returned clearly
- [x] Access token is not hard-coded

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
Obter eventos de alcobaca
```

Expected reply:

```text
✅ Agora estás a seguir os eventos de Alcobaça.
```

### Done when
- [x] Message creates MongoDB subscription
- [x] User receives confirmation
- [x] Duplicate follow remains idempotent
- [x] A new follow command for an active subscription reports that it is already active
- [x] Re-delivery of the same Meta `MessageId` does not send a second confirmation
- [x] Webhook acknowledgement is returned promptly to avoid unnecessary Meta retries

---

# Task A14 — Add unsubscribe flow

Support:

```text
Stop alcobaca
```

Expected result:

```text
Alcobaça → inactive
Faro → unchanged
```

### Done when
- [x] Only requested locality is unsubscribed
- [x] Repeated STOP reports that there is no active subscription
- [x] User receives confirmation

## Additional command — Help

Support the case-insensitive commands `Help` and `Ajuda` without accessing MongoDB.
The initial text reply proves the command-routing path; Task A18 replaces that reply
with the approved `help` template and also sends the same template after a new or
reactivated subscription.

### Done when
- [x] `Help` and `Ajuda` are recognized
- [x] User receives the temporary text command list
- [ ] Task A18 replaces the temporary text with the approved `help` template

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
Obter eventos de alcobaca
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
Obter eventos de faro
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
Send approved help template
        ↓
Query events from the subscription time through the end of the current Sunday
        ↓
Send scrappy_weekly_events summary template
        ↓
Send event details as free-form text while the 24-hour window is open
```

```text
Weekly scheduled run
        ↓
Load active subscriptions
        ↓
Query events for the following Monday-through-Sunday week
        ↓
Send scrappy_weekly_events summary template with a generic quick reply
        ↓
User taps "Receber eventos"
        ↓
Webhook receives the locality/report-window payload and opens the 24-hour window
        ↓
Send event details as free-form text
```

The weekly template also contains a dynamic URL button that opens
`https://www.scrappy.pt/municipio/<slug>`. Scrappy validates the canonical slug and
redirects the browser to the municipality's configured official agenda URL.

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
- accept an explicit inclusive date window in the `Europe/Lisbon` timezone
- for an immediate subscription report, start at the subscription time and end at
  the end of the current Sunday
- for the Sunday weekly report, start at the following Monday and end at the
  following Sunday
- order by start date ascending
- limit the total number of events per report using configuration; free-form
  message splitting belongs to Task A17
- return a deterministic result so retries produce the same selection

Expose a canonical locality contract for the frontend, generated from the same
`LocalityName` and `LocalitySlug` code used by the WhatsApp resolver. The contract
must provide at least the enum code, display name and slug. The frontend must not
maintain its own hard-coded list or a separate slug algorithm.

The result must expose the total number of matching events before the display limit,
plus the ordered event items required by the immediate and weekly messages: title,
start date and place/address. All selected events are rendered sequentially; there
is no highlighted-event concept.

### Done when
- [ ] Published upcoming events are returned for the requested locality
- [ ] Past, unpublished and other-locality events are excluded
- [ ] Results are ordered and limited consistently
- [ ] No-events result is handled explicitly
- [ ] Frontend can obtain canonical locality codes, display names and slugs from Scrappy

---

# Task A17 — Format event details as free-form messages

The event details no longer belong inside `scrappy_weekly_events`. Format them as
normal WhatsApp text messages so each event can keep its line breaks:

```text
📌 Festival de Verão
📅 18 de setembro, 21:00
📍 Praça da República

📌 Concerto Municipal
📅 19 de setembro, 18:30
📍 Teatro Municipal
```

Replace the template-specific one-line formatter and its 800-character limit with
a method such as:

```csharp
IReadOnlyList<string> FormatEventDetailParts(
    WhatsAppEventSelection selection);
```

Rules:
- preserve the three visual lines for every event
- normalize whitespace inside scraped title and place values
- order events chronologically using the selection returned by Task A16
- split a long report between complete event blocks, never in the middle of a
  normal event
- use a configured safe limit for free-form text messages
- only abbreviate at a word boundary if one individual event exceeds that limit
- return no parts for an empty selection
- do not add a logo, button, total count or `Parte X/Y` to these messages

The current `FormatTemplateEventSummaryParts`,
`MaxTemplateSummaryCharacters` and `MaxTemplateMessagesPerReport` belong to the
discarded design and must be removed when this task is implemented.

### Done when
- [ ] Event details retain line breaks
- [ ] Long reports are split only between complete events
- [ ] Template-only summary configuration has been removed
- [ ] Empty selections return no free-form parts

---

# Task A18 — Implement the final approved template contracts

Coordinate the exact component order and indexes with Gonçalo before changing the
payloads. Keep the template names and language in `WhatsAppOptions`, not inside the
message processor.

## `help` (`pt_PT`)

This is a fixed explanatory template. It tells the user how to subscribe, stop a
subscription and request help. It has no locality-specific parameters.

Send it:
- when the incoming command is `Help` or `Ajuda`
- immediately after a new or reactivated subscription
- before the subscription's summary template

Do not send it again for `AlreadyActive` unless that behavior is explicitly chosen
later.

Add a dedicated method such as:

```csharp
Task SendHelpTemplateAsync(
    string phoneNumberId,
    string recipient,
    CancellationToken cancellationToken = default);
```

## `scrappy_weekly_events` (`pt_PT`)

Final backend contract:

```text
Header image  → subscribed municipality logo URL
Body {{1}}    → EventCount
Body {{2}}    → LocalityName
Button 0      → QUICK_REPLY, visible text "Receber eventos"
Button 1      → dynamic URL, visible text "Ver no website"
```

The template body contains only the number of events and municipality. Remove
`EventsSummary` from `WhatsAppEventsTemplateParameters` and from the Meta payload.

The quick-reply label is fixed and generic. Its invisible payload is supplied for
each send and must identify both the canonical locality and report window:

```text
event_report:faro:2026-09-21:2026-09-27
```

Including both dates supports the immediate `today → Sunday` window and the weekly
`Monday → Sunday` window without ambiguity if a reply is received after midnight.
It also identifies the intended report when the same user follows several
municipalities. For an immediate subscription report, the quick reply is still
present, but the backend sends the free-form details immediately because the
incoming FOLLOW has already opened the service window.

The URL button is defined in Meta as:

```text
https://www.scrappy.pt/municipio/{{1}}
```

The API supplies only the canonical slug (`faro`, `alcobaca`, `lourinha`) as the
dynamic suffix. Confirm the final button indexes by reading the approved template
from Meta; the send payload indexes must match it exactly.

The template parameter model should carry the data required by these components,
for example:

```text
LocalityName
LocalitySlug
EventCount
WindowStartDate
WindowEndDate
LogoPath
```

## `scrappy_no_events` (`pt_PT`)

Use this template when the selected window contains no events. Document its exact
header, body parameters and buttons before implementing its sender. It must not
offer a quick reply that promises event details when the selection is empty.

## Client cleanup

Update `WhatsAppClient` so template construction remains there. The processor
chooses which message to send but must not build anonymous Meta JSON payloads.
Keep the existing shared `SendPayloadAsync` transport and error handling.

### Done when
- [ ] Gonçalo has confirmed template names, language, parameter order and indexes
- [ ] `help` is sent for `Help` and `Ajuda`
- [ ] `help` is sent after a created or reactivated subscription
- [ ] `scrappy_weekly_events` contains no event-detail summary parameter
- [ ] Header image resolves from the canonical municipality catalog
- [ ] Generic quick reply carries locality and report window in its payload
- [ ] Dynamic URL button receives only the canonical slug suffix
- [ ] `scrappy_no_events` has an explicit backend contract
- [ ] Meta errors are logged without tokens or full phone numbers

---

# Task A19 — Add municipality agenda URLs and public redirects

Extend `Scrappy/Configuration/municipalities.json` so each canonical municipality
entry contains its logo and official agenda URL:

```json
"faro": {
  "LogoPath": "/municipality-logo/faro.png",
  "AgendaUrl": "https://www.cm-faro.pt/pt/agenda.aspx"
}
```

Add `AgendaUrl` to `MunicipalityCatalogEntry` and return it from
`MunicipalityCatalogItem`. Validate that every configured agenda URL is an absolute
HTTPS URL. Do not accept a destination URL from query parameters or webhook input.

Expose a public endpoint:

```text
GET /municipio/{localitySlug}
```

Behavior:
- normalize and resolve the slug through `MunicipalityCatalog`
- return HTTP 302 to the configured `AgendaUrl`
- return HTTP 404 for an unknown slug
- never behave as an open redirect

Production routing must send `https://www.scrappy.pt/municipio/*` to this endpoint.
The public domain and reverse proxy are deployment concerns; the application route
and catalog remain testable locally.

### Done when
- [ ] Every supported municipality has a validated `AgendaUrl`
- [ ] `/municipio/faro` redirects to Faro's configured agenda
- [ ] `/municipio/alcobaca` redirects to Alcobaça's configured agenda
- [ ] Unknown slugs return 404
- [ ] Arbitrary destination URLs cannot be supplied by the caller

---

# Task A20 — Process quick replies and send free-form event details

Extend the webhook parser and normalized incoming-message model beyond text
messages. Meta template quick replies can arrive as a button message; support the
actual webhook shape returned by the approved template and keep support for text
commands.

Recognize only payloads with this controlled format:

```text
event_report:<canonical-slug>:<yyyy-MM-dd-start>:<yyyy-MM-dd-end>
```

Processing rules:
1. validate the payload shape, canonical slug and both ISO dates
2. validate an allowed `today → Sunday` or `Monday → Sunday` report window in
   `Europe/Lisbon`, never longer than seven calendar days
3. confirm that the WhatsApp user still has an active subscription for that slug
4. query published events for the validated encoded report window
5. send each part returned by `FormatEventDetailParts` through `SendTextAsync`
6. handle an empty or expired selection with a controlled reply

Do not trust the payload as an event query by itself. The active subscription,
canonical catalog and allowed weekly window remain server-side checks.

Update the new/reactivated subscription flow to:

```text
save subscription
    ↓
send help template
    ↓
select events from now through current Sunday
    ↓
send scrappy_weekly_events, or scrappy_no_events when empty
    ↓
send free-form event-detail parts immediately when events exist
```

The incoming FOLLOW already opened the 24-hour customer service window, so the
event-detail messages do not need approval as templates. A duplicate Meta
`MessageId` must still be ignored before any template or text is sent.

### Done when
- [ ] Text commands still parse normally
- [ ] Generic quick reply resolves the correct locality and report window
- [ ] Inactive subscriptions cannot request a weekly report through an old payload
- [ ] Immediate subscription sends help, summary and free-form details in order
- [ ] Free-form details preserve their line breaks
- [ ] Duplicate webhook delivery does not repeat the sequence

---

# Task A21 — Schedule the weekly locality digest

Run one weekly dispatch using a production-capable scheduler or worker. Do not rely
on an uncoordinated in-memory timer inside every API replica.

Flow:
1. load active subscriptions
2. group them by locality so events are queried once per locality
3. select events for the next Monday-through-Sunday window
4. send `scrappy_weekly_events` with the locality/report-window quick-reply
   payload, or
   `scrappy_no_events` when the selection is empty
5. wait for the user's quick reply before sending free-form event details
6. record the template dispatch result

Rules:
- run on Sunday at the configured delivery time in `Europe/Lisbon`
- the report window is the next Monday at 00:00 through Sunday at 23:59:59
- the URL button always uses the canonical slug and public Scrappy redirect
- check that the subscription is still active immediately before sending
- retry transient Meta failures with bounded backoff
- prevent duplicate template delivery with
  `WhatsAppUserId + LocalitySlug + WeekStart`
- one failed recipient must not stop the remaining weekly dispatch
- if a user subscribes on Sunday after that week's dispatch, perform the existing
  immediate subscription flow for the relevant window

The scheduler sends only the approved summary/no-events template. It must not send
the free-form event list until an inbound quick reply opens the service window.

### Done when
- [ ] Weekly run finds all active subscriptions
- [ ] Each user receives summaries only for subscribed localities
- [ ] The same locality is queried once per run
- [ ] Quick-reply payload contains the correct locality and weekly window
- [ ] A retry or repeated scheduler run does not duplicate the weekly template
- [ ] STOPped subscriptions receive no later weekly template

---

# Task A22 — Sprint 2 backend tests

Minimum tests:

## Event selection and formatting
- [ ] Filters by locality, publication status and date window
- [ ] Orders results consistently
- [ ] Free-form formatter preserves the three lines per event
- [ ] Long messages split between complete events
- [ ] Handles a locality with no upcoming events

## Template sending
- [ ] `help` contains the configured name and language
- [ ] Weekly body parameters match the approved order
- [ ] Weekly header contains the correct municipality logo
- [ ] Quick-reply payload contains locality and report-window dates
- [ ] URL button parameter contains only the canonical slug
- [ ] Weekly template contains no event-summary parameter

## Immediate subscription delivery
- [ ] Created/reactivated subscription sends help, summary and event details in order
- [ ] Already-active subscription does not repeat the report
- [ ] Duplicate Meta `MessageId` does not repeat delivery
- [ ] Event or Meta failure does not remove the saved subscription

## Redirects and quick replies
- [ ] Known municipality redirects to its configured HTTPS agenda
- [ ] Unknown municipality returns 404
- [ ] Redirect endpoint cannot be used as an open redirect
- [ ] Valid button payload selects the correct locality and report window
- [ ] Malformed, expired or inactive-subscription payload is rejected safely

## Weekly dispatch
- [ ] Sends only to active subscriptions
- [ ] Supports one user subscribed to multiple localities
- [ ] Prevents duplicate template delivery for the same week
- [ ] Continues after an individual send failure
- [ ] Does not send free-form details before a user reply

---

# Sprint 2 Deliverables

At the end of Sprint 2 you should have:

- [ ] Real upcoming event selection by locality
- [ ] Canonical locality contract available to the frontend
- [ ] Approved `help`, `scrappy_weekly_events` and `scrappy_no_events` contracts
- [ ] Immediate help, summary and free-form event flow after subscription
- [ ] Generic quick reply carrying locality and report-window dates
- [ ] Dynamic municipality website button and safe public redirect
- [ ] Free-form event messages with line breaks and safe splitting
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
