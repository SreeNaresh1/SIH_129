# JanSetu / MahaSetu: Federated Interoperability Middleware Specification
## Architecture, Technical Modules, and Live Demonstration Guide for SIH 2026 (Problem Statement ID: 26129)

> **Key Architectural Thesis:**  
> **"Build a federated interoperability middleware, NOT another portal."**  
> Departmental databases and legacy workflow systems stay where they are and connect via non-invasive adapters. This mirrors battle-tested global and national paradigms: **Estonia's X-Road**, **India's API Setu**, **DEPA 2.0 (Account Aggregator consent model)**, **DigiLocker**, and **Meri Pehchaan (National SSO)**.

---

## 🏛️ 1. Why Federated Middleware Beats "Another Portal"

| Dimension | The "New Portal" Anti-Pattern (Fails in Practice) | JanSetu Federated Middleware (Winning Architecture) |
|---|---|---|
| **Data Custody** | Attempts to migrate or duplicate departmental databases into a mega-database. | **Zero Data Centralization.** Systems stay where they are. Data is fetched at point-of-need via signed adapters. |
| **Legacy Compatibility** | Requires older departments (Revenue, Treasury, Cadastral) to rewrite their backends. | **Non-Invasive Adapters.** Wraps legacy SOAP/XML, CSV drops, and SQL views into IndEA v2.0 JSON-LD via declarative YAML configs. |
| **Citizen Experience** | Citizen must re-upload the same income/caste certificates for every single scheme. | **Single-Window + DEPA 2.0 Consent.** 1-click purpose-bound authorization fetches verified credentials with **zero re-upload**. |
| **Fraud & Duplication** | Isolated portals cannot detect a resident claiming benefits from two different schemes. | **Canonical MDM & Entity Resolution.** Cross-system fuzzy matching detects duplicates and blocks fraudulent disbursements. |
| **Failure Handling** | Broken connection drops application silently; files get lost indefinitely. | **Circuit Breakers & Dead-Letter Queue (DLQ).** Automated retries, SLA breach countdowns, and escalation alerts to nodal officers. |
| **Auditability** | Proprietary, alterable server logs. | **Cryptographic SHA-256 Hash Chain.** Tamper-evident ledger linking every fetch to its consent artifact. |

---

## ⚙️ 2. Core Modules Architecture (All 10 Requirements Covered)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      UNIFIED RESIDENT & OFFICIAL SURFACE                               │
│  - Single Window Resident Portal (Meri Pehchaan SSO • Universal Tracking ID)           │
│  - Official Governance Dashboard (SLA Heatmaps • Natural Language Ops Intelligence)    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        JANSETU FEDERATED MIDDLEWARE CORE                               │
│                                                                                        │
│  ┌─────────────────────────┐  ┌──────────────────────────┐  ┌───────────────────────┐  │
│  │   API Gateway & Auth    │  │     Consent Manager      │  │  Canonical MDM & Dedup│  │
│  │ Rate Limiting • OpenAPI │  │ DEPA 2.0 • Purpose-Bound │  │ Jaro-Winkler • Golden │  │
│  └────────────┬────────────┘  └────────────┬─────────────┘  └───────────┬───────────┘  │
│               │                            │                            │              │
│  ┌────────────┴────────────┐  ┌────────────┴─────────────┐  ┌───────────┴───────────┐  │
│  │   Workflow Orchestrator │  │     Event Bus (Pub/Sub)  │  │   Governance & DLQ    │  │
│  │ Multi-Agency Fan-Out    │  │ Kafka/Redis • Mock Notifs│  │ SHA-256 Chain • Retry │  │
│  └────────────┬────────────┘  └────────────┬─────────────┘  └───────────┬───────────┘  │
└───────────────┼────────────────────────────┼────────────────────────────┼──────────────┘
                │                            │                            │
                ▼                            ▼                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     DECLARATIVE ADAPTER SDK (CONFIG, NOT CODE)                         │
│                                                                                        │
│  ┌────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │   Legacy SOAP Adapter  │  │  Modern REST Adapter    │  │ CSV Batch / SFTP Drop   │  │
│  │ XML Envelope ➔ JSON-LD │  │ OpenAPI 3.0 Bi-dir      │  │ Direct PFMS Bank Drop   │  │
│  │ Revenue Dept (Income)  │  │ Social Welfare (Caste)  │  │ Core Banking DBT Mandate│  │
│  └────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Layer Specifications:
1. **Connector SDK / Adapters:**
   - Supports 4 distinct protocols: **SOAP/XML**, **REST/JSON**, **CSV/SFTP drops**, and **Direct DB Read-Only SQL Views**.
   - Mappings are declared via **YAML / JSON configurations**, not hardcoded logic.
2. **API Gateway & Service Registry:**
   - Gateway enforces authentication (JWT/OAuth2), schema validation, and SLA health tracking for each registered departmental endpoint.
3. **Canonical Data Model & MDM (Master Data Management):**
   - Canonical models: `Person`, `Application`, `Service`, `Document`, `Grievance`.
   - Fuzzy entity resolution: Jaro-Winkler name similarity, DOB verification, and tokenized Aadhaar hash comparison.
   - Outputs a unified **Golden Record** with cross-system IDs (`mahaswayamId`, `mahadbtId`, `aapleSarkarId`, `digiLockerId`).
   - Borderline matches (65%–85%) route to an interactive **Manual Review Queue**.
