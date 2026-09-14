# Scrappy WhatsApp Integration — Gonçalo Tasks

## Role
**Meta / WhatsApp Platform + Frontend Integration + QA owner**

Your responsibility is everything around:
- Meta Developer setup
- WhatsApp Cloud API configuration
- Test phone environment
- Webhook configuration
- Website → WhatsApp links
- WhatsApp template preparation
- End-to-end testing
- Integration documentation

Adrien owns the Scrappy ASP.NET/MongoDB implementation.

---

## Sprint 1 Goal

Enable this development flow:

```text
Locality website
      ↓
[Seguir no WhatsApp]
      ↓
Meta test WhatsApp number
      ↓
Pre-filled command

SCRAPPY FOLLOW alcobaca

      ↓
Meta webhook
      ↓
Scrappy API
      ↓
Confirmation arrives in WhatsApp
```

For development, Alcobaça, Faro and Lourinhã all use the **same Meta test number**.

The locality is temporarily represented by the pre-filled message.

---

# Task G1 — Create / configure Meta Developer app

Create the Meta application for Scrappy.

Enable the WhatsApp Business / Cloud API product.

Collect:

```text
WABA ID
Phone Number ID
Test Phone Number
Access Token
Graph API Version
```

### Important
Do not commit credentials to Git.

### Deliver to Adrien
- WABA ID
- Phone Number ID
- Access Token
- Graph API version

### Done when
- [ ] Meta app exists
- [ ] WhatsApp product enabled
- [ ] Test number available
- [ ] Required IDs recorded securely

---

# Task G2 — Configure test recipient

Add the personal WhatsApp number that will be used for development/testing.

Use Meta's test-number flow.

### Done when
- [ ] Test recipient is verified
- [ ] Recipient can receive test messages

---

# Task G3 — Send Meta's test message

Before involving Scrappy, send Meta's standard test message.

Expected result:

```text
Meta
  ↓
WhatsApp
  ↓
Hello World
```

### Checkpoint
If this fails, fix Meta configuration before continuing.

- [ ] `hello_world` test message received successfully

---

# Task G4 — Receive webhook details from Adrien

Adrien provides:

```text
Webhook Callback URL
Verify Token
```

Example:

```text
https://<dev-tunnel>/webhooks/whatsapp
```

You configure these in Meta.

### Done when
- [ ] Callback URL entered
- [ ] Verify Token entered
- [ ] Meta verification succeeds

---

# Task G5 — Configure webhook subscriptions

Ensure the Meta app / WABA is subscribed to the WhatsApp webhook events required for inbound messages.

At minimum:

```text
messages
```

### Done when
- [ ] Incoming text messages generate webhook events
- [ ] Adrien confirms payload arrives in ASP.NET

---

# Shared Checkpoint A — Incoming message reaches Scrappy

Send:

```text
hello scrappy
```

to the test WhatsApp number.

Adrien should see the incoming webhook.

### Done when
- [ ] Message leaves WhatsApp
- [ ] Meta receives it
- [ ] Meta calls Scrappy webhook
- [ ] Scrappy logs the message

---

# Task G6 — Design locality WhatsApp link convention

For development use:

```text
Alcobaça:
SCRAPPY FOLLOW alcobaca

Faro:
SCRAPPY FOLLOW faro

Lourinhã:
SCRAPPY FOLLOW lourinha
```

Keep slugs aligned with Scrappy's locality identifiers.

Do not invent a second naming system.

### Done when
- [ ] Confirmed locality slugs with Adrien
- [ ] Alcobaça command defined
- [ ] Faro command defined
- [ ] Lourinhã command defined

---

# Task G7 — Add WhatsApp follow CTA to locality website

Each locality page needs a CTA similar to:

```text
Receba os eventos desta localidade no WhatsApp.

[ Seguir no WhatsApp ]
```

For DEV the button must:
1. Open the Meta test WhatsApp number
2. Pre-fill the correct locality command

Example:

```text
/alcobaca
→ SCRAPPY FOLLOW alcobaca
```

```text
/faro
→ SCRAPPY FOLLOW faro
```

```text
/lourinha
→ SCRAPPY FOLLOW lourinha
```

### Done when
- [ ] Alcobaça button works
- [ ] Faro button works
- [ ] Lourinhã button works
- [ ] Correct text is pre-filled

---

# Task G8 — Add clear subscription UX

The website should explain:

```text
Receba uma seleção dos eventos de Alcobaça diretamente no WhatsApp.
```

Avoid wording about:
- kilometres
- radius
- GPS
- nearby location detection

The context is the locality page itself.

### Done when
- [ ] CTA copy matches locality-based model
- [ ] User understands what they are subscribing to

---

# Task G9 — Prepare unsubscribe UX

Add a simple explanation wherever appropriate:

```text
Pode deixar de seguir esta localidade a qualquer momento.
```

For DEV the command is:

```text
SCRAPPY STOP alcobaca
```

Equivalent for the other localities.

You do not implement backend STOP logic; Adrien does.

### Done when
- [ ] STOP command convention agreed
- [ ] UI/help text prepared if needed

---

