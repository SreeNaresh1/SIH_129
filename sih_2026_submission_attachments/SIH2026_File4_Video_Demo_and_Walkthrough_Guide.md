# SMART INDIA HACKATHON 2026 — DEMO VIDEO WALKTHROUGH & EVALUATION PROTOCOL
## Video Demonstration Script & Evaluator Replication Protocol
### Solution for Problem Statement ID: 26129 — Government of Maharashtra (MSInS)

---

## 1. Demo Video Overview & Access Links

This document provides the time-stamped video walkthrough and live replication steps for the SIH 2026 Evaluation Committee to verify all components of the **MahaSetu Interoperability Framework**.

- **Recommended Demo Video Length:** 3 Minutes 30 Seconds
- **Core Pitch Angle:** Non-invasive integration of fragmented Maharashtra portals (MahaSwayam, MahaDBT, Aaple Sarkar) with IndEA v2.0 standards, DEPA 2.0 consent data sharing, and cross-portal duplicate suppression.

---

## 2. Pre-Seeded Evaluator Accounts (Instant Login)

All stakeholder roles are pre-seeded in the database for instant evaluation:

| Role | Email Address | Password | Primary Portal URL | Key Features to Test |
|---|---|---|---|---|
| **🏛️ State InterOp Admin** | `government@sihportal.com` | `Government@123` | `http://localhost:5173/admin/interop` | **MahaSetu Studio**, Connector Topology, Live API Exchange Stream, Schema Translator |
| **👤 Citizen Beneficiary** | `citizen@sihportal.com` | `Citizen@123` | `http://localhost:5173/citizen/report` | **Single-Window Portal**, DEPA Consent Master Auto-Fill, Universal Tracking (`MH-2026-APP-8841`) |
| **🎓 MSInS University Lead** | `university@sihportal.com` | `University@123` | `http://localhost:5173/university` | COEP / VJTI R&D Hub, Student Teaming, Prototype Testing & Patent Tracking |
| **🏢 Corporate Industry CSR** | `industry@sihportal.com` | `Industry@123` | `http://localhost:5173/industry` | Tata Motors & Forbes Marshall CSR Co-Funding Matching, Pilot Handover |

---

## 3. Time-Stamped Walkthrough Script (3:30 Video Demonstration)

```
00:00 - 00:35 | ACT 1: THE MAHARASHTRA FRAGMENTATION CRISIS (PROBLEM STATEMENT 26129)
--------------------------------------------------------------------------------------------------
- Narrator: "Welcome to MahaSetu, solving SIH Problem Statement 26129 for the Government of Maharashtra."
- Visual: Displaying Maharashtra's fragmented portal landscape (MahaSwayam, MahaDBT, Aaple Sarkar, DigiLocker).
- Problem: Citizens forced to re-upload documents 4–6 times; officials blind to cross-portal duplicate claims;
  complete system replacement is impossible.
- Solution Introduction: "MahaSetu delivers a non-invasive federated middleware layer compliant with IndEA v2.0."

00:35 - 01:25 | ACT 2: CITIZEN SINGLE-WINDOW & 1-CLICK DEPA 2.0 CONSENT LOCKER
--------------------------------------------------------------------------------------------------
- Screen: Login as citizen@sihportal.com. Open "Report a Problem / Request Service".
- Innovation Showcase: Citizen clicks "⚡ Fetch from DigiLocker (DEPA 2.0 Consent)".
  * In 1 click, verified name, Aadhaar token, caste certificate (CC-MH-2023-884129), and ITI qualifications
    auto-populate into the form. Zero duplicate file uploads!
  * Citizen submits application for Pune Apprenticeship Incentive.
  * System assigns universal cross-department tracking ID: MH-2026-APP-8841.

01:25 - 02:15 | ACT 3: MAHASETU INTEROPERABILITY STUDIO & LIVE API GATEWAY
--------------------------------------------------------------------------------------------------
- Screen: Login as government@sihportal.com. Navigate to "⚡ InterOp Studio (PS 26129)".
- Visual 1: Connector Topology Grid showing all 6 live connected systems (MahaSwayam, MahaDBT, Aaple Sarkar,
  DigiLocker, DHE, MahaRERA) with 100% health and active ping latencies (28ms).
- Visual 2: Live API Exchange Stream showing legacy XML/SOAP payloads dynamically translated to
  IndEA v2.0 JSON-LD with verifiable SHA-256 cryptographic audit digests.
- Visual 3: Evaluator triggers "⚡ Execute Exchange" simulator to test real-time schema transformation.

02:15 - 02:50 | ACT 4: CROSS-PORTAL AI DEDUPLICATION & FRAUD SUPPRESSION
--------------------------------------------------------------------------------------------------
- Screen: Admin inspects duplicate detection filter in Dashboard.
- Innovation Showcase: Show test challenge MH-FED-2026-SKILL-008 submitted under secondary credentials.
  * AI Deduplication Engine combined Haversine geo-distance with cosine text similarity.
  * Automatically flagged and suppressed as an 84.2% duplicate of MH-FED-2026-SKILL-001!
  * Prevented duplicate payout of ₹ 48,000 in vocational stipend without human audit delay.

02:50 - 03:30 | ACT 5: MSInS QUAD-HELIX INNOVATION BRIDGE & CLOSING SUMMARY
--------------------------------------------------------------------------------------------------
- Screen: Open MSInS University Collaboration view.
- Visual: Unresolved state bottlenecks (e.g. Gadchiroli tribal telehealth drone corridor) are seamlessly
  routed to COEP Technological University and Tata Motors CSR for co-funded technical pilot deployment.
- Closing Statement: "MahaSetu bridges Maharashtra's digital silos, protects public funds, and delivers a
  frictionless citizen experience. Production-ready for deployment under MSInS."
```

---

## 4. Evaluator Step-by-Step Replication Protocol

1. Open your browser and navigate to `http://localhost:5173`.
2. Click **"⚡ Interoperability Middleware Studio"** or log in with `government@sihportal.com` / `Government@123`.
3. In the sidebar, click **"⚡ InterOp Studio (PS 26129)"**:
   - Test **"📡 Test Ping"** on any connector card to see live round-trip latency.
   - Switch to **"📋 Live API Exchange"** and click **"Inspect Payload"** to see XML-to-JSON-LD translation.
   - Switch to **"🧪 Inter-Agency Payload Simulator"** and click **"🚀 Execute Exchange"** to generate a live SHA-256 signed transaction.
4. Log out and log in as `citizen@sihportal.com` / `Citizen@123`:
   - Click **"📝 Report a Problem"**.
   - Click **"🔗 Fetch from DigiLocker"** in the top blue banner and observe instant auto-fill without file uploads!
   - Click **"📋 My Problems"** to verify the universal **FEDERATED TRACKING ID (`MH-2026-APP-8841`)**.
