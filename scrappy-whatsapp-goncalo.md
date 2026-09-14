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

# Not in Sprint 1

Do NOT build yet:

- Weekly scheduler
- BullMQ jobs
- AI recommendations
- Event digest ranking
- Real number per locality
- Production template sending logic
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