# Task G10 — Test website → WhatsApp deep-link flow

Test on:
- Desktop browser with WhatsApp Web
- Mobile browser with WhatsApp installed, if available

Check:
- correct number opens
- correct pre-filled command
- accented locality display does not break slug
- URL encoding works correctly

### Done when
- [ ] Desktop tested
- [ ] Mobile tested
- [ ] No malformed pre-filled messages

---

# Task G11 — Prepare weekly-report template draft

The actual weekly scheduler is NOT Sprint 1, but start preparing the WhatsApp template because proactive weekly messages will require approved template messaging.

Draft a template structure such as:

```text
📅 Esta semana em {{1}}

Encontrámos {{2}} eventos para os próximos dias.

🔥 Em destaque:
{{3}}

Ver todos os eventos:
{{4}}
```

Do NOT hard-code final wording yet.

The purpose is to:
- understand template constraints
- prepare variable structure
- identify what Adrien's backend will need to provide

### Deliver to Adrien

Document expected variables:

```text
{{1}} LocalityName
{{2}} EventCount
{{3}} HighlightSummary
{{4}} LocalityEventsUrl
```

### Done when
- [ ] Draft template exists
- [ ] Variables documented
- [ ] No backend implementation required yet

---

# Task G12 — Prepare production number strategy document

For DEV:

```text
1 test number
→ all localities simulated
```

For production:

```text
1 WhatsApp number
→ 1 locality chat
```

Document:

```text
PhoneNumberId
DisplayPhoneNumber
LocalitySlug
LocalityName
Enabled
Environment
```

Example:

```text
111 → Alcobaça
222 → Faro
333 → Lourinhã
```

Do not buy/register many numbers yet.

### Done when
- [ ] Production mapping approach documented
- [ ] No assumption that DEV requires many numbers

---

# Task G13 — End-to-end QA

Once Adrien finishes backend integration, test the full flow.

## Alcobaça

```text
Open Alcobaça page
↓
Click Seguir no WhatsApp
↓
Send SCRAPPY FOLLOW alcobaca
↓
Receive confirmation
```

## Faro

Repeat for Faro.

## Multiple subscriptions

The same user should be able to follow:

```text
Alcobaça
+
Faro
```

## Unsubscribe

Send:

```text
SCRAPPY STOP alcobaca
```

Then verify with Adrien:

```text
Alcobaça → inactive
Faro → still active
```

### Done when
- [ ] Alcobaça subscribe works
- [ ] Faro subscribe works
- [ ] Multiple locality subscriptions work
- [ ] STOP affects only requested locality

---

# Task G14 — Document Meta setup

Create a short internal setup note containing:

```text
Meta App name
WABA used
Test phone configuration
Where webhook is configured
Webhook fields subscribed
Which IDs are needed
How to refresh/replace dev token
How to add a test recipient
```

Never place actual tokens in the document.

This will save time if another developer needs to reproduce the setup.

### Done when
- [ ] Setup documented
- [ ] No secrets included

---

# Task G15 — Report integration bugs clearly

When something fails, identify which layer failed:

```text
Website
WhatsApp client
Meta
Webhook
Scrappy API
MongoDB
Outgoing Meta API
WhatsApp delivery
```

Example bug report:

```text
Faro FOLLOW test

Website deep link: OK
WhatsApp opened: OK
Message sent: OK
Meta webhook: OK
Scrappy returned: 500
Response not received

Payload timestamp: ...
```

This avoids vague reports like:

```text
"WhatsApp isn't working."
```

---

# Sprint 2 Goal — Deliver real locality events

Sprint 2 extends the Sprint 1 subscription flow with real event delivery:

```text
New or reactivated FOLLOW
        ↓
Real upcoming events for the subscribed locality
        ↓
Immediate WhatsApp message
```

```text
Weekly scheduled run
        ↓
Approved WhatsApp template
        ↓
Locality event digest
```

Adrien owns the event query, message sending and scheduler implementation. Gonçalo
owns the Meta template, the public event-link contract and the end-to-end validation
of the real-data flow.

---

# Task G16 — Finalize and submit the weekly WhatsApp template

Turn the draft from G11 into the approved Meta template that Adrien can send from
the weekly dispatcher.

The final contract must define:

```text
Template name
Language
Variable order
Variable meaning
```

Keep the variables aligned with the backend:

```text
{{1}} LocalityName
{{2}} EventCount
{{3}} HighlightSummary
{{4}} LocalityEventsUrl
```

Submit the template through Meta, record the exact approved name and language, and
deliver those values to Adrien. Do not put credentials in the documentation.

### Done when
- [ ] Template wording is finalized
- [ ] Template is submitted and approved by Meta
- [ ] Name, language and variable order are documented
- [ ] Approved template details are delivered to Adrien

---

# Task G17 — Define the public locality-events link contract

For every canonical `LocalitySlug` supported by Scrappy, define the public URL that
will be used in the immediate reply and in the weekly template.

Document:

```text
LocalitySlug → public locality/events URL
```

The link must open the published events for the same locality and must not expose
unpublished events. Keep the slug convention shared with Adrien; do not create a
second list of locality names in the frontend.

