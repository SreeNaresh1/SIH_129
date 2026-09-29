# MahaSetu (MUIF) — Maharashtra Unified Interoperability Framework
## Federated Service Delivery Architecture & Non-Invasive Digital Integration Layer

> **Smart India Hackathon 2026 Official Submission**  
> **Problem Statement ID:** `26129`  
> **Problem Statement Title:** *System integration and interoperability among government digital platforms, resulting in fragmented service delivery*  
> **Organization:** Government of Maharashtra  
> **Department:** Maharashtra State Innovation Society (MSInS), Department of Skills, Employment, Entrepreneurship and Innovation  
> **Category / Theme:** Software / Smart Governance & Interoperability  

---

## 🏛️ Executive Summary

Government departments in Maharashtra operate numerous portals, mobile applications, registries, workflow systems, and databases developed independently over decades (e.g., **MahaSwayam** for vocational skills, **MahaDBT** for scholarships/subsidies, **Aaple Sarkar** for citizen services and grievances, and **DigiLocker** for digital credentials). 

Due to divergent data formats (XML, SOAP, JSON, SQL), fragmented identifiers, and uncoordinated authentication methods:
- **Citizens & Businesses** are forced to repeatedly submit the same certificates, track status across multiple disjoint portals, and make physical visits to government offices.
- **State Officials** lack a consolidated, 360-degree view of beneficiaries, applications, duplicate claims, and cross-departmental service outcomes.
- **Complete System Replacement** is financially unfeasible, operationally disruptive, and legally complex.

**MahaSetu** solves this crisis through a **non-invasive, standards-based interoperability framework and federated middleware layer**. It bridges legacy and modern government platforms without requiring changes to underlying departmental databases, providing:
1. **API-Based Data Exchange & IndEA v2.0 Schema Translators** (bi-directional XML/SOAP ➔ JSON-LD).
2. **Single-Window Resident Experience ("One State, One Profile")** with **DEPA 2.0 Consent-Based Master Data Sharing** (zero repetitive document uploads).
3. **Automated Cross-Portal AI Deduplication & Fraud Detection** (preventing duplicate subsidy claims across portals).
4. **Configurable Workflow Orchestrator & Inter-Agency Message Bus** (automated handoffs and SLA compliance tracking).
5. **Immutable SHA-256 Cryptographic Audit Logs & Exception Handling Queue**.
6. **MSInS R&D Innovation Bridge** connecting complex public service bottlenecks with premier Maharashtra universities (COEP, VJTI, VNIT) and Corporate CSR consortiums (Tata Motors, Mahindra, Forbes Marshall).

---

## 📁 Repository Structure