4. **Consent Manager (DEPA 2.0 / Account Aggregator):**
   - Citizen grants time-limited, purpose-bound authorization ("MahaDBT may fetch my Income Certificate from Revenue Dept for 24h").
   - Every fetch validates the signed consent artifact hash.
5. **SSO / Federated Identity:**
   - Simulates Meri Pehchaan / Keycloak OIDC Hub with 1-click citizen authentication.
6. **Workflow Orchestrator:**
   - Coordinates multi-agency pipelines (e.g., Intake ➔ Revenue Verification ➔ Social Welfare Scrutiny ➔ Treasury Disbursement) with automated SLA timers.
7. **Event Bus (Pub/Sub):**
   - In-memory event bus broadcasting events: `application.submitted`, `consent.granted`, `adapters.fanned_out`, `sla.breached`, `application.approved`.
   - Dispatches simulated SMS, WhatsApp, and email alerts.
8. **Unified Application Tracker:**
   - Single tracking ID (`JANSETU-xxxx` / `MH-FED-xxxx`) displaying real-time status across all participating departments on one timeline.
9. **Governance Layer & Dead-Letter Queue (DLQ):**
   - Cryptographic hash-chained audit log (`previousHash` ➔ `currentHash`).
   - Dead-Letter Queue catches timeouts/errors, initiates automated exponential retry, and fires SLA escalations.
10. **Official & Ops Dashboards:**
    - State-level bottleneck heatmaps, connector latency diagnostics, and Before-vs-After benchmark analytics.

---

## 🎬 3. The Winning Demo Story (What to Actually Demo for Judges)

### Vertical Slice: Unified Post-Matric Technical Scholarship & Apprenticeship Stipend

### The 3 Deliberately Diverse Simulated Department Systems:
1. **Legacy SOAP/XML:** Revenue Department (Tahsildar Portal) returning messy XML with non-standard tags (`<Inc_Amt_Rs>`, `<Applicant_Name_Eng>`, `<Tahsildar_Sign_Dt>`).
2. **Modern REST API:** Social Welfare Department returning OpenAPI JSON (`/api/v1/caste-certificates/verify`).
3. **CSV Batch SFTP Drop:** Public Financial Management System (PFMS) & Core Banking returning delimited account mandates (`Account_No,IFSC_Code,Beneficiary_Name,NPCI_Aadhaar_Linked`).

### Step-by-Step Demo Walkthrough Script:

1. **Step 1: Resident SSO Login**  
   - Citizen logs in once via simulated **Meri Pehchaan / Keycloak SSO**. No need to register separate accounts for each department.
2. **Step 2: Purpose-Bound DEPA Consent Grant**  
   - Citizen clicks *"Apply with DigiLocker Zero-Upload"*.  
   - JanSetu generates a signed DEPA 2.0 consent artifact authorizing cross-agency data fetching for 24 hours. **Zero repeated document uploads.**
3. **Step 3: Multi-Department Concurrent Fan-Out**  
   - JanSetu concurrently dispatches requests through the 3 distinct adapters:
     - Revenue SOAP XML is parsed and transformed into `CanonicalDocument.IncomeCertificate`.
     - Social Welfare REST is validated into `CanonicalDocument.CasteCertificate`.
     - Banking CSV drop is parsed into `CanonicalPerson.BankMandate`.
4. **Step 4: Live Failure & SLA Breach Injection (The Wow Factor)**  
   - Check the **"⚡ Inject Failure / SLA Breach"** box and click Run.
   - The Revenue SOAP adapter simulates a **504 Gateway Timeout (3,200ms latency spike)**.
   - Show judges how the system handles the failure:
     - The transaction is not lost; it routes to the **Dead-Letter Queue (DLQ)** with attempt counter `1/3`.
     - An automated **SLA Escalation Alert** is dispatched to the District Nodal Officer & Tahsildar.
     - The incident is appended to the **Immutable SHA-256 Hash Chain**.
5. **Step 5: Official Dashboard & Before-vs-After Benchmark**  
   - Toggle to the **Measurable Impact Benchmark**:
     - Physical visits: **4 visits ➔ 0 visits (100% reduction)**.
     - Document re-uploads: **3 submissions ➔ 0 submissions**.
     - Processing time: **18 days ➔ 45 seconds (99.8% reduction)**.
     - Duplicates blocked: **342 claims blocked (₹1.84 Cr welfare funds saved)**.

---

## 💡 4. High-Impact Technical Differentiators

1. **AI-Assisted Declarative Schema Mapper:**
   - Administrators paste raw XML/JSON from any newly onboarded state department.
   - Semantic deduction infers field meanings and generates a deployable **YAML Declarative Connector Adapter** in seconds.
2. **Natural Language Query Command Center:**
   - State secretaries can ask: *"Show SLA breaches in Pune last 24h"*, *"Which connector has latency > 40ms?"*, or *"What is the duplicate suppression rate this week?"* and receive real-time structured tables, metric highlights, and administrative action advice.
3. **Tamper-Evident SHA-256 Hash Chain:**
   - Real-time cryptographic chain integrity verification button that mathematically proves zero ledger tampering.