### Done when
- [ ] Public URL pattern is agreed with Adrien
- [ ] Locality slug-to-URL mapping is documented or generated
- [ ] Links for the initial localities open the correct event list
- [ ] Event URL is available as the `LocalityEventsUrl` template variable

---

# Task G18 — Define the real-event message contract

Coordinate with Adrien on the fields shown in WhatsApp for the immediate message
and the weekly digest:

```text
Event title
Start date/time
Place
Public event URL
```

Agree the Portuguese wording for:
- a locality with upcoming events
- a locality with no upcoming published events
- an event whose place or URL is unavailable

The presentation must match Adrien's deterministic chronological selection and must
not imply radius, GPS or nearby-event detection.

### Done when
- [ ] Immediate-message fields and formatting are agreed
- [ ] Weekly-template variables match the backend output
- [ ] No-events wording is agreed
- [ ] Missing optional event fields have a defined fallback

---

# Task G19 — Agree weekly delivery configuration

Before Adrien implements the dispatcher, provide the operational values for:

```text
Delivery day
Delivery time
Timezone: Europe/Lisbon
Maximum events per digest
Approved template name
Approved template language
```

Document the values in the integration setup note. The scheduler must use the
approved template outside the normal customer-service window.

### Done when
- [ ] Delivery day and time are agreed
- [ ] `Europe/Lisbon` is recorded as the timezone
- [ ] Event limit and template configuration are delivered to Adrien
- [ ] No scheduler configuration is hard-coded only in the frontend

---

# Task G20 — QA immediate real-event delivery

After Adrien connects the subscription flow to the real event query, test:

```text
New FOLLOW
→ subscription saved
→ correct locality events received immediately
```

Also verify:
- reactivated subscriptions receive the current event selection
- an empty locality produces the agreed controlled message
- only published upcoming events are shown
- events are ordered chronologically and respect the configured limit
- a duplicate `FOLLOW` or Meta webhook re-delivery does not send the list twice
- an event-query or outgoing Meta failure does not remove the saved subscription

### Done when
- [ ] New subscription receives real events for the correct locality
- [ ] Reactivation receives the current event selection
- [ ] No-events case is correct
- [ ] Duplicate delivery is not repeated
- [ ] Failure handling is confirmed with Adrien

---

# Task G21 — QA the weekly locality digest

Test the scheduled flow with representative subscriptions and real event data.

Minimum scenarios:

```text
Active subscription → receives the digest
STOPped subscription → receives nothing
One user + two localities → receives the correct events for each locality
Repeated weekly run → does not duplicate the same digest
One failed recipient → remaining recipients are still processed
```

Check that the approved template renders the locality, event summary and public
link correctly in WhatsApp Web and on mobile.

### Done when
- [ ] Only active subscriptions receive weekly messages
- [ ] Multiple localities remain independent
- [ ] Same-week duplicate delivery is prevented
- [ ] One recipient failure does not stop the run
- [ ] Template renders correctly on desktop and mobile

---

# Task G22 — Update integration documentation for Sprint 2

Extend the Meta setup note with:

```text
Approved template name and language
Template variables
Weekly delivery day/time and timezone
Public locality-events URL convention
Test data and QA scenarios
Known production prerequisites
```

Never include access tokens, app secrets or personal phone numbers. Record any
remaining dependency on Adrien's scheduler, event query or Meta client explicitly.

### Done when
- [ ] Sprint 2 setup is reproducible by another developer
- [ ] Template and delivery configuration are documented
- [ ] QA evidence and known limitations are recorded
- [ ] No secrets are included

---

# Not in Sprint 2

Do NOT build yet:

- AI recommendations
- Personalized/event digest ranking
- Radius or GPS-based subscriptions
- One real WhatsApp number per locality
- Production `PhoneNumberId → locality` resolver
- Mass onboarding of Portuguese municipalities

---

# Gonçalo Deliverables

At the end of Sprint 1 you should have:

- [ ] Meta Developer app configured
- [ ] WhatsApp Cloud API enabled
- [ ] Test number working
- [ ] Test recipient working
- [ ] `hello_world` delivered
- [ ] Webhook verified
- [ ] `messages` webhook active
- [ ] Alcobaça WhatsApp CTA
- [ ] Faro WhatsApp CTA
- [ ] Lourinhã WhatsApp CTA
- [ ] Prefilled commands working
- [ ] Desktop/mobile deep-link QA
- [ ] Weekly template draft
- [ ] Production phone-number mapping note
- [ ] Meta integration documentation
- [ ] End-to-end QA completed with Adrien

---

# Gonçalo Sprint 2 Deliverables

At the end of Sprint 2 you should have:

- [ ] Approved weekly WhatsApp template
- [ ] Template name, language and variables shared with Adrien
- [ ] Public locality-events URL convention
- [ ] Real-event message and no-events wording agreed
- [ ] Weekly delivery day, time and timezone configured
- [ ] Immediate real-event delivery QA completed
- [ ] Weekly digest QA completed
- [ ] Duplicate, STOP and failure scenarios verified
- [ ] Sprint 2 Meta/integration documentation updated
