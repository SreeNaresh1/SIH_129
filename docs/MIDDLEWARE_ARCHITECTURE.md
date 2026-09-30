# MahaSetu — What This Actually Is: A Middleware, Not a Portal

## The Core Architectural Truth (PS 26129)

> **The problem does NOT ask for another citizen portal.**  
> It asks for a **middleware layer** that enables existing portals to talk to each other.

---

## The Correct Mental Model

```
BEFORE MahaSetu (the problem):

  Citizen             MahaSwayam         MahaDBT          Aaple Sarkar
    │                    │                  │                  │
    ├── uploads docs ──> │                  │                  │
    ├── uploads docs ──────────────────── > │                  │
    ├── uploads docs ──────────────────────────────────────── > │
    │
    (Same documents submitted 3 times. No portal knows what the other did.)


AFTER MahaSetu (the solution — middleware in the middle):

  Citizen       MahaSwayam    ←──────────────────────────────────────────────┐
    │              │                                                           │
    │              │ API call  ┌──────────────────────────────────────────┐   │
    └─ 1 request → │ ─────────> │          MAHASETU MIDDLEWARE             │   │
                               │                                          │   │
                               │  ┌─────────────┐  ┌──────────────────┐  │   │
                               │  │ IndEA Schema│  │  MDM Golden      │  │   │
                               │  │ Translator  │  │  Record Engine   │  │   │
                               │  └─────────────┘  └──────────────────┘  │   │
                               │  ┌─────────────┐  ┌──────────────────┐  │   │
                               │  │ DEPA 2.0    │  │  Data Quality    │  │   │
                               │  │ Consent Hub │  │  Layer (99.2%)   │  │   │
                               │  └─────────────┘  └──────────────────┘  │   │
                               │  ┌─────────────┐  ┌──────────────────┐  │   │
                               │  │ Workflow    │  │  DLQ & Exception │  │   │
                               │  │ Orchestrator│  │  Handler         │  │   │
                               │  └─────────────┘  └──────────────────┘  │   │
                               │  ┌─────────────┐  ┌──────────────────┐  │   │
                               │  │ Audit Chain │  │  Event Bus       │  │   │
                               │  │ SHA-256     │  │  (Pub/Sub)       │  │   │
                               │  └─────────────┘  └──────────────────┘  │   │
                               └──────────────────────────────────────────┘   │
                                              │                │               │
                                          MahaDBT       Aaple Sarkar ──────────┘
                                      (auto-fetched)   (auto-notified)

    Citizen submits once. MahaSetu handles all inter-portal communication.
```

---

## What Each Code Layer Actually IS

### Layer 1: The Middleware Engine (THE product — `server/`)

This is the actual middleware that PS 26129 asks for:

| File / Module | Middleware Role |
|---|---|
| `routes/interop.js` | **API Gateway** — the entry point for all inter-agency exchanges |
| `services/declarativeAdapterEngine.js` | **Protocol Adapter** — SOAP/XML ↔ REST/JSON ↔ CSV ↔ IndEA JSON-LD |
| `services/mdmEntityResolution.js` | **MDM Engine** — resolves citizen identity across all portals into a Golden Record |
| `services/dlqService.js` | **Exception Handler** — Dead-Letter Queue, retry, SLA breach escalation |
| `services/eventBus.js` | **Event Bus** — pub/sub notifications (`application.submitted`, `sla.breached`) |
| `services/duplicateEngine.js` | **Fraud Prevention** — cross-portal deduplication |
| `services/declarativeAdapterEngine.js` | **Data Quality Layer** — schema conformance, field validation, completeness scoring |
| `models/PortalConnector.js` | **Connector Registry** — registered departmental system endpoints |
| `models/ConsentRecord.js` | **Consent Store** — DEPA 2.0 signed consent artifacts |
| `models/DataExchangeLog.js` | **Audit Log** — tamper-evident SHA-256 chained exchange records |
| `models/WorkflowPipeline.js` | **Orchestrator State** — configurable multi-agency pipeline definitions |

### Layer 2: The Management / Monitoring UI (`frontend/src/pages/admin/`)

This is the **Operations Console** that any state government operator would use to monitor the middleware:

| Component | Role |
|---|---|
| `InterOpHub.jsx` | **Interoperability Studio** — live connector topology, API exchange inspector, schema mapper, MDM console, DLQ panel, NL query |
| `AdminDashboard.jsx` | **Governance Dashboard** — 360° beneficiary view, SLA compliance monitor, 36-district heatmap |

