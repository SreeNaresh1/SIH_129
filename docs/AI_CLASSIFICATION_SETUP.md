# AI Classification + Citizen Submission Update

Citizen title + description -> Analyze with AI -> Domain/Sub-domain/Sector/Severity are recommended -> citizen can change them -> final values are saved.

Run server/migrations/add_problem_classification_fields.sql once if the columns do not exist.

AI: cd ai-service; source .venv/Scripts/activate; python -m uvicorn app:app --reload --port 8000
Backend: cd server; npm run dev
Frontend: cd frontend; npm run dev