```text
MahaSetu_PS26129/
├── .github/                       # GitHub actions and CI/CD pipelines
├── ai-service/                    # Python FastAPI AI Microservice
│   ├── ai_service.py              # LLM inference, schema classification & deduplication
│   ├── app.py                     # FastAPI REST API endpoints
│   └── requirements.txt           # Python dependencies
├── docs/                          # Architectural & Deployment Documentation
│   ├── INTEROPERABILITY_SPEC.md   # IndEA v2.0 & API Connector Specifications
│   ├── DEPA_CONSENT_GUIDE.md      # Citizen Consent-based Data Sharing Architecture
│   └── DEPLOYMENT_GUIDE.md        # Production Cloud Deployment Guide
├── frontend/                      # Vite + React 19 Client SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── InterOpHub.jsx         # ⚡ MahaSetu Interoperability Studio & Topology
│   │   │   │   ├── AdminDashboard.jsx     # Statewide Nodal Operations & 36-District SLA Heatmap
│   │   │   │   └── GovernmentReview.jsx   # 360° Beneficiary Review & Cross-Agency Verification
│   │   │   ├── citizen/
│   │   │   │   ├── ReportProblem.jsx      # Single Window Service Application + DEPA Consent Auto-Fill
│   │   │   │   ├── MyProblems.jsx         # Universal Federated Tracking (MH-FED-2026-XXXX)
│   │   │   │   └── CitizenDashboard.jsx   # Resident Single-Window Overview & Active Grants
│   │   │   ├── Login.jsx                  # 3-Persona Unified Authentication (Citizen, Govt, InterOp)
│   │   │   └── Notifications.jsx          # Cross-Agency SLA Alerts & Event Stream
│   │   ├── App.jsx                        # Interactive MahaSetu Home & Protected Routes
│   │   └── api.js                         # Axios HTTP Client with Auth Interceptors
│   └── vite.config.js             # Vite Bundler Configuration
├── server/                        # Node.js + Express REST API Backend
│   ├── config/database.js         # SQLite / MySQL Sequelize ORM Configuration
│   ├── models/                    # Data Models
│   │   ├── PortalConnector.js     # Legacy & Modern System Connectors Registry
│   │   ├── ConsentRecord.js       # DEPA 2.0 Citizen Consent Artifacts
│   │   ├── DataExchangeLog.js     # Inter-Agency API Transactions & SHA-256 Hashes
│   │   ├── WorkflowPipeline.js    # Configurable Orchestration Pipelines
│   │   └── Problem.js             # Unified Application & Grievance Schema
│   ├── routes/
│   │   ├── interop.js             # ⚡ Interoperability, Connectors, Logs & DEPA APIs
│   │   ├── problems.js            # Unified Applications, AI Triage & Deduplication
│   │   ├── auth.js                # Multi-Role JWT & Federated Identity Auth
│   │   └── advanced.js            # GIS Heatmap, Blueprint DPR & MSInS University Bridge
│   ├── services/
│   │   ├── aiService.js           # Local Qwen2.5-7B LLM / Resilient Deterministic Fallback
│   │   ├── duplicateEngine.js     # Geo-Semantic Deduplication Engine
│   │   └── matchingEngine.js      # MSInS Transparent 6-Factor Capability Matcher
│   ├── database.sqlite            # Pre-seeded Database for Zero-Config Evaluation
│   ├── seedDemoData.js            # Automated Database Seeder for Maharashtra Scenarios
│   └── server.js                  # Main Express Application Entry Point
├── sih_2026_submission_attachments/ # Official SIH 2026 Submission Deliverables
│   ├── SIH2026_File1_Project_Datasheet.md
│   ├── SIH2026_File2_AI_Benchmark_and_Test_Results.md
│   ├── SIH2026_File3_Executive_Poster_and_Architecture.md
│   ├── SIH2026_File4_Video_Demo_and_Walkthrough_Guide.md
│   └── SIH2026_File5_MultiStakeholder_Screenshot_Portfolio.md
└── README.md                      # Comprehensive Project Documentation
```

---

## ⚡ Core Interoperability Features (Mapped to PS 26129)

### 1. Reusable Connectors for Legacy & Modern Systems
Out-of-the-box bi-directional connectors for Maharashtra state infrastructure:
- **MahaSwayam Portal:** Vocational Training, Apprenticeships, ITI credentials (REST / JSON).
- **MahaDBT Benefits Registry:** Direct Benefit Transfer, Post-Matric Scholarships, Caste Validation (SOAP/XML with IndEA wrapper).
- **Aaple Sarkar RTS:** Right to Services, Citizen Grievance Redressal, 7/12 Land Records (Webhook / REST).
- **DigiLocker / MahaOnline Resident Data Hub:** Verified identity, domicile, and academic certificates (DEPA 2.0 / OAuth 2.0).
- **Directorate of Higher & Technical Education (DHE):** State University & Engineering College Registry.
- **MahaRERA & Mahabhumi:** Cadastral GIS and physical address verification.

### 2. Common Data Standards (IndEA v2.0 JSON-LD)
Legacy XML payloads (e.g. `<Applicant>Aniket Patil</Applicant><Caste>OBC</Caste>`) are dynamically transformed into standardized **IndEA v2.0 JSON-LD** objects with semantic contexts and verifiable schemas.

### 3. DEPA 2.0 Consent-Based Master Data Sharing ("Zero Re-submission")
When applying for state benefits or filing grievances, citizens click **"Fetch from DigiLocker"**. A cryptographic consent artifact is generated, sharing pre-verified credentials directly between departments. The citizen never has to upload duplicate documents or visit multiple physical offices.

### 4. Cross-Portal AI Deduplication & Fraud Detection
Using the Haversine spatial formula ($\Delta r \le 5\text{ km}$) and deep semantic similarity vectors, MahaSetu detects duplicate claims across disparate departmental portals in real time. In our testbed, **MH-FED-2026-SKILL-008** was automatically flagged as an **84.2% duplicate** of **MH-FED-2026-SKILL-001**, preventing fraudulent dual disbursements.

### 5. Configurable Workflow Orchestrator & Live Audit Stream
Orchestrates multi-agency workflows (e.g. MahaSwayam Intake ➔ DigiLocker Verification ➔ MahaDBT Budget Sanction ➔ Treasury Disbursement). Every inter-agency exchange is logged with latency, data quality scores (0-100), and an immutable **SHA-256 cryptographic proof hash**.

