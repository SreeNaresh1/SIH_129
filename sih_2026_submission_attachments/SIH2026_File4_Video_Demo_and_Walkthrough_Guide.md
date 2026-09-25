# SMART INDIA HACKATHON 2026 — DEMO VIDEO WALKTHROUGH & TEST GUIDE
## Video Demonstration Script & Evaluator Replication Protocol (SIH-43)

---

## 1. Demo Video Overview & Access Links

This document provides the time-stamped video walkthrough and live replication steps for the SIH 2026 Evaluation Committee to verify all 4 stakeholder portals and innovative features.

- **Recommended Demo Video Length:** 3 Minutes 30 Seconds
- **Pre-Recorded Demonstration WebP/MP4 Artifacts:** Located in your project artifacts directory:
  - `gov_portal_demo_1790306664821.webp` (Government Dashboard & Analytics)
  - `jharkhand_sih_demo_1790276636781.webp` (End-to-End Quad-Helix Collaboration)
  - `ollama_verification_1790280164662.webp` (Live Local AI Pre-Screening Demonstration)

---

## 2. Pre-Seeded Evaluator Accounts (Instant Login)

All 4 stakeholder roles are pre-seeded in the local database. Evaluators can log into any portal using the credentials below:

| Role | Email Address | Password | Primary Portal URL |
|---|---|---|---|
| **🏛️ State Government Admin** | `government@sihportal.com` | `password123` | `http://localhost:5173/admin` |
| **👤 Citizen Reporter** | `citizen@sihportal.com` | `password123` | `http://localhost:5173/citizen` |
| **🎓 University Innovation Cell** | `university@sihportal.com` | `password123` | `http://localhost:5173/university` |
| **🏢 Corporate Industry CSR** | `industry@sihportal.com` | `password123` | `http://localhost:5173/industry` |

---

## 3. Time-Stamped Walkthrough Script (3:30 Video Demonstration)

```
00:00 - 00:30 | INTRODUCTION & THE JHARKHAND CONTEXT
--------------------------------------------------------------------------------------------------
- Narrator: "Welcome to the Jharkhand Societal Innovation Collaboration Portal, solving SIH-43."
- Visual: Landing page with Jharkhand state development focus areas (Water, Mining, Agri, Energy).
- Problem Context: Highlighting the disconnect between rural citizen challenges, academic university
  research capabilities, and corporate CSR funding.

00:30 - 01:10 | ACT 1: CITIZEN REPORTING & SMART AI GATEKEEPER
--------------------------------------------------------------------------------------------------
- Screen: Citizen enters "Fluoride Contamination in Drinking Water Wells in Sonahatu, Ranchi".
- Action: Citizen clicks "Run AI Analysis" before submission.
- Innovation Showcase: Local AI pre-screening instantly extracts:
  * Category: Water & Sanitation
  * Severity Score: 88/100 (Critical)
  * Duplicate Check: Geo-semantic engine verifies nearby radius (< 5 km)
  * Cryptographic Audit: Displays generated SHA-256 evidence integrity hash.
- Citizen clicks Submit Challenge.

01:10 - 01:50 | ACT 2: GOVERNMENT EXECUTIVE DASHBOARD & 1-CLICK DPR
--------------------------------------------------------------------------------------------------
- Screen: Login as government@sihportal.com.
- Visual: Executive KPIs showing 24 District vulnerability rankings, domain distribution bar charts,
  and active challenge triage status.
- Innovation Showcase: Admin opens the submitted Ranchi water challenge and clicks
  "Generate 1-Click Solution Blueprint & Budget DPR".
  * Instant generation of technical architecture, IoT sensor specifications, and milestone schedule.
  * Displays the Statutory 45:45:10 Co-Funding Mobilization breakdown (DMFT: ₹28.08L, CSR: ₹28.08L, Univ: ₹6.24L).
- Admin approves challenge and confirms university routing.

01:50 - 02:30 | ACT 3: UNIVERSITY WORKFLOW & FACULTY MENTORSHIP
--------------------------------------------------------------------------------------------------
- Screen: Login as university@sihportal.com (BIT Mesra / IIT ISM Dhanbad).
- Visual: University receives the challenge matched to their Environmental Engineering & IoT labs.
- Workflow Execution:
  1. Form Student Team (Multidisciplinary team formed with lead & members).
  2. Assign Faculty Mentor (Dr. Ananya Roy, Sensor & Hydrology Specialist).
  3. Submit Solution Proposal (Smart Drinking Water Monitoring System).
  4. Prototype Testing (Field sensor calibration logs and results).
  5. Implementation & NEP 2020 Completion (Patent filed, direct beneficiaries logged).

02:30 - 03:00 | ACT 4: INDUSTRY CSR PARTNERSHIP & TECH TRANSFER
--------------------------------------------------------------------------------------------------
- Screen: Login as industry@sihportal.com (Tata Steel CSR / Central Coalfields).
- Visual: Industry dashboard displays approved university proposals requiring co-funding & pilot scaling.
- Action: Industry partner reviews technical proposal, commits 45% CSR matching funds, and signs
  technology handover agreement.

03:00 - 03:30 | ACT 5: REAL-TIME STAKEHOLDER CHAT & CLOSING IMPACT
--------------------------------------------------------------------------------------------------
- Visual: Showing the embedded Stakeholder Chat thread inside the problem workspace.
- Interaction: Live messages between Government Officer, Faculty Mentor, Student Lead, and CSR Head.
- Closing Screen: Final executive analytics summary highlighting:
  * 14,850+ citizens impacted
  * 21-day average turnaround
  * Full alignment with National Education Policy (NEP 2020).
```

---

## 4. One-Line Terminal Command to Run the Complete Platform

```powershell
# Open terminal in project root and launch both server & frontend:
cd "c:\Users\Sree Naresh A\Downloads\SIH-43-main\SIH-43-main"
# Terminal 1: Backend
npm --prefix server start
# Terminal 2: Frontend
npm --prefix frontend run dev
```
- Frontend will be live at: **`http://localhost:5173`**
- REST API will be live at: **`http://localhost:5000`**
