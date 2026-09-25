# Jharkhand Societal Challenge Platform (SIH-43)
## Explainable AI-Based Multi-Stakeholder Societal Challenge Matching

A collaborative platform designed for the state of Jharkhand that empowers citizens to report real-world societal problems (water, healthcare, agriculture, education, sanitation, environment, infrastructure, rural livelihood, accessibility, and public services) and connects them with appropriate stakeholders:
1. **Government Departments**
2. **Universities, Faculty, and Student Research Teams**
3. **Industry & Corporate CSR Organizations**
4. **NGOs and Civil Society Organizations**

---

## 📁 Repository Structure

```text
SIH_43/
├── .github/                       # GitHub workflows and repository config
├── ai-service/                    # Python FastAPI AI Microservice
│   ├── data/                      # Societal problem training/benchmark datasets
│   ├── ai_service.py              # LLM inference & keyword matching pipelines
│   ├── app.py                     # FastAPI REST API endpoints
│   ├── requirements.txt           # Python package dependencies
│   └── train.py                   # Local classifier training utilities
├── docs/                          # Guides and Architectural Documentation
│   ├── DEPLOYMENT_GUIDE.md        # Comprehensive Cloud & Production Deployment Guide
│   ├── ADVANCED_SETUP.md          # Database schema & advanced features guide
│   ├── AI_CLASSIFICATION_SETUP.md # Zero-shot classification & citizen submission workflow
│   └── GOVERNMENT_HEATMAP_SETUP.md# OpenStreetMap Leaflet GIS heatmap & severity engine
├── frontend/                      # Vite + React 19 Client SPA
│   ├── public/                    # Static SVG/icon assets
│   ├── src/                       # React components, pages, routes, API clients
│   │   ├── components/            # UI widgets (Evidence layer, Blueprints, Chat)
│   │   ├── pages/                 # Citizen, Government, University & Industry dashboards
│   │   └── api.js                 # Centralized HTTP API client with auth interceptors
│   ├── .env.example               # Frontend environment template
│   └── vite.config.js             # Vite bundler configuration
├── scripts/                       # Developer automation utilities
│   └── convert_to_pdf.js          # Headless report to PDF conversion script
├── server/                        # Node.js + Express REST API Backend
│   ├── config/                    # Sequelize SQLite/MySQL database configuration
│   ├── data/                      # Prototype knowledge base & capability profiles
│   ├── middleware/                # JWT authentication & Multer upload middlewares
│   ├── models/                    # Sequelize ORM data models
│   ├── routes/                    # Express route controllers (Auth, Problems, Advanced)
│   ├── services/                  # AI matching, blueprint & duplicate engines
│   ├── uploads/                   # User upload storage (.gitkeep preserved)
│   ├── .env.example               # Backend environment variables template
│   ├── database.sqlite            # Pre-seeded SQLite database for zero-config testing
│   ├── seedDemoData.js            # Demo seeder for accounts and challenges
│   └── server.js                  # Main Express application entry point
├── sih_2026_submission_attachments/ # Official SIH 2026 evaluation attachments
│   ├── demo_videos/               # Multi-stakeholder demonstration screen captures
│   ├── screenshots/               # High-resolution application screenshots
│   └── *.pdf / *.md               # Official project datasheets and benchmark reports
├── .env.example                   # Root environment configuration reference
├── .gitignore                     # Git ignore rules for node_modules, logs, models
└── README.md                      # Project documentation and quick start guide
```

---

## 📌 Core Differentiator: Explainable AI-Based Multi-Stakeholder Matching

Unlike generic matching systems or black-box LLM hallucinations:
- **No Hallucinated Stakeholders**: The AI model is strictly constrained to challenge understanding, classification, requirement extraction, and severity assessment. It never invents universities or partner companies.
- **Explainable Matching Engine**: Stakeholder recommendations are calculated by a deterministic, transparent matching algorithm using structured capability profiles.
- **Auditable Component Breakdown**: Every match displays a verifiable "Compatibility score" accompanied by component scores (Domain, Expertise, Projects, Technology, Sector, Proximity) and checkmarked reasons (`✓`).

---

## 🧠 Dataset, Model & Architecture Explanation

> **Important Disclosure**:
> We use a pretrained **Qwen2.5-7B-Instruct** model for structured challenge analysis. No model training or fine-tuning is required for this prototype. Our domain-specific knowledge base contains societal challenge categories and stakeholder capability profiles. The knowledge base is used by the transparent matching layer to produce recommendations.

We strictly distinguish the three architectural tiers:
1. **Pretrained Instruction-Following LLM (Qwen2.5-7B-Instruct)**:
   - Extrapolates problem requirements, identifies domain/sub-domain, estimates AI-assessed severity on a 1-10 scale, extracts required expertise and technologies, and suggests immediate recommended actions.
   - Modular adapter architecture (`AI_PROVIDER=local_qwen`, `hosted_qwen`, or deterministic offline engine).
