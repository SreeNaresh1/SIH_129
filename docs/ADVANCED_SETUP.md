# SIH Portal — Advanced Upgrade

This version keeps the working citizen/government/university workflow and adds a real database-backed advanced layer.

## Added backend tables
Users, Problems, Universities, UniversityExpertise, Faculty, StudentTeams, TeamMembers, Projects, Proposals, Mentors, Milestones, PrototypeTests, Implementations, IndustryPartners, Collaborations, Funding, Messages, Notifications, Reviews, ImpactMetrics, IPRecords, ResearchProjects.

## Added advanced capabilities
- Real local AI classification using Hugging Face zero-shot inference.
- Sentence-transformer service prepared for semantic duplicate detection.
- AI-assisted priority scoring with an auditable breakdown.
- University expertise matching.
- Government-only university assignment endpoint.
- Industry partner and CSR/funding records.
- Persistent notifications.
- Persistent project messaging.
- Milestone CRUD.
- District/domain analytics.
- Impact metrics.
- Patent/IP/technology-transfer records.
- Research project records.
- PWA/mobile-ready architecture can be added without changing the API.

## 1. Backend
Open a terminal in `server`:

```bash
npm install
npm run dev
```

If you need the protected government account:

```bash
npm run create:government
```

Then seed university profiles/expertise:

```bash
npm run seed:advanced
```

The development server uses `sequelize.sync({ alter: true })` to add the advanced columns/tables to the existing MySQL database. Back up important development data before running it.

## 2. AI service
Open a second terminal:

```bash
cd ai-service
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Then:

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

The first startup downloads the configured Hugging Face models. The default zero-shot model is `typeform/distilbert-base-uncased-mnli`; the embedding model is `sentence-transformers/all-MiniLM-L6-v2`.

If the AI service is stopped, citizen submission still works; the problem stays in `AI Analysis Pending` until the government/university manually triggers AI analysis.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

New pages:
- `/admin/advanced`
- `/industry`
- `/notifications`
- `/collaboration`

## Important implementation note

The current workflow pages that historically stored proposal/team/mentor/prototype/implementation/completion data in localStorage are intentionally not deleted in this upgrade. The new database schema and APIs are the migration foundation. The next migration step is to wire each existing workflow page to `Projects`, `StudentTeams`, `Mentors`, `Proposals`, `PrototypeTests`, `Implementations`, and `Milestones`, then remove the old localStorage writes.

## AI duplicate detection

The AI service already includes semantic embeddings and a `/similarity` endpoint. The backend's next hardening step is to call it against recent Problems before final approval and store `duplicateOf` / `duplicateSimilarity`. This is kept separate from classification so a demo can show the actual similarity evidence rather than pretending keyword matching is AI.