### Layer 3: The Reference Consumer Demo (`frontend/src/pages/citizen/`)

> **Important:** These citizen-facing pages are NOT the product. They are a **thin demo client** showing how any existing state portal (MahaSwayam, Aaple Sarkar, etc.) would consume the middleware APIs.

In a real deployment:
- MahaSwayam's existing portal would call `/api/interop/...` directly
- Aaple Sarkar's existing portal would subscribe to the event bus
- Citizens would still use their current portals — those portals would be connected to MahaSetu in the background

The `ReportProblem.jsx` / `CitizenDashboard.jsx` pages exist for the hackathon demo to show evaluators **what the end-to-end experience looks like** without requiring them to actually have MahaSwayam running.

---

## How to Explain This to Evaluators

**Wrong framing (avoid):**
> "We built a new citizen portal that connects to MahaSwayam and MahaDBT."

**Correct framing (use this):**
> "MahaSetu is a middleware layer. Existing portals — MahaSwayam, MahaDBT, Aaple Sarkar — remain completely unchanged. MahaSetu exposes a set of standardized APIs (`/api/interop/...`) that any portal can call to exchange data, resolve citizen identity via MDM, trigger multi-agency workflows, and receive event notifications. The citizen-facing demo client simulates how any consuming portal would interact with the middleware."

---

## The API Surface IS the Middleware

The following REST API endpoints ARE the middleware product:

```
# Connector Management
GET    /api/interop/connectors              → List all registered departmental connectors
POST   /api/interop/connectors/test/:id    → Live ping & latency test for any connector

# Schema Translation (Data Quality + IndEA)
POST   /api/interop/simulate-exchange      → Transform legacy SOAP/XML → IndEA v2.0 JSON-LD
POST   /api/interop/fan-out                → Multi-department concurrent fetch (Revenue + Welfare + Banking)

# MDM — Master Data Management
GET    /api/interop/mdm/golden-records     → All canonical citizen Golden Records
POST   /api/interop/mdm/resolve            → Resolve incoming person → Golden Record (auto-merge or queue)
GET    /api/interop/mdm/review-queue       → Borderline matches pending officer decision
POST   /api/interop/mdm/review/:id         → Officer MERGE or REJECT decision

# Consent (DEPA 2.0)
POST   /api/interop/consent/grant          → Issue signed DEPA 2.0 consent token
GET    /api/interop/consent/records        → All consent artifacts

# Audit & Exchange Logs
GET    /api/interop/exchange-logs          → Tamper-evident SHA-256 audit chain
GET    /api/interop/metrics                → Statewide interoperability KPIs

# Tracking
GET    /api/interop/tracking/:id           → Universal multi-department status by tracking ID

# DLQ & Exception Handling
GET    /api/interop/dlq                    → Dead-Letter Queue items
POST   /api/interop/dlq/inject             → Inject failure for demo (shows DLQ capturing it)
POST   /api/interop/dlq/retry/:id          → Trigger manual retry for a DLQ item

# Event Bus (Pub/Sub Notifications)
GET    /api/interop/events                 → Event stream (application.submitted, sla.breached, etc.)

# Master Data Lookup
GET    /api/interop/master-data/lookup     → DEPA consent-based resident record fetch
```

**This API surface is the deliverable.** Any state portal can integrate with it.

---

## What This Means for the Demo

When demoing to evaluators, the sequence should be:

1. **Show the middleware API directly** → Open `http://localhost:5000` → show the JSON response confirming it's an interoperability engine.
2. **Show the Interoperability Studio** → `/admin/interop` → this is the middleware management console.
3. **Show the API exchange** → trigger `/api/interop/simulate-exchange` → show legacy XML being translated to IndEA JSON-LD.
4. **Show MDM** → `/api/interop/mdm/resolve` → show citizen being resolved into a Golden Record.
5. **Show DLQ** → inject a SOAP failure → show it captured in DLQ, retried, SHA-256 logged.
6. **Show the citizen demo client** → explain: "This simulates how MahaSwayam's existing portal would call our middleware APIs. The citizen experience stays on MahaSwayam; MahaSetu works in the background."

---

## Evaluator Litmus Test

If an evaluator asks: *"Is this a new portal?"*

Answer: **"No. MahaSetu is a middleware layer. Run `curl http://localhost:5000/api/interop/connectors` — that API endpoint IS the product. MahaSwayam, MahaDBT, and Aaple Sarkar would call these APIs. We've built a demo client to simulate those calls so you can see the end-to-end flow without needing the actual state portals running."**