2. **Domain Knowledge Base**:
   - Structured prototype database containing capability profiles for 12 Universities & Departments, 8 Government Departments, 7 Industry/CSR Partners, and 7 NGOs across all 10 societal domains.
   - Clearly flagged as prototype/sample data (`isPrototypeSampleData: true`).
3. **Transparent Matching Engine**:
   - Deterministic 6-factor weighting formula:
     - **Semantic / Domain Relevance**: 35%
     - **Expertise Match**: 25%
     - **Previous Project Relevance**: 15%
     - **Required Technology & Resources**: 10%
     - **Sector Relevance**: 10%
     - **Geographic Proximity**: 5%
   - Generates component scores and human-readable, auditable match reasons.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+) with `fastapi`, `uvicorn`, `pydantic` (optional, fallback available)
- SQLite (included out-of-the-box) or MySQL

### 2. Backend Server Setup
```bash
cd server
npm install
node seedDemoData.js   # Seeds users, prototype stakeholders, and 9 demo challenges
npm run dev            # Starts backend on http://localhost:5000
```

### 3. AI Microservice Setup (Optional - Zero-Downtime Fallback Included)
```bash
cd ai-service
# Activate python environment
uvicorn app:app --port 8000 --reload
```
*Note: If the Python AI service is stopped, the backend's resilient adapter seamlessly uses its internal deterministic inference engine, ensuring zero downtime.*

### 4. Frontend Web App Setup
```bash
cd frontend
npm install
npm run dev            # Starts Vite frontend on http://localhost:5173
```

---

## 🌐 Deployment Options

For complete details, step-by-step guides, and configuration snippets, see the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

| Tier | Component | Recommended Platforms | Notes |
|---|---|---|---|
| **Frontend** | React SPA | **Vercel**, **Cloudflare Pages**, **Netlify** | Connect GitHub repository, set root to `frontend`, output `dist`, and set `VITE_API_URL`. |
| **Backend** | Node.js Express API | **Render**, **Railway**, **Fly.io**, **AWS EC2** | Set root to `server`, build `npm install`, start `npm start`. Supports both SQLite & MySQL. |
| **AI Service** | FastAPI Python | **Render**, **Railway**, **Hugging Face Spaces** | Set root to `ai-service`, install `requirements.txt`, run `uvicorn app:app`. |
| **Database** | Relational DB | **SQLite** (single instance) or **Railway / AWS RDS MySQL** | Set `DB_DIALECT=sqlite` or `mysql` in `server/.env`. |

---

## 👥 Demo User Accounts (Pre-Seeded)

| Role | Email | Password |
|---|---|---|
| **Government Administrator** | `government@sihportal.com` | `Government@123` |
| **Citizen Reporter** | `citizen@sihportal.com` | `Citizen@123` |
| **University Research Lead** | `university@sihportal.com` | `University@123` |
| **Industry / CSR Partner** | `industry@sihportal.com` | `Industry@123` |

---

## 📋 Pre-Seeded Demonstration Scenarios

1. **Water Contamination**: Contaminated drinking water in hand pumps near Dumka (*Domain: Water Management, Severity: 8/10*).
2. **Rural Healthcare Access**: Lack of maternal and emergency healthcare in West Singhbhum (*Domain: Healthcare, Severity: 9/10*).
3. **Agricultural Irrigation**: Severe dry-season irrigation deficit in Palamu (*Domain: Agriculture, Severity: 7/10*).
4. **School Infrastructure**: Collapsing roof and lack of sanitation in Garhwa primary school (*Domain: Education, Severity: 8/10*).
5. **Solid Waste Management**: Unregulated municipal waste dumping in Dhanbad coal belt (*Domain: Sanitation, Severity: 7/10*).
6. **Rural Road Connectivity**: Broken culvert disconnecting 4 tribal hamlets during monsoons in Latehar (*Domain: Infrastructure, Severity: 8/10*).
7. **Industrial Stream Pollution**: Chemical effluent discharge into local river in Bokaro (*Domain: Environment, Severity: 8/10*).
8. **Disability Accessibility**: Inaccessible government district hospital in Ranchi (*Domain: Accessibility, Severity: 6/10*).
9. **Water Contamination Duplicate Report**: Second citizen report in Dumka demonstrating correlated duplicate detection (*76% similarity*).

---

## 🔄 Lifecycle Stages
`Reported` → `AI Analyzed` → `Verified` → `Multi-Stakeholder Matching` → `Assigned` → `Solution Proposed` → `Expert Review` → `Pilot / Implementation` → `Resolved`

---

## 📚 Detailed Documentation Links
- [Production & Cloud Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Advanced Schema & Capabilities Guide](docs/ADVANCED_SETUP.md)
- [AI Classification & Citizen Workflow Guide](docs/AI_CLASSIFICATION_SETUP.md)
- [Government Heatmap & GIS Queue Setup](docs/GOVERNMENT_HEATMAP_SETUP.md)