---

## 🚀 Quick Start Guide (Zero-Config Testing)

### 1. Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)
- Pre-seeded SQLite database included out-of-the-box (`database.sqlite`)

### 2. Start the Backend Server
```bash
cd server
npm install
node seedDemoData.js   # Seeds Maharashtra departments, connectors, and 8 live scenarios
npm run dev            # Starts backend on http://localhost:5000
```

### 3. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev            # Starts Vite React client on http://localhost:5173
```

---

## 👥 Demo Evaluation Accounts (Pre-Seeded)

| Persona / Stakeholder | Email | Password | Role & Features |
|---|---|---|---|
| **State Nodal Administrator (MSInS)** | `government@sihportal.com` | `Government@123` | **MahaSetu Interoperability Studio**, Live API Exchange Stream, Connector Topology, SLA Heatmaps |
| **Citizen Applicant (Aniket Patil)** | `citizen@sihportal.com` | `Citizen@123` | **Single-Window Portal**, DEPA Consent Auto-Fill, Universal Tracking (`MH-2026-APP-8841`) |
| **COEP Tech University Lead** | `university@sihportal.com` | `University@123` | MSInS Academic R&D Cell, Student Teaming, Prototype Testing & Patent Tracking |
| **Tata Motors / Forbes Marshall CSR** | `industry@sihportal.com` | `Industry@123` | CSR Co-Funding Matching, Apprenticeship Sponsorship, Pilot Deployment |

---

## 📋 Pre-Seeded Demonstration Scenarios (Maharashtra 36 Districts)

1. **MH-FED-2026-SKILL-001 (Pune):** Apprenticeship Incentive & ITI Verification Discrepancy between MahaSwayam and MahaDBT.
2. **MH-FED-2026-WATER-002 (Nashik):** Rural Drinking Water Pipeline Rupture & Contamination under Jal Jeevan Mission.
3. **MH-FED-2026-HEALTH-003 (Gadchiroli):** Remote Tribal Primary Healthcare Center Telemedicine Deficit.
4. **MH-FED-2026-AGRI-004 (Chhatrapati Sambhajinagar):** Marathwada Micro-Irrigation Deficit & Solar Feeder Subsidy Alignment.
5. **MH-FED-2026-EDU-005 (Nandurbar):** Zilla Parishad Tribal Bilingual Digital Classroom Infrastructure.
6. **MH-FED-2026-SAN-006 (Nagpur):** Industrial Solid Waste & Slag Accumulation in Butibori MIDC.
7. **MH-FED-2026-INFRA-007 (Raigad):** Collapsed Coastal Creek Culvert Isolating Fisherfolk Hamlets.
8. **MH-FED-2026-SKILL-008 (Pune - Duplicate):** Duplicate Apprenticeship Claim flagged by AI Deduplication Engine (**84.2% match**).

---

## 🌐 Key API Endpoints Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/interop/connectors` | `GET` | List all 6 legacy and modern registered system connectors |
| `/api/interop/connectors/test/:id` | `POST` | Live handshake & ping latency test for specified connector |
| `/api/interop/exchange-logs` | `GET` | Retrieve audited inter-agency API transactions & SHA-256 hashes |
| `/api/interop/simulate-exchange` | `POST` | Real-time XML/SOAP to IndEA JSON-LD transformation simulation |
| `/api/interop/master-data/lookup` | `GET` | Consent-based resident master record lookup (DigiLocker) |
| `/api/interop/consent/grant` | `POST` | Issue cryptographically signed DEPA 2.0 consent token |
| `/api/interop/tracking/:id` | `GET` | Universal multi-department progress tracking by trackingId |
| `/api/interop/metrics` | `GET` | Statewide interoperability, latency, and duplicate suppression metrics |

---

## 🏆 SIH 2026 Evaluation Highlights

- **100% Problem Coverage:** Directly implements all 10 requirements of Problem Statement 26129.
- **Working Production Code:** Fully functional React 19 SPA, Express REST engine, and live SQLite/MySQL relational storage.
- **Non-Invasive Architecture:** Seamlessly connects legacy government portals without requiring database overhauls.
- **Enterprise Standards:** Compliant with India Enterprise Architecture (IndEA v2.0), DEPA 2.0, Open API 3.0, and SHA-256 cryptographic verification.
