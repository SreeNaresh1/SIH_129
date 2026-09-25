# Government Heat Map + Severity Adjustment

## What was added
- Real interactive OpenStreetMap base map using Leaflet loaded in the browser.
- Heatmap weighted by complaint priority score.
- GPS coordinates are used when available. Records without GPS use an approximate district center and are labeled approximate in the popup.
- Government priority queue is sorted highest priority score first.
- Government can adjust severity and a numeric severity score from 0-100, with an audit note.
- The adjustment is persisted in MySQL and recalculates priorityScore, so the queue and heat map update.

## Database
Run `server/migrations/add_problem_classification_fields.sql` once against `sih_portal`. If some columns already exist, remove those ADD COLUMN lines before running.

## Start
AI: `cd ai-service && source .venv/Scripts/activate && python -m uvicorn app:app --reload --port 8000`
Backend: `cd server && npm run dev`
Frontend: `cd frontend && npm run dev`

The map needs internet access to load OpenStreetMap tiles and Leaflet scripts.
