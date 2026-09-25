# Jharkhand Societal Challenge Platform
## Explainable AI-based Multi-Stakeholder Societal Challenge Matching

A collaborative platform designed for the state of Jharkhand that empowers citizens to report real-world societal problems (water, healthcare, agriculture, education, sanitation, environment, infrastructure, rural livelihood, accessibility, and public services) and connects them with appropriate stakeholders:
1. **Government Departments**
2. **Universities, Faculty, and Student Research Teams**
3. **Industry & CSR Organizations**
4. **NGOs and Civil Society Organizations**

---

## 📌 Core Differentiator: Explainable AI-based Multi-Stakeholder Matching

Unlike generic matching systems or black-box LLM hallucinations:
- **No Hallucinated Stakeholders**: The AI model is strictly constrained to challenge understanding, classification, requirement extraction, and severity assessment. It never invents universities or partner companies.
- **Explainable Matching Engine**: Stakeholder recommendations are calculated by a deterministic, transparent matching algorithm using structured capability profiles.
- **Auditable Component Breakdown**: Every match displays a verifiable "Compatibility score" accompanied by component scores (Domain, Expertise, Projects, Technology, Sector, Proximity) and checkmarked reasons (`✓`).

---

## 🧠 Dataset, Model & Architecture Explanation (Mandatory Notice)

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
- **Python** (v3.10+) with `fastapi`, `uvicorn`, `pydantic`
- SQLite (included out-of-the-box) or MySQL

### 2. Backend Server Setup
```bash
cd server
npm install
node seedDemoData.js   # Seeds users, prototype stakeholders, and 9 demo challenges
npm run dev            # Starts backend on http://localhost:5000
```

### 3. AI Microservice Setup (Optional - Modular Fallback Included)
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

## 👥 Demo User Accounts (Pre-seeded)

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
